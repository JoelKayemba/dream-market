-- Phase 3 : propositions produits fermier + validation admin

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS review_status text NOT NULL DEFAULT 'published',
  ADD COLUMN IF NOT EXISTS review_note text,
  ADD COLUMN IF NOT EXISTS reviewed_at timestamptz,
  ADD COLUMN IF NOT EXISTS reviewed_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS proposed_price numeric,
  ADD COLUMN IF NOT EXISTS submitted_at timestamptz;

UPDATE public.products
SET review_status = 'published'
WHERE review_status IS NULL;

ALTER TABLE public.products
  DROP CONSTRAINT IF EXISTS products_review_status_check;

ALTER TABLE public.products
  ADD CONSTRAINT products_review_status_check
  CHECK (review_status IN ('draft', 'pending_review', 'published', 'rejected'));

CREATE INDEX IF NOT EXISTS idx_products_review_status
  ON public.products(review_status, submitted_at DESC NULLS LAST);

COMMENT ON COLUMN public.products.review_status IS
  'Workflow fermier : draft → pending_review → published | rejected';

-- Créer ou mettre à jour une proposition (brouillon)
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
  p_stock integer DEFAULT 0
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

    IF v_product.review_status NOT IN ('draft', 'rejected') THEN
      RAISE EXCEPTION 'Seuls les brouillons ou propositions refusées peuvent être modifiés';
    END IF;

    UPDATE public.products
    SET
      name = v_name,
      description = NULLIF(trim(p_description), ''),
      short_description = NULLIF(trim(p_short_description), ''),
      proposed_price = p_proposed_price,
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
  ELSE
    INSERT INTO public.products (
      farm_id,
      name,
      description,
      short_description,
      price,
      proposed_price,
      currency,
      unit,
      category_id,
      images,
      stock,
      review_status,
      is_active,
      is_organic,
      is_new,
      is_popular
    )
    VALUES (
      v_farm_id,
      v_name,
      NULLIF(trim(p_description), ''),
      NULLIF(trim(p_short_description), ''),
      COALESCE(p_proposed_price, 0),
      p_proposed_price,
      COALESCE(NULLIF(upper(trim(p_currency)), ''), 'CDF'),
      COALESCE(NULLIF(trim(p_unit), ''), 'kg'),
      p_category_id,
      v_images,
      v_stock,
      'draft',
      false,
      false,
      false,
      false
    )
    RETURNING * INTO v_product;
  END IF;

  RETURN jsonb_build_object('success', true, 'product', to_jsonb(v_product));
END;
$$;

REVOKE ALL ON FUNCTION public.upsert_farmer_product_proposal(uuid, text, text, text, numeric, text, text, uuid, jsonb, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.upsert_farmer_product_proposal(uuid, text, text, text, numeric, text, text, uuid, jsonb, integer) TO authenticated, service_role;

-- Soumettre pour validation admin
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

  IF char_length(trim(v_product.name)) = 0 THEN
    RAISE EXCEPTION 'Le nom du produit est requis';
  END IF;

  UPDATE public.products
  SET
    review_status = 'pending_review',
    submitted_at = now(),
    review_note = NULL,
    reviewed_at = NULL,
    reviewed_by = NULL,
    is_active = false,
    updated_at = now()
  WHERE id = p_product_id
  RETURNING * INTO v_product;

  RETURN jsonb_build_object('success', true, 'product', to_jsonb(v_product));
END;
$$;

REVOKE ALL ON FUNCTION public.submit_farmer_product_proposal(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.submit_farmer_product_proposal(uuid) TO authenticated, service_role;

-- Validation admin (approuver / rejeter)
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
      review_note = NULLIF(trim(p_review_note), ''),
      reviewed_at = now(),
      reviewed_by = auth.uid(),
      is_active = CASE WHEN COALESCE(stock, 0) > 0 THEN true ELSE false END,
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
    'action', v_action
  );
END;
$$;

REVOKE ALL ON FUNCTION public.review_farmer_product(uuid, text, text, numeric) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.review_farmer_product(uuid, text, text, numeric) TO authenticated, service_role;

-- Liste admin des produits en attente
CREATE OR REPLACE FUNCTION public.get_admin_pending_products(p_limit integer DEFAULT 20)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_items jsonb;
BEGIN
  IF NOT public.is_admin_user() THEN
    RAISE EXCEPTION 'Accès réservé aux administrateurs';
  END IF;

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
      p.review_status,
      p.submitted_at,
      p.created_at,
      f.id AS farm_id,
      f.name AS farm_name,
      c.name AS category_name
    FROM public.products p
    INNER JOIN public.farms f ON f.id = p.farm_id
    LEFT JOIN public.categories c ON c.id = p.category_id
    WHERE p.review_status = 'pending_review'
    ORDER BY p.submitted_at DESC NULLS LAST, p.created_at DESC
    LIMIT GREATEST(1, LEAST(COALESCE(p_limit, 20), 50))
  ) t;

  RETURN jsonb_build_object('products', v_items);
END;
$$;

REVOKE ALL ON FUNCTION public.get_admin_pending_products(integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_admin_pending_products(integer) TO authenticated, service_role;

-- Bloquer mise à jour stock sur produits non publiés
CREATE OR REPLACE FUNCTION public.update_farmer_product_stock(
  p_product_id uuid,
  p_stock integer,
  p_is_active boolean DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_farm_id uuid;
  v_product public.products%ROWTYPE;
  v_new_stock integer;
  v_new_active boolean;
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

  IF COALESCE(v_product.review_status, 'published') <> 'published' THEN
    RAISE EXCEPTION 'Seuls les produits publiés peuvent avoir leur stock modifié';
  END IF;

  v_new_stock := GREATEST(0, COALESCE(p_stock, v_product.stock, 0));
  v_new_active := COALESCE(p_is_active, v_product.is_active, true);

  IF v_new_stock = 0 THEN
    v_new_active := false;
  END IF;

  INSERT INTO public.product_stock_logs (
    product_id, farm_id, old_stock, new_stock, old_is_active, new_is_active, changed_by
  )
  VALUES (
    v_product.id,
    v_farm_id,
    v_product.stock,
    v_new_stock,
    v_product.is_active,
    v_new_active,
    auth.uid()
  );

  UPDATE public.products
  SET
    stock = v_new_stock,
    is_active = v_new_active,
    updated_at = now()
  WHERE id = v_product.id
  RETURNING * INTO v_product;

  RETURN jsonb_build_object(
    'success', true,
    'product', to_jsonb(v_product)
  );
END;
$$;
