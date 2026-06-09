-- Notifier les admins à chaque soumission de proposition produit (côté SQL, fiable)

CREATE OR REPLACE FUNCTION public.notify_admins_product_review_request(p_product_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_product public.products%ROWTYPE;
  v_farm_name text;
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

  INSERT INTO public.notifications (
    user_id,
    type,
    title,
    message,
    data,
    priority,
    is_read,
    is_sent
  )
  SELECT
    p.id,
    'admin_product_review',
    'Produit à valider',
    concat(
      'Nouvelle proposition : ',
      coalesce(v_product.name, 'Produit'),
      ' (',
      coalesce(v_farm_name, 'ferme partenaire'),
      ')'
    ),
    jsonb_build_object(
      'product_id', v_product.id,
      'product_name', v_product.name,
      'farm_id', v_product.farm_id,
      'farm_name', v_farm_name,
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
        AND n.created_at > now() - interval '1 hour'
    );
END;
$$;

REVOKE ALL ON FUNCTION public.notify_admins_product_review_request(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.notify_admins_product_review_request(uuid) TO authenticated, service_role;

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

  PERFORM public.notify_admins_product_review_request(v_product.id);

  RETURN jsonb_build_object('success', true, 'product', to_jsonb(v_product));
END;
$$;

REVOKE ALL ON FUNCTION public.submit_farmer_product_proposal(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.submit_farmer_product_proposal(uuid) TO authenticated, service_role;
