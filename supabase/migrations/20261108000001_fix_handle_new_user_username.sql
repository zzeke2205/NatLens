CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
    new_username TEXT;
BEGIN
    new_username := NULLIF(
        TRIM(NEW.raw_user_meta_data ->> 'username'),
        ''
    );

    INSERT INTO public.profiles (
        id,
        username,
        display_name
    )
    VALUES (
        NEW.id,
        new_username,
        COALESCE(new_username, '')
    );

    RETURN NEW;
END;
$function$;