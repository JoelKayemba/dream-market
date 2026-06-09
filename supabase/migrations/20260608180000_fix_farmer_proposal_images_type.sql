-- Fix : products.images est text[], pas jsonb

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
