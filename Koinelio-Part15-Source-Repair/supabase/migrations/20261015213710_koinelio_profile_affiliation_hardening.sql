ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS institution_slug text;

COMMENT ON COLUMN public.profiles.institution_slug IS
  'Self-reported institution choice from onboarding; not proof of affiliation and never used for authorization.';

CREATE OR REPLACE FUNCTION private.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  v_display_name text;
  v_campus_role text;
  v_department text;
  v_degree_program text;
  v_institution_slug text;
  v_batch_text text;
  v_batch_year smallint;
  v_interests text[];
BEGIN
  v_display_name := left(coalesce(
    nullif(btrim(new.raw_user_meta_data ->> 'display_name'), ''),
    nullif(btrim(new.raw_user_meta_data ->> 'full_name'), ''),
    nullif(split_part(coalesce(new.email, ''), '@', 1), ''),
    'Student'
  ), 100);

  -- This is a self-described campus label only; it does not grant any access.
  v_institution_slug := CASE
    WHEN btrim(coalesce(new.raw_user_meta_data ->> 'institution_slug', '')) = 'iit-bhilai'
      THEN 'iit-bhilai'
    ELSE NULL
  END;

  v_campus_role := CASE
    WHEN new.raw_user_meta_data ->> 'role' IN ('student', 'faculty', 'alumni')
      THEN new.raw_user_meta_data ->> 'role'
    ELSE 'student'
  END;

  v_department := left(nullif(btrim(new.raw_user_meta_data ->> 'department'), ''), 120);
  v_degree_program := left(nullif(btrim(new.raw_user_meta_data ->> 'degree_program'), ''), 160);
  v_batch_text := nullif(btrim(new.raw_user_meta_data ->> 'batch_year'), '');

  IF v_batch_text ~ '^[0-9]{4}$'
     AND v_batch_text::integer BETWEEN 2016 AND extract(year FROM CURRENT_DATE)::integer THEN
    v_batch_year := v_batch_text::smallint;
  ELSE
    v_batch_year := NULL;
  END IF;

  SELECT coalesce(array_agg(cleaned.interest), ARRAY[]::text[])
    INTO v_interests
  FROM (
    SELECT DISTINCT left(btrim(item.value), 48) AS interest
    FROM jsonb_array_elements_text(
      CASE
        WHEN jsonb_typeof(new.raw_user_meta_data -> 'interests') = 'array'
          THEN new.raw_user_meta_data -> 'interests'
        ELSE '[]'::jsonb
      END
    ) WITH ORDINALITY AS item(value, ordinality)
    WHERE nullif(btrim(item.value), '') IS NOT NULL
    ORDER BY interest
    LIMIT 20
  ) AS cleaned;

  INSERT INTO public.profiles (
    id, display_name, campus_role, department, degree_program,
    batch_year, interests, institution_slug
  )
  VALUES (
    new.id, v_display_name, v_campus_role, v_department, v_degree_program,
    v_batch_year, v_interests, v_institution_slug
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN new;
END;
$function$;

CREATE OR REPLACE FUNCTION private.guard_profile_affiliation_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  -- A user may edit ordinary profile fields, but cannot self-assign a trusted
  -- institution UUID, alter the onboarding campus label, or self-verify.
  -- Authorized server-side workflows can perform controlled changes.
  IF auth.uid() IS NOT NULL AND auth.uid() = OLD.id THEN
    IF NEW.institution_id IS DISTINCT FROM OLD.institution_id
      OR NEW.institution_slug IS DISTINCT FROM OLD.institution_slug
      OR NEW.campus_role IS DISTINCT FROM OLD.campus_role
      OR NEW.verification_status IS DISTINCT FROM OLD.verification_status THEN
      RAISE EXCEPTION
        'Institution affiliation and verification fields can only be changed through an authorized workflow';
    END IF;
  END IF;

  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS trg_guard_profile_affiliation_fields ON public.profiles;

CREATE TRIGGER trg_guard_profile_affiliation_fields
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION private.guard_profile_affiliation_fields();