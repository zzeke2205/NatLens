-- Migration: 20261028000001_mission_and_redemption_functions.sql
-- Purpose:
--   1. Define verifiable mission criteria based on existing collection data.
--   2. Award mission points/tokens exactly once through a trusted RPC.
--   3. Redeem rewards atomically with balance and stock checks.
--
-- IMPORTANT:
--   Supported mission types in this migration:
--     - collect_species_count: collect at least target_value distinct species
--     - collect_species: collect the specific target_species_id
--     - collect_category_count: collect at least target_value species in target_category_id
--   These are verifiable from user_species_collection. Missions based on number of
--   scans, time spent, quizzes, or visits need additional event/answer tables and
--   validation logic before they can be offered.

-- =========================================================
-- 1. ADD VERIFIABLE MISSION CRITERIA
-- =========================================================

ALTER TABLE public.missions
    ADD COLUMN mission_type TEXT NOT NULL DEFAULT 'collect_species_count',
    ADD COLUMN target_value INTEGER NOT NULL DEFAULT 1,
    ADD COLUMN target_species_id UUID REFERENCES public.species(id) ON DELETE CASCADE,
    ADD COLUMN target_category_id UUID REFERENCES public.species_categories(id) ON DELETE CASCADE;

ALTER TABLE public.missions
    ADD CONSTRAINT missions_mission_type_check
        CHECK (mission_type IN (
            'collect_species_count',
            'collect_species',
            'collect_category_count'
        )),
    ADD CONSTRAINT missions_target_value_check
        CHECK (target_value >= 1),
    ADD CONSTRAINT missions_criteria_consistency_check
        CHECK (
            (mission_type = 'collect_species_count'
                AND target_species_id IS NULL
                AND target_category_id IS NULL)
            OR
            (mission_type = 'collect_species'
    		AND target_value = 1
    		AND target_species_id IS NOT NULL
    		AND target_category_id IS NULL)
            OR
            (mission_type = 'collect_category_count'
                AND target_species_id IS NULL
                AND target_category_id IS NOT NULL)
        );

CREATE INDEX idx_missions_target_species
    ON public.missions(target_species_id);

CREATE INDEX idx_missions_target_category
    ON public.missions(target_category_id);

-- =========================================================
-- 2. COMPLETE / REFRESH A USER MISSION
-- =========================================================

CREATE OR REPLACE FUNCTION public.complete_mission(p_mission_id UUID)
RETURNS TABLE (
    mission_id UUID,
    current_progress INTEGER,
    target_value INTEGER,
    is_completed BOOLEAN,
    points_awarded INTEGER,
    tokens_awarded INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_user_id UUID := auth.uid();
    v_mission public.missions%ROWTYPE;
    v_progress BIGINT := 0;
    v_already_completed BOOLEAN := FALSE;
    v_points_awarded INTEGER := 0;
    v_tokens_awarded INTEGER := 0;
BEGIN
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'You must be signed in to update mission progress.';
    END IF;

    -- Serialize mission/reward updates for this user and ensure the profile exists.
    PERFORM 1
    FROM public.profiles AS p
    WHERE p.id = v_user_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'User profile not found.';
    END IF;

    SELECT m.*
    INTO v_mission
    FROM public.missions AS m
    WHERE m.id = p_mission_id
      AND m.is_active = TRUE
      AND (m.start_at IS NULL OR m.start_at <= NOW())
      AND (m.end_at IS NULL OR m.end_at >= NOW());

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Mission not found, inactive, or outside its active period.';
    END IF;

    -- Progress is calculated by the database from verified collection records;
    -- the client cannot submit its own progress value.
    IF v_mission.mission_type = 'collect_species_count' THEN
        SELECT COUNT(*)
        INTO v_progress
        FROM public.user_species_collection AS usc
        WHERE usc.user_id = v_user_id;
    ELSIF v_mission.mission_type = 'collect_species' THEN
        SELECT COUNT(*)
        INTO v_progress
        FROM public.user_species_collection AS usc
        WHERE usc.user_id = v_user_id
          AND usc.species_id = v_mission.target_species_id;
    ELSIF v_mission.mission_type = 'collect_category_count' THEN
        SELECT COUNT(*)
        INTO v_progress
        FROM public.user_species_collection AS usc
        JOIN public.species AS s ON s.id = usc.species_id
        WHERE usc.user_id = v_user_id
          AND s.category_id = v_mission.target_category_id;
    ELSE
        -- Defensive guard in case the allowed mission types are changed later.
        RAISE EXCEPTION 'Unsupported mission type.';
    END IF;

    SELECT COALESCE(um.is_completed, FALSE)
    INTO v_already_completed
    FROM public.user_missions AS um
    WHERE um.user_id = v_user_id
      AND um.mission_id = v_mission.id;

    IF v_already_completed THEN
        RETURN QUERY SELECT
            v_mission.id,
            LEAST(v_progress, 2147483647)::INTEGER,
            v_mission.target_value,
            TRUE,
            0,
            0;
        RETURN;
    END IF;

    IF v_progress >= v_mission.target_value THEN
        v_points_awarded := v_mission.points_reward;
        v_tokens_awarded := v_mission.token_reward;

        INSERT INTO public.user_missions AS existing
            (user_id, mission_id, progress, is_completed, completed_at)
        VALUES
            (v_user_id, v_mission.id,
             LEAST(v_progress, 2147483647)::INTEGER, TRUE, NOW())
        ON CONFLICT ON CONSTRAINT user_missions_user_id_mission_id_key DO UPDATE
        SET progress = EXCLUDED.progress,
            is_completed = TRUE,
            completed_at = COALESCE(existing.completed_at, NOW());

        UPDATE public.profiles AS p
        SET total_points = p.total_points + v_points_awarded,
            token_balance = p.token_balance + v_tokens_awarded,
            updated_at = NOW()
        WHERE p.id = v_user_id;

        IF v_tokens_awarded > 0 THEN
            INSERT INTO public.token_transactions
                (user_id, amount, transaction_type, description)
            VALUES
                (v_user_id, v_tokens_awarded, 'earned',
                 'Mission reward: ' || v_mission.title);
        END IF;
    ELSE
        INSERT INTO public.user_missions
            (user_id, mission_id, progress, is_completed, completed_at)
        VALUES
            (v_user_id, v_mission.id,
             LEAST(v_progress, 2147483647)::INTEGER, FALSE, NULL)
        ON CONFLICT ON CONSTRAINT user_missions_user_id_mission_id_key DO UPDATE
        SET progress = EXCLUDED.progress
        WHERE public.user_missions.is_completed = FALSE;

        v_points_awarded := 0;
        v_tokens_awarded := 0;
    END IF;

    RETURN QUERY SELECT
        v_mission.id,
        LEAST(v_progress, 2147483647)::INTEGER,
        v_mission.target_value,
        (v_progress >= v_mission.target_value),
        v_points_awarded,
        v_tokens_awarded;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.complete_mission(UUID)
    FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.complete_mission(UUID)
    TO authenticated;

-- =========================================================
-- 3. REDEEM A REWARD ATOMICALLY
-- =========================================================

CREATE OR REPLACE FUNCTION public.redeem_reward(p_reward_id UUID)
RETURNS TABLE (
    redemption_id UUID,
    reward_id UUID,
    reward_name TEXT,
    tokens_spent INTEGER,
    redemption_status TEXT,
    remaining_token_balance INTEGER,
    remaining_stock INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_user_id UUID := auth.uid();
    v_reward public.rewards%ROWTYPE;
    v_balance INTEGER;
    v_redemption_id UUID;
BEGIN
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'You must be signed in to redeem a reward.';
    END IF;

    -- Lock the user's profile so simultaneous requests cannot overspend tokens.
    SELECT p.token_balance
    INTO v_balance
    FROM public.profiles AS p
    WHERE p.id = v_user_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'User profile not found.';
    END IF;

    -- Lock the reward row so simultaneous requests cannot oversell finite stock.
    SELECT r.*
    INTO v_reward
    FROM public.rewards AS r
    WHERE r.id = p_reward_id
      AND r.is_active = TRUE
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Reward not found or inactive.';
    END IF;

    IF v_reward.stock_quantity IS NOT NULL
       AND v_reward.stock_quantity <= 0 THEN
        RAISE EXCEPTION 'This reward is out of stock.';
    END IF;

    IF v_balance < v_reward.token_cost THEN
        RAISE EXCEPTION 'Insufficient token balance.';
    END IF;

    -- Reserve one item if stock is finite. NULL means unlimited stock.
    IF v_reward.stock_quantity IS NOT NULL THEN
        UPDATE public.rewards AS r
        SET stock_quantity = r.stock_quantity - 1
        WHERE r.id = v_reward.id;
    END IF;

    UPDATE public.profiles AS p
    SET token_balance = p.token_balance - v_reward.token_cost,
        updated_at = NOW()
    WHERE p.id = v_user_id
    RETURNING p.token_balance INTO v_balance;

    INSERT INTO public.redemptions
        (user_id, reward_id, tokens_spent, status)
    VALUES
        (v_user_id, v_reward.id, v_reward.token_cost, 'pending')
    RETURNING id INTO v_redemption_id;

    -- The schema prohibits zero-value token transactions, so record a spend
    -- transaction only when the reward has a positive token cost.
    IF v_reward.token_cost > 0 THEN
        INSERT INTO public.token_transactions
            (user_id, amount, transaction_type, description, redemption_id)
        VALUES
            (v_user_id, -v_reward.token_cost, 'spent',
             'Reward redemption: ' || v_reward.name, v_redemption_id);
    END IF;

    RETURN QUERY SELECT
        v_redemption_id,
        v_reward.id,
        v_reward.name,
        v_reward.token_cost,
        'pending'::TEXT,
        v_balance,
        CASE
            WHEN v_reward.stock_quantity IS NULL THEN NULL::INTEGER
            ELSE v_reward.stock_quantity - 1
        END;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.redeem_reward(UUID)
    FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.redeem_reward(UUID)
    TO authenticated;

-- =========================================================
-- IMPORTANT OPERATIONAL NOTES
-- =========================================================
-- A redemption starts as 'pending'; tokens are deducted and finite stock is
-- reserved immediately. A separate trusted staff/admin function must later
-- approve/fulfil it, or reject/cancel it while refunding tokens and restoring
-- stock exactly once. Do not allow clients to update redemption status directly.
--
-- These functions are transaction-safe: an exception rolls back the changes
-- made by that RPC call. They have not been deployed by this migration file.
