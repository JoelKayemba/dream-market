-- Fermier : modifications produit appliquées directement, sauf changement d'images (validation admin)

DROP FUNCTION IF EXISTS public.upsert_farmer_product_proposal(uuid, text, text, text, numeric, text, text, uuid, jsonb, integer);
DROP FUNCTION IF EXISTS public.notify_admins_product_review_request(uuid);

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS pending_images text[],
  ADD COLUMN IF NOT EXISTS images_review_status text NOT NULL DEFAULT 'none';

ALTER TABLE public.products
  DROP CONSTRAINT IF EXISTS products_images_review_status_check;

ALTER TABLE public.products
  ADD CONSTRAINT products_images_review_status_check
  CHECK (images_review_status IN ('none', 'pending', 'rejected'));

COMMENT ON COLUMN public.products.pending_images IS
  'Photos proposées en attente de validation (produit déjà publié)';
COMMENT ON COLUMN public.products.images_review_status IS
  'none | pending | rejected — workflow validation photos fermier';

CREATE OR REPLACE FUNCTION public.text_arrays_equal(a text[], b text[])
RETURNS boolean
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT COALESCE(a, ARRAY[]::text[]) = COALESCE(b, ARRAY[]::text[]);
$$;

CREATE OR REPLACE FUNCTION public.upsert_farmer_product_proposal(
  p_product_id uuid DEFAULT NULL,
  p_name text DEFAULT NULL,
  p_description text DEFAULT NULL,
  p_short_description text DEFAULT NULL,
  p_proposed_price numeric DEFAULT NULL,
  p_currency text DEFAULT 'CDF',
  p_unit text DEFAULT 'kg',
  p_category_id uuid DEFAULT NULL,
  p_images jsonb DEFAULT '[]'::jsonb,
  p_stock integer DEFAULT 0,
  p_submit boolean DEFAULT true
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_farm_id uuid;
  v_product public.products%ROWTYPE;
  v_name text;
  v_stock integer;
  v_images text[];
  v_images_changed boolean;
  v_final_price numeric;
  v_needs_admin_review boolean := false;
BEGIN
  IF NOT public.is_farmer_user() THEN
    RAISE EXCEPTION 'Accès réservé aux fermiers';
  END IF;

  v_farm_id := public.get_my_farm_id();
  IF v_farm_id IS NULL THEN
    RAISE EXCEPTION 'Aucune ferme associée à ce compte';
  END IF;

  v_name := NULLIF(trim(p_name), '');
  IF v_name IS NULL THEN
    RAISE EXCEPTION 'Le nom du produit est requis';
  END IF;

  v_final_price := COALESCE(p_proposed_price, 0);
  IF p_submit AND v_final_price <= 0 THEN
    RAISE EXCEPTION 'Un prix valide est requis';
  END IF;

  v_stock := GREATEST(0, COALESCE(p_stock, 0));

  v_images := COALESCE(
    ARRAY(
      SELECT jsonb_array_elements_text(
        CASE
          WHEN p_images IS NULL OR jsonb_typeof(p_images) <> 'array' THEN '[]'::jsonb
          ELSE p_images
        END
      )
    ),
    ARRAY[]::text[]
  );

  IF p_product_id IS NOT NULL THEN
    SELECT * INTO v_product
    FROM public.products p
    WHERE p.id = p_product_id
      AND p.farm_id = v_farm_id
    FOR UPDATE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Produit introuvable ou non autorisé';
    END IF;

    IF v_product.review_status = 'pending_review' THEN
      RAISE EXCEPTION 'Ce produit est en cours de validation, modification impossible';
    END IF;

    v_images_changed := NOT public.text_arrays_equal(COALESCE(v_product.images, ARRAY[]::text[]), v_images);

    IF v_product.review_status = 'published' THEN
      UPDATE public.products
      SET
        name = v_name,
        description = NULLIF(trim(p_description), ''),
        short_description = NULLIF(trim(p_short_description), ''),
        proposed_price = v_final_price,
        price = v_final_price,
        currency = COALESCE(NULLIF(upper(trim(p_currency)), ''), 'CDF'),
        unit = COALESCE(NULLIF(trim(p_unit), ''), 'kg'),
        category_id = p_category_id,
        stock = v_stock,
        is_active = CASE WHEN v_stock > 0 THEN true ELSE false END,
        updated_at = now()
      WHERE id = p_product_id
      RETURNING * INTO v_product;

      IF p_submit AND v_images_changed THEN
        UPDATE public.products
        SET
          pending_images = v_images,
          images_review_status = 'pending',
          submitted_at = now(),
          review_note = NULL,
          updated_at = now()
        WHERE id = p_product_id
        RETURNING * INTO v_product;

        PERFORM public.notify_admins_product_review_request(v_product.id, 'image_change');
        v_needs_admin_review := true;
      ELSIF NOT v_images_changed THEN
        UPDATE public.products
        SET
          images = v_images,
          pending_images = NULL,
          images_review_status = 'none',
          updated_at = now()
        WHERE id = p_product_id
        RETURNING * INTO v_product;
      END IF;

    ELSIF v_product.review_status IN ('draft', 'rejected') THEN
      IF p_submit THEN
        IF cardinality(v_images) = 0 THEN
          UPDATE public.products
          SET
            name = v_name,
            description = NULLIF(trim(p_description), ''),
            short_description = NULLIF(trim(p_short_description), ''),
            proposed_price = v_final_price,
            price = v_final_price,
            currency = COALESCE(NULLIF(upper(trim(p_currency)), ''), 'CDF'),
            unit = COALESCE(NULLIF(trim(p_unit), ''), 'kg'),
            category_id = p_category_id,
            images = v_images,
            pending_images = NULL,
            images_review_status = 'none',
            stock = v_stock,
            review_status = 'published',
            review_note = NULL,
            reviewed_at = NULL,
            reviewed_by = NULL,
            submitted_at = now(),
            is_active = CASE WHEN v_stock > 0 THEN true ELSE false END,
            updated_at = now()
          WHERE id = p_product_id
          RETURNING * INTO v_product;
        ELSE
          UPDATE public.products
          SET
            name = v_name,
            description = NULLIF(trim(p_description), ''),
            short_description = NULLIF(trim(p_short_description), ''),
            proposed_price = v_final_price,
            currency = COALESCE(NULLIF(upper(trim(p_currency)), ''), 'CDF'),
            unit = COALESCE(NULLIF(trim(p_unit), ''), 'kg'),
            category_id = p_category_id,
            images = v_images,
            stock = v_stock,
            review_status = 'pending_review',
            review_note = NULL,
            reviewed_at = NULL,
            reviewed_by = NULL,
            submitted_at = now(),
            is_active = false,
            updated_at = now()
          WHERE id = p_product_id
          RETURNING * INTO v_product;

          PERFORM public.notify_admins_product_review_request(v_product.id, 'new_product');
          v_needs_admin_review := true;
        END IF;
      ELSE
        UPDATE public.products
        SET
          name = v_name,
          description = NULLIF(trim(p_description), ''),
          short_description = NULLIF(trim(p_short_description), ''),
          proposed_price = v_final_price,
          currency = COALESCE(NULLIF(upper(trim(p_currency)), ''), 'CDF'),
          unit = COALESCE(NULLIF(trim(p_unit), ''), 'kg'),
          category_id = p_category_id,
          images = v_images,
          stock = v_stock,
          review_status = 'draft',
          review_note = NULL,
          reviewed_at = NULL,
          reviewed_by = NULL,
          submitted_at = NULL,
          is_active = false,
          updated_at = now()
        WHERE id = p_product_id
        RETURNING * INTO v_product;
      END IF;
    ELSE
      RAISE EXCEPTION 'Ce produit ne peut pas être modifié';
    END IF;
  ELSE
    IF p_submit THEN
      IF cardinality(v_images) = 0 THEN
        INSERT INTO public.products (
          farm_id, name, description, short_description,
          price, proposed_price, currency, unit, category_id,
          images, stock, review_status, is_active,
          is_organic, is_new, is_popular, submitted_at
        )
        VALUES (
          v_farm_id, v_name,
          NULLIF(trim(p_description), ''),
          NULLIF(trim(p_short_description), ''),
          v_final_price, v_final_price,
          COALESCE(NULLIF(upper(trim(p_currency)), ''), 'CDF'),
          COALESCE(NULLIF(trim(p_unit), ''), 'kg'),
          p_category_id,
          v_images, v_stock, 'published',
          CASE WHEN v_stock > 0 THEN true ELSE false END,
          false, false, false, now()
        )
        RETURNING * INTO v_product;
      ELSE
        INSERT INTO public.products (
          farm_id, name, description, short_description,
          price, proposed_price, currency, unit, category_id,
          images, stock, review_status, is_active,
          is_organic, is_new, is_popular, submitted_at
        )
        VALUES (
          v_farm_id, v_name,
          NULLIF(trim(p_description), ''),
          NULLIF(trim(p_short_description), ''),
          v_final_price, v_final_price,
          COALESCE(NULLIF(upper(trim(p_currency)), ''), 'CDF'),
          COALESCE(NULLIF(trim(p_unit), ''), 'kg'),
          p_category_id,
          v_images, v_stock, 'pending_review', false,
          false, false, false, now()
        )
        RETURNING * INTO v_product;

        PERFORM public.notify_admins_product_review_request(v_product.id, 'new_product');
        v_needs_admin_review := true;
      END IF;
    ELSE
      INSERT INTO public.products (
        farm_id, name, description, short_description,
        price, proposed_price, currency, unit, category_id,
        images, stock, review_status, is_active,
        is_organic, is_new, is_popular
      )
      VALUES (
        v_farm_id, v_name,
        NULLIF(trim(p_description), ''),
        NULLIF(trim(p_short_description), ''),
        COALESCE(v_final_price, 0), v_final_price,
        COALESCE(NULLIF(upper(trim(p_currency)), ''), 'CDF'),
        COALESCE(NULLIF(trim(p_unit), ''), 'kg'),
        p_category_id,
        v_images, v_stock, 'draft', false,
        false, false, false
      )
      RETURNING * INTO v_product;
    END IF;
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'product', to_jsonb(v_product),
    'needs_admin_review', v_needs_admin_review,
    'images_changed', COALESCE(v_images_changed, cardinality(v_images) > 0)
  );
END;
$$;

REVOKE ALL ON FUNCTION public.upsert_farmer_product_proposal(uuid, text, text, text, numeric, text, text, uuid, jsonb, integer, boolean) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.upsert_farmer_product_proposal(uuid, text, text, text, numeric, text, text, uuid, jsonb, integer, boolean) TO authenticated, service_role;

-- Soumission légère (depuis liste brouillons) : reprend la logique sans renvoyer tout le formulaire
CREATE OR REPLACE FUNCTION public.submit_farmer_product_proposal(p_product_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_farm_id uuid;
  v_product public.products%ROWTYPE;
BEGIN
  IF NOT public.is_farmer_user() THEN
    RAISE EXCEPTION 'Accès réservé aux fermiers';
  END IF;

  v_farm_id := public.get_my_farm_id();
  IF v_farm_id IS NULL THEN
    RAISE EXCEPTION 'Aucune ferme associée à ce compte';
  END IF;

  SELECT * INTO v_product
  FROM public.products p
  WHERE p.id = p_product_id
    AND p.farm_id = v_farm_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Produit introuvable ou non autorisé';
  END IF;

  IF v_product.review_status NOT IN ('draft', 'rejected') THEN
    RAISE EXCEPTION 'Cette proposition ne peut pas être soumise';
  END IF;

  RETURN public.upsert_farmer_product_proposal(
    p_product_id,
    v_product.name,
    v_product.description,
    v_product.short_description,
    COALESCE(v_product.proposed_price, v_product.price),
    v_product.currency,
    v_product.unit,
    v_product.category_id,
    to_jsonb(COALESCE(v_product.images, ARRAY[]::text[])),
    v_product.stock,
    true
  );
END;
$$;

-- Notification admin (type de demande)
CREATE OR REPLACE FUNCTION public.notify_admins_product_review_request(
  p_product_id uuid,
  p_review_kind text DEFAULT 'new_product'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_product public.products%ROWTYPE;
  v_farm_name text;
  v_title text;
  v_message text;
BEGIN
  SELECT p.* INTO v_product
  FROM public.products p
  WHERE p.id = p_product_id;

  IF NOT FOUND THEN
    RETURN;
  END IF;

  SELECT f.name INTO v_farm_name
  FROM public.farms f
  WHERE f.id = v_product.farm_id;

  IF lower(trim(COALESCE(p_review_kind, ''))) = 'image_change' THEN
    v_title := 'Photos produit à valider';
    v_message := concat(
      'Nouvelles photos pour « ',
      coalesce(v_product.name, 'Produit'),
      ' » (',
      coalesce(v_farm_name, 'ferme partenaire'),
      ')'
    );
  ELSE
    v_title := 'Produit à valider';
    v_message := concat(
      'Nouvelle proposition : ',
      coalesce(v_product.name, 'Produit'),
      ' (',
      coalesce(v_farm_name, 'ferme partenaire'),
      ')'
    );
  END IF;

  INSERT INTO public.notifications (
    user_id, type, title, message, data, priority, is_read, is_sent
  )
  SELECT
    p.id,
    'admin_product_review',
    v_title,
    v_message,
    jsonb_build_object(
      'product_id', v_product.id,
      'product_name', v_product.name,
      'farm_id', v_product.farm_id,
      'farm_name', v_farm_name,
      'review_kind', COALESCE(NULLIF(trim(p_review_kind), ''), 'new_product'),
      'adminAction', true
    ),
    2,
    false,
    false
  FROM public.profiles p
  WHERE p.role = 'admin'
    AND NOT EXISTS (
      SELECT 1
      FROM public.notifications n
      WHERE n.user_id = p.id
        AND n.type = 'admin_product_review'
        AND n.data->>'product_id' = v_product.id::text
        AND n.data->>'review_kind' = COALESCE(NULLIF(trim(p_review_kind), ''), 'new_product')
        AND n.created_at > now() - interval '1 hour'
    );
END;
$$;

REVOKE ALL ON FUNCTION public.notify_admins_product_review_request(uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.notify_admins_product_review_request(uuid, text) TO authenticated, service_role;

-- Validation admin : nouveaux produits + changements photos sur produits publiés
CREATE OR REPLACE FUNCTION public.review_farmer_product(
  p_product_id uuid,
  p_action text,
  p_review_note text DEFAULT NULL,
  p_price numeric DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_product public.products%ROWTYPE;
  v_action text;
  v_final_price numeric;
  v_owner_id uuid;
BEGIN
  IF NOT public.is_admin_user() THEN
    RAISE EXCEPTION 'Accès réservé aux administrateurs';
  END IF;

  v_action := lower(trim(COALESCE(p_action, '')));
  IF v_action NOT IN ('approve', 'reject') THEN
    RAISE EXCEPTION 'Action invalide (approve ou reject)';
  END IF;

  SELECT p.* INTO v_product
  FROM public.products p
  WHERE p.id = p_product_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Produit introuvable';
  END IF;

  SELECT f.owner_id INTO v_owner_id
  FROM public.farms f
  WHERE f.id = v_product.farm_id;

  -- Validation photos uniquement (produit déjà publié)
  IF v_product.review_status = 'published' AND v_product.images_review_status = 'pending' THEN
    IF v_action = 'approve' THEN
      IF v_product.pending_images IS NULL OR cardinality(v_product.pending_images) = 0 THEN
        RAISE EXCEPTION 'Aucune photo en attente pour ce produit';
      END IF;

      UPDATE public.products
      SET
        images = v_product.pending_images,
        pending_images = NULL,
        images_review_status = 'none',
        review_note = NULLIF(trim(p_review_note), ''),
        reviewed_at = now(),
        reviewed_by = auth.uid(),
        updated_at = now()
      WHERE id = p_product_id
      RETURNING * INTO v_product;
    ELSE
      UPDATE public.products
      SET
        pending_images = NULL,
        images_review_status = 'rejected',
        review_note = NULLIF(trim(p_review_note), ''),
        reviewed_at = now(),
        reviewed_by = auth.uid(),
        updated_at = now()
      WHERE id = p_product_id
      RETURNING * INTO v_product;
    END IF;

    RETURN jsonb_build_object(
      'success', true,
      'product', to_jsonb(v_product),
      'owner_id', v_owner_id,
      'action', v_action,
      'review_kind', 'image_change'
    );
  END IF;

  IF v_product.review_status <> 'pending_review' THEN
    RAISE EXCEPTION 'Ce produit n''est pas en attente de validation';
  END IF;

  IF v_action = 'approve' THEN
    v_final_price := COALESCE(p_price, v_product.proposed_price, v_product.price, 0);
    IF v_final_price <= 0 THEN
      RAISE EXCEPTION 'Un prix de vente valide est requis pour publier';
    END IF;

    UPDATE public.products
    SET
      review_status = 'published',
      price = v_final_price,
      proposed_price = v_final_price,
      review_note = NULLIF(trim(p_review_note), ''),
      reviewed_at = now(),
      reviewed_by = auth.uid(),
      is_active = CASE WHEN COALESCE(stock, 0) > 0 THEN true ELSE false END,
      pending_images = NULL,
      images_review_status = 'none',
      updated_at = now()
    WHERE id = p_product_id
    RETURNING * INTO v_product;
  ELSE
    UPDATE public.products
    SET
      review_status = 'rejected',
      review_note = NULLIF(trim(p_review_note), ''),
      reviewed_at = now(),
      reviewed_by = auth.uid(),
      is_active = false,
      updated_at = now()
    WHERE id = p_product_id
    RETURNING * INTO v_product;
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'product', to_jsonb(v_product),
    'owner_id', v_owner_id,
    'action', v_action,
    'review_kind', 'new_product'
  );
END;
$$;

-- Admin : inclure demandes photos en attente
CREATE OR REPLACE FUNCTION public.get_admin_product_requests(
  p_status text DEFAULT 'pending_review',
  p_days integer DEFAULT NULL,
  p_limit integer DEFAULT 50,
  p_offset integer DEFAULT 0
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_items jsonb;
  v_total integer;
  v_status text;
BEGIN
  IF NOT public.is_admin_user() THEN
    RAISE EXCEPTION 'Accès réservé aux administrateurs';
  END IF;

  v_status := lower(trim(COALESCE(p_status, 'pending_review')));

  SELECT COUNT(*)::integer
  INTO v_total
  FROM public.products p
  INNER JOIN public.farms f ON f.id = p.farm_id
  WHERE (
      p.submitted_at IS NOT NULL
      OR p.review_status IN ('draft', 'pending_review', 'rejected')
      OR p.proposed_price IS NOT NULL
      OR p.images_review_status = 'pending'
    )
    AND (
      v_status = 'all'
      OR (v_status = 'pending_review' AND (p.review_status = 'pending_review' OR p.images_review_status = 'pending'))
      OR (v_status = 'approved' AND p.review_status = 'published' AND p.submitted_at IS NOT NULL AND p.images_review_status <> 'pending')
      OR (v_status = 'rejected' AND (p.review_status = 'rejected' OR p.images_review_status = 'rejected'))
      OR (v_status = 'draft' AND p.review_status = 'draft')
    )
    AND (
      p_days IS NULL
      OR COALESCE(p.submitted_at, p.created_at) >= now() - make_interval(days => GREATEST(1, p_days))
    );

  SELECT COALESCE(jsonb_agg(row_to_json(t)), '[]'::jsonb)
  INTO v_items
  FROM (
    SELECT
      p.id,
      p.name,
      p.description,
      p.short_description,
      p.proposed_price,
      p.price,
      p.currency,
      p.unit,
      p.stock,
      p.images,
      p.pending_images,
      p.images_review_status,
      p.review_status,
      p.review_note,
      p.submitted_at,
      p.reviewed_at,
      p.created_at,
      p.updated_at,
      f.id AS farm_id,
      f.name AS farm_name,
      c.name AS category_name,
      CASE
        WHEN p.images_review_status = 'pending' THEN 'image_change'
        ELSE 'new_product'
      END AS review_kind
    FROM public.products p
    INNER JOIN public.farms f ON f.id = p.farm_id
    LEFT JOIN public.categories c ON c.id = p.category_id
    WHERE (
        p.submitted_at IS NOT NULL
        OR p.review_status IN ('draft', 'pending_review', 'rejected')
        OR p.proposed_price IS NOT NULL
        OR p.images_review_status = 'pending'
      )
      AND (
        v_status = 'all'
        OR (v_status = 'pending_review' AND (p.review_status = 'pending_review' OR p.images_review_status = 'pending'))
        OR (v_status = 'approved' AND p.review_status = 'published' AND p.submitted_at IS NOT NULL AND p.images_review_status <> 'pending')
        OR (v_status = 'rejected' AND (p.review_status = 'rejected' OR p.images_review_status = 'rejected'))
        OR (v_status = 'draft' AND p.review_status = 'draft')
      )
      AND (
        p_days IS NULL
        OR COALESCE(p.submitted_at, p.created_at) >= now() - make_interval(days => GREATEST(1, p_days))
      )
    ORDER BY COALESCE(p.submitted_at, p.created_at) DESC
    LIMIT GREATEST(1, LEAST(COALESCE(p_limit, 50), 100))
    OFFSET GREATEST(0, COALESCE(p_offset, 0))
  ) t;

  RETURN jsonb_build_object(
    'products', v_items,
    'total', COALESCE(v_total, 0)
  );
END;
$$;

REVOKE ALL ON FUNCTION public.get_admin_product_requests(text, integer, integer, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_admin_product_requests(text, integer, integer, integer) TO authenticated, service_role;
