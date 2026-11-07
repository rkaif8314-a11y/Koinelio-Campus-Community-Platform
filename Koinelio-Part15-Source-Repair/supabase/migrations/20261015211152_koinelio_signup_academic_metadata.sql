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
  v_batch_text text;
  v_batch_year smallint;
  v_interests text[];
BEGIN
  v_display_name := coalesce(
    nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''),
    nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''),
    nullif(split_part(coalesce(new.email, ''), '@', 1), ''),
    'Student'
  );

  v_campus_role := CASE
    WHEN new.raw_user_meta_data ->> 'role' IN ('student', 'faculty', 'alumni')
      THEN new.raw_user_meta_data ->> 'role'
    ELSE 'student'
  END;

  v_department := nullif(trim(new.raw_user_meta_data ->> 'department'), '');
  v_degree_program := nullif(trim(new.raw_user_meta_data ->> 'degree_program'), '');

  v_batch_text := nullif(trim(new.raw_user_meta_data ->> 'batch_year'), '');
  IF v_batch_text ~ '^[0-9]{4}$' AND v_batch_text::integer BETWEEN 1900 AND 2200 THEN
    v_batch_year := v_batch_text::smallint;
  ELSE
    v_batch_year := NULL;
  END IF;

  v_interests := ARRAY(
    SELECT jsonb_array_elements_text(
      CASE
        WHEN jsonb_typeof(new.raw_user_meta_data -> 'interests') = 'array'
          THEN new.raw_user_meta_data -> 'interests'
        ELSE '[]'::jsonb
      END
    )
  );

  INSERT INTO public.profiles (
    id, display_name, campus_role, department, degree_program, batch_year, interests
  )
  VALUES (
    new.id, v_display_name, v_campus_role, v_department, v_degree_program, v_batch_year, v_interests
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN new;
END;
$function$;
