
-- =========================================================
-- NATLENS INITIAL DATABASE SCHEMA
-- Migration: 20261028000000_initial_schema.sql
-- =========================================================

-- 1. ZOOS
CREATE TABLE public.zoos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    address TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    image_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. SPECIES CATEGORIES
CREATE TABLE public.species_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. SPECIES
CREATE TABLE public.species (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID REFERENCES public.species_categories(id)
        ON DELETE SET NULL,
    common_name TEXT NOT NULL,
    scientific_name TEXT NOT NULL UNIQUE,
    description TEXT,
    habitat TEXT,
    diet TEXT,
    average_height TEXT,
    average_weight TEXT,
    conservation_status TEXT,
    cover_image_url TEXT,
    is_published BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. SPECIES EXHIBITED AT EACH ZOO
CREATE TABLE public.zoo_species (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    zoo_id UUID NOT NULL REFERENCES public.zoos(id)
        ON DELETE CASCADE,
    species_id UUID NOT NULL REFERENCES public.species(id)
        ON DELETE CASCADE,
    is_available BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (zoo_id, species_id)
);

-- 5. ADDITIONAL SPECIES IMAGES
CREATE TABLE public.species_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    species_id UUID NOT NULL REFERENCES public.species(id)
        ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    caption TEXT,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. SPECIES FUN FACTS
CREATE TABLE public.species_fun_facts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    species_id UUID NOT NULL REFERENCES public.species(id)
        ON DELETE CASCADE,
    fact TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. QR CODES
CREATE TABLE public.qr_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    zoo_species_id UUID NOT NULL REFERENCES public.zoo_species(id)
        ON DELETE CASCADE,
    code TEXT NOT NULL UNIQUE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. USER PROFILES
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id)
        ON DELETE CASCADE,
    username TEXT UNIQUE,
    display_name TEXT,
    avatar_url TEXT,
    total_points INTEGER NOT NULL DEFAULT 0
        CHECK (total_points >= 0),
    token_balance INTEGER NOT NULL DEFAULT 0
        CHECK (token_balance >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Automatically create a profile after Supabase Auth signup.
CREATE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    INSERT INTO public.profiles (id, username, display_name)
    VALUES (
        NEW.id,
        NULL,
        COALESCE(NEW.raw_user_meta_data ->> 'display_name', '')
    );

    RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- 9. USER SPECIES COLLECTION
-- The primary key prevents duplicate collection entries.
CREATE TABLE public.user_species_collection (
    user_id UUID NOT NULL REFERENCES public.profiles(id)
        ON DELETE CASCADE,
    species_id UUID NOT NULL REFERENCES public.species(id)
        ON DELETE CASCADE,
    discovered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, species_id)
);

-- Securely validate a QR code and unlock its species for the signed-in user.
-- Repeated scans return newly_unlocked = FALSE and do not duplicate records.
CREATE FUNCTION public.scan_qr_code(p_code TEXT)
RETURNS TABLE (
    species_id UUID,
    common_name TEXT,
    newly_unlocked BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_user_id UUID := auth.uid();
    v_species_id UUID;
    v_common_name TEXT;
    v_inserted_count INTEGER;
BEGIN
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'You must be signed in to scan a QR code.';
    END IF;

    SELECT s.id, s.common_name
    INTO v_species_id, v_common_name
    FROM public.qr_codes q
    JOIN public.zoo_species zs ON zs.id = q.zoo_species_id
    JOIN public.zoos z ON z.id = zs.zoo_id
    JOIN public.species s ON s.id = zs.species_id
    WHERE q.code = p_code
      AND q.is_active = TRUE
      AND zs.is_available = TRUE
      AND z.is_active = TRUE
      AND s.is_published = TRUE
    LIMIT 1;

    IF v_species_id IS NULL THEN
        RAISE EXCEPTION 'Invalid or inactive QR code.';
    END IF;

    INSERT INTO public.user_species_collection (user_id, species_id)
    VALUES (v_user_id, v_species_id)
    ON CONFLICT DO NOTHING;

    GET DIAGNOSTICS v_inserted_count = ROW_COUNT;

    RETURN QUERY
    SELECT v_species_id, v_common_name, (v_inserted_count > 0);
END;
$$;

REVOKE EXECUTE ON FUNCTION public.scan_qr_code(TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.scan_qr_code(TEXT) TO authenticated;

-- 10. MISSIONS
CREATE TABLE public.missions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    points_reward INTEGER NOT NULL DEFAULT 0
        CHECK (points_reward >= 0),
    token_reward INTEGER NOT NULL DEFAULT 0
        CHECK (token_reward >= 0),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    start_at TIMESTAMPTZ,
    end_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. USER MISSION PROGRESS
CREATE TABLE public.user_missions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id)
        ON DELETE CASCADE,
    mission_id UUID NOT NULL REFERENCES public.missions(id)
        ON DELETE CASCADE,
    progress INTEGER NOT NULL DEFAULT 0
        CHECK (progress >= 0),
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, mission_id)
);

-- 12. BADGES
CREATE TABLE public.badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    image_url TEXT,
    requirement_description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 13. USER BADGES
CREATE TABLE public.user_badges (
    user_id UUID NOT NULL REFERENCES public.profiles(id)
        ON DELETE CASCADE,
    badge_id UUID NOT NULL REFERENCES public.badges(id)
        ON DELETE CASCADE,
    earned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, badge_id)
);

-- 14. REWARDS
CREATE TABLE public.rewards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    token_cost INTEGER NOT NULL CHECK (token_cost >= 0),
    stock_quantity INTEGER CHECK (stock_quantity >= 0),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 15. REDEMPTIONS
CREATE TABLE public.redemptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id),
    reward_id UUID NOT NULL REFERENCES public.rewards(id),
    tokens_spent INTEGER NOT NULL CHECK (tokens_spent >= 0),
    status TEXT NOT NULL DEFAULT 'pending'
        CHECK (status IN (
            'pending', 'approved', 'rejected',
            'fulfilled', 'cancelled'
        )),
    redeemed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 16. TOKEN TRANSACTIONS
CREATE TABLE public.token_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id),
    amount INTEGER NOT NULL CHECK (amount <> 0),
    transaction_type TEXT NOT NULL
        CHECK (transaction_type IN (
            'earned', 'spent', 'adjustment'
        )),
    description TEXT,
    redemption_id UUID REFERENCES public.redemptions(id)
        ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =========================================================
-- INDEXES
-- =========================================================

CREATE INDEX idx_species_category
    ON public.species(category_id);

CREATE INDEX idx_zoo_species_zoo
    ON public.zoo_species(zoo_id);

CREATE INDEX idx_zoo_species_species
    ON public.zoo_species(species_id);

CREATE INDEX idx_qr_codes_zoo_species
    ON public.qr_codes(zoo_species_id);

CREATE INDEX idx_species_images_species
    ON public.species_images(species_id);

CREATE INDEX idx_species_fun_facts_species
    ON public.species_fun_facts(species_id);

CREATE INDEX idx_collection_user
    ON public.user_species_collection(user_id);

CREATE INDEX idx_user_missions_user
    ON public.user_missions(user_id);

CREATE INDEX idx_user_badges_user
    ON public.user_badges(user_id);

CREATE INDEX idx_redemptions_user
    ON public.redemptions(user_id);

CREATE INDEX idx_token_transactions_user
    ON public.token_transactions(user_id);

-- =========================================================
-- ROW LEVEL SECURITY (RLS)
-- =========================================================

ALTER TABLE public.zoos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.species_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.species ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.zoo_species ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.species_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.species_fun_facts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qr_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_species_collection ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.token_transactions ENABLE ROW LEVEL SECURITY;

-- Publicly readable zoo and published species information.
CREATE POLICY "Anyone can read active zoos"
ON public.zoos FOR SELECT
USING (is_active = TRUE);

CREATE POLICY "Anyone can read species categories"
ON public.species_categories FOR SELECT
USING (TRUE);

CREATE POLICY "Anyone can read published species"
ON public.species FOR SELECT
USING (is_published = TRUE);

CREATE POLICY "Anyone can read available zoo species"
ON public.zoo_species FOR SELECT
USING (
    is_available = TRUE
    AND EXISTS (
        SELECT 1
        FROM public.zoos z
        WHERE z.id = zoo_id AND z.is_active = TRUE
    )
    AND EXISTS (
        SELECT 1
        FROM public.species s
        WHERE s.id = species_id AND s.is_published = TRUE
    )
);

CREATE POLICY "Anyone can read images of published species"
ON public.species_images FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.species s
        WHERE s.id = species_id AND s.is_published = TRUE
    )
);

CREATE POLICY "Anyone can read facts of published species"
ON public.species_fun_facts FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.species s
        WHERE s.id = species_id AND s.is_published = TRUE
    )
);

-- QR codes are deliberately not directly readable by client queries.
-- The app submits a scanned code to public.scan_qr_code(), which validates
-- the code and unlocks the related species for the authenticated user.

-- Users can read and update only their own profile.
CREATE POLICY "Users can read their own profile"
ON public.profiles FOR SELECT
TO authenticated
USING ((SELECT auth.uid()) = id);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING ((SELECT auth.uid()) = id)
WITH CHECK ((SELECT auth.uid()) = id);

-- Users manage only their own collection.
CREATE POLICY "Users can read their own collection"
ON public.user_species_collection FOR SELECT
TO authenticated
USING ((SELECT auth.uid()) = user_id);

-- No direct INSERT policy is provided for collections.
-- Species are added through scan_qr_code() after validating a QR code.

-- Missions and rewards are publicly readable when active.
CREATE POLICY "Anyone can read active missions"
ON public.missions FOR SELECT
USING (is_active = TRUE);

CREATE POLICY "Users can read their own mission progress"
ON public.user_missions FOR SELECT
TO authenticated
USING ((SELECT auth.uid()) = user_id);

-- Mission progress is intentionally not writable directly by clients.
-- Server-side functions will validate progress and completion rewards.

CREATE POLICY "Users can read badges"
ON public.badges FOR SELECT
USING (TRUE);

CREATE POLICY "Users can read their own badges"
ON public.user_badges FOR SELECT
TO authenticated
USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Anyone can read active rewards"
ON public.rewards FOR SELECT
USING (is_active = TRUE);

CREATE POLICY "Users can read their own redemptions"
ON public.redemptions FOR SELECT
TO authenticated
USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can read their own token transactions"
ON public.token_transactions FOR SELECT
TO authenticated
USING ((SELECT auth.uid()) = user_id);

-- Intentionally no client INSERT/UPDATE policies for token
-- transactions or redemptions. Secure redemption and reward
-- functions must validate balances and stock on the server.

-- Restrict profile access to the intended client operations.
-- Profile creation is handled by the signup trigger.
-- Clients cannot directly insert, delete, truncate, or update
-- protected profile fields such as points and token balances.

REVOKE ALL PRIVILEGES ON TABLE public.profiles
FROM PUBLIC, anon, authenticated;

GRANT SELECT ON TABLE public.profiles TO authenticated;

GRANT UPDATE (username, display_name, avatar_url)
ON TABLE public.profiles TO authenticated;

-- The signup trigger invokes this function automatically.
-- Clients do not need permission to call it directly.
REVOKE EXECUTE ON FUNCTION public.handle_new_user()
FROM PUBLIC, anon, authenticated;

-- =========================================================
-- END OF INITIAL SCHEMA
-- =========================================================
