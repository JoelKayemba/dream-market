# Espace Fermier — Architecture & Roadmap par phases

Document de référence pour l’évolution de Dream Market vers un modèle **entreprise-pont** : Dream Field centralise la vente, la logistique et la marque ; les fermiers partenaires accèdent à un **espace dédié** pour suivre leurs performances, sans remplacer le rôle des admins.

---

## 1. Vision & modèle métier

### 1.1 Principe

Dream Market n’est pas une marketplace ouverte où chaque fermier vend en autonomie. C’est une plateforme opérée par **Dream Field** :

| Acteur | Rôle |
|--------|------|
| **Dream Field (admin)** | Catalogue public, prix de vente, commandes, livraison, validation, relation client |
| **Fermier partenaire** | Production ; accès limité pour voir ses ventes et, progressivement, mettre à jour son offre |
| **Client** | Achète **à Dream Market**, pas directement au fermier |

```text
Fermiers (production)
        ↓ approvisionnement / collecte
Dream Field (pont : stock, qualité, vente, livraison)
        ↓
Clients (Kinshasa, B2B, etc.)
```

### 1.2 Inscription fermier : accès contrôlé

Les fermiers **ne s’inscrivent pas librement**. Dream Field :

1. Recrute et enregistre la ferme (terrain ou admin).
2. Crée un **compte fermier** lié à cette ferme.
3. Remet un **identifiant** + **code d’accès unique** (WhatsApp, SMS, papier).
4. Le fermier active son compte (mot de passe) et accède à **son espace uniquement**.

### 1.3 Frais de livraison : règle globale admin

Les frais de livraison restent **un montant global** défini par l’admin, appliqué à toutes les commandes client. C’est déjà le comportement actuel :

| Élément | Implémentation existante |
|---------|---------------------------|
| Stockage | Table `app_settings`, clé `delivery_fee` |
| Format | `{ "amount": number, "currency": "CDF" \| "USD" }` |
| Service | `src/backend/services/deliveryFeeService.js` |
| Admin UI | `src/screens/Admin/Settings/DeliveryFeeSettings.jsx` |
| Checkout | Montant injecté dans la commande (`delivery_fee_amount`, `delivery_fee_currency`) |

**Règle produit :**

- Seul l’**admin** peut modifier le frais global.
- Le **fermier** ne configure jamais les frais de livraison.
- Le **client** voit le même frais quel que soit le produit ou la ferme d’origine (phase actuelle).
- Évolution future possible (hors scope immédiat) : zones ou seuils — documentés en annexe, sans casser le modèle global.

---

## 2. Principes d’architecture (clean code)

### 2.1 Séparation des couches

```text
screens/farmer/          → UI uniquement (navigation, affichage)
hooks/useFarmer*.js      → orchestration (auth, refresh, permissions)
store/farmer/            → état Redux (dashboard, produits fermier)
backend/services/        → appels Supabase (farmerService, farmerStatsService)
backend/repositories/    → (optionnel) requêtes SQL encapsulées
supabase/migrations/     → schéma, RLS, RPC
```

**Règles :**

- Les écrans **n’appellent jamais** `supabase` directement.
- Un service = un domaine (`farmerInvitationService`, `farmerStatsService`).
- Les selectors Redux sont **mémoïsés** (`createSelector`).
- Pas de logique métier dans les composants de carte (`FarmCard`, etc.).

### 2.2 Convention de nommage

| Concept | Convention |
|---------|------------|
| Rôle Supabase | `profiles.role = 'farmer'` |
| Lien ferme ↔ user | `farms.owner_id` (UUID → `profiles.id`) |
| Code invitation | `farmer_invites.code` (ex. `DM-LEM-2026-X7K4`) |
| Statut produit (phase 3) | `draft` \| `pending_review` \| `published` \| `rejected` |
| Routes navigation | `FarmerDashboard`, `FarmerProducts`, `FarmerSales` |

### 2.3 Sécurité by design

- **Row Level Security (RLS)** : le fermier ne lit que les lignes liées à `owner_id = auth.uid()`.
- **Admin** : policies via `public.is_admin_user()`.
- **Codes d’invitation** : hash en base, expiration, usage unique ou limité.
- **Aucun secret** dans le client (codes générés côté serveur / Edge Function si besoin).

### 2.4 Cohérence avec l’existant

Réutiliser :

- `USER_ROLES.FARMER` (`src/backend/config/supabase.js`)
- `useAuth().isFarmer()` (`src/hooks/useAuth.js`)
- `farmService` + `productCount` (agrégat `products(count)`)
- `deliveryFeeService` (inchangé pour l’espace fermier)
- Pattern notifications (`notificationService`, push Expo)

---

## 3. Modèle de données cible

### 3.1 Tables existantes (à étendre)

```sql
-- profiles (existant)
-- role IN ('customer', 'farmer', 'admin')

-- farms (existant + colonne)
ALTER TABLE public.farms
  ADD COLUMN IF NOT EXISTS owner_id uuid REFERENCES public.profiles(id);

CREATE INDEX IF NOT EXISTS idx_farms_owner_id ON public.farms(owner_id);
```

### 3.2 Nouvelles tables (phases 1 à 3)

```sql
-- Phase 1 : invitations contrôlées
CREATE TABLE public.farmer_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id uuid NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
  login_identifier text NOT NULL,          -- ex. téléphone ou FERME-KIN-0042
  code_hash text NOT NULL,                 -- jamais le code en clair
  expires_at timestamptz NOT NULL,
  used_at timestamptz,
  used_by uuid REFERENCES public.profiles(id),
  created_by uuid REFERENCES public.profiles(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (login_identifier, code_hash)
);

-- Phase 3 : workflow validation produits
-- Colonnes sur products (si absentes) :
-- status text NOT NULL DEFAULT 'published'
--   CHECK (status IN ('draft','pending_review','published','rejected'))
-- submitted_by uuid REFERENCES public.profiles(id)
-- reviewed_by uuid REFERENCES public.profiles(id)
-- reviewed_at timestamptz
-- rejection_reason text
```

### 3.3 Vue / RPC stats fermier (Phase 1)

```sql
-- RPC : stats agrégées pour la ferme du fermier connecté
CREATE OR REPLACE FUNCTION public.get_farmer_dashboard_stats(p_farm_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
-- Vérifie owner_id = auth.uid() OU is_admin_user()
-- Retourne : ventes_jour, ventes_mois, top_produits[], commandes_en_cours, ca_brut_cdf
$$;
```

Les montants **bruts vente client** et **net dû au fermier** (après marge Dream Field) peuvent être distingués dès la Phase 1 si la table `farmer_payouts` est planifiée ; sinon Phase 2.

---

## 4. Rôles & permissions (matrice)

| Action | Client | Fermier | Admin |
|--------|--------|---------|-------|
| Voir catalogue public | ✅ | ✅ | ✅ |
| Passer commande | ✅ | ❌ | ✅ |
| Modifier frais livraison global | ❌ | ❌ | ✅ |
| CRUD toutes fermes | ❌ | ❌ | ✅ |
| Voir stats **sa** ferme | ❌ | ✅ | ✅ |
| Voir stats toutes fermes | ❌ | ❌ | ✅ |
| Publier produit sans validation | ❌ | ❌ | ✅ (Phase 1–2) |
| Proposer produit / stock | ❌ | Phase 2–3 | ✅ |
| Valider produit fermier | ❌ | ❌ | ✅ (Phase 3) |
| Créer invitation fermier | ❌ | ❌ | ✅ |

---

## 5. Navigation & UX

### 5.1 Routage après connexion

```text
Login → lire profiles.role
  ├── admin    → AdminDashboard (existant)
  ├── farmer   → FarmerStack (nouveau)
  └── customer → MainApp (existant)
```

### 5.2 Structure FarmerStack (minimal Phase 1)

```text
FarmerStack
├── FarmerDashboard      # KPIs, résumé ventes
├── FarmerProducts       # Liste produits de MA ferme (lecture seule P1)
├── FarmerSales          # Détail ventes / commandes contenant mes produits
├── FarmerProfile        # Infos compte, ferme, déconnexion
└── FarmerActivate       # Écran activation code (première connexion)
```

**Onglets suggérés (Phase 1) :** Accueil | Mes produits | Ventes | Profil

Le fermier **ne voit pas** : admin, gestion autres fermes, frais livraison, commandes globales.

---

## 6. Roadmap par phases

---

### Phase 1 — Fondations & tableau de bord (lecture seule)

**Objectif :** Donner aux fermiers partenaires un accès sécurisé pour **voir** comment leurs produits se vendent, sans modifier le catalogue.

**Durée estimée :** 2–3 semaines

#### Fonctionnalités admin

- [ ] Créer / révoquer une invitation fermier depuis la fiche ferme
- [ ] Lier `farms.owner_id` au compte créé
- [ ] Liste des invitations : en attente, activées, expirées
- [ ] Frais livraison : **inchangé** (écran `DeliveryFeeSettings` existant)

#### Fonctionnalités fermier

- [ ] Activation : identifiant + code unique → création mot de passe
- [ ] Dashboard : ventes du jour / semaine / mois
- [ ] Top 5 produits vendus (quantités + CA brut)
- [ ] Nombre de commandes contenant ses produits
- [ ] Liste produits de sa ferme (statut, stock affiché — lecture seule)

#### Backend

- [ ] Migration `owner_id`, `farmer_invites`
- [ ] RLS farms / products / order_items filtrées par `owner_id`
- [ ] RPC `get_farmer_dashboard_stats`
- [ ] RPC `activate_farmer_invite(identifier, code, password)` ou Edge Function

#### Frontend (structure)

```text
src/
├── screens/Farmer/
│   ├── FarmerActivateScreen.jsx
│   ├── FarmerDashboardScreen.jsx
│   ├── FarmerProductsScreen.jsx
│   ├── FarmerSalesScreen.jsx
│   └── FarmerProfileScreen.jsx
├── navigation/FarmerStackNavigator.jsx
├── store/farmer/
│   ├── farmerDashboardSlice.js
│   └── farmerProductsSlice.js
├── backend/services/
│   ├── farmerInvitationService.js
│   └── farmerStatsService.js
└── hooks/
    └── useFarmerGuard.js
```

#### Critères de validation Phase 1

- Un fermier A ne voit **aucune** donnée de la ferme B (test RLS).
- Admin crée invitation → fermier active → dashboard affiche des chiffres cohérents avec les commandes réelles.
- Checkout client : frais livraison = valeur `app_settings.delivery_fee` (régression nulle).
- `role !== farmer` ne peut pas accéder au FarmerStack.

---

### Phase 2 — Participation légère (stock & disponibilité)

**Objectif :** Le fermier met à jour **son** stock et sa disponibilité ; l’admin garde le contrôle sur prix et publication.

**Durée estimée :** 2 semaines

#### Fonctionnalités fermier

- [x] Modifier `stock` et `availability` / `is_available` sur **ses** produits publiés
- [x] Marquer « rupture temporaire » (produit masqué ou badge)
- [x] Historique des mises à jour stock (audit simple — table `product_stock_logs`)

#### Fonctionnalités admin

- [x] File d’alertes : stocks bas, ruptures déclarées par fermiers (dashboard admin)
- [x] Override admin toujours possible (édition produit existante côté admin)

#### Règles métier

- Le fermier **ne modifie pas** : prix de vente, nom public, images principales (admin).
- Toute baisse de stock à 0 → produit non commandable côté client.

#### Critères de validation Phase 2

- Modification stock fermier visible en checkout sous 30 s (realtime ou refresh).
- Admin peut corriger un stock erroné.
- Logs : qui a changé quoi (`updated_by`, `updated_at` sur products).

---

### Phase 3 — Proposition produits & validation admin

**Objectif :** Le fermier **propose** de nouveaux produits ou modifications ; l’admin **valide** avant publication.

**Durée estimée :** 3 semaines

#### Workflow produit

```text
Fermier crée brouillon (draft)
        ↓ soumet
pending_review
        ↓ admin approuve          ↓ admin rejette
published                    rejected (+ motif)
```

#### Fonctionnalités admin

- [x] File « Produits à valider » (filtre `pending_review`)
- [x] Approuver / rejeter avec commentaire
- [x] Notification push + in-app au fermier

#### Fonctionnalités fermier

- [x] Formulaire proposition produit (nom, description, prix souhaité, photos)
- [x] Suivi statut : en attente, publié, refusé

#### Critères de validation Phase 3

- Produit `pending_review` **invisible** côté client.
- Après validation, visible catalogue ≤ 1 min.
- Fermier reçoit notification sur rejet avec motif.

---

## 7. Flux d’invitation (détail Phase 1)

```text
┌─────────────────────────────────────────────────────────────┐
│ ADMIN                                                        │
│ 1. Crée ferme « Bio Lemba »                                  │
│ 2. Génère invitation :                                       │
│    - login_identifier: +243810000000 ou FERME-LEM-001        │
│    - code: DM-LEM-7X4K (affiché une seule fois)             │
│ 3. Envoie WhatsApp au partenaire                             │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│ FERMIER (première ouverture app)                             │
│ 1. « J’ai un code partenaire »                               │
│ 2. Saisit identifiant + code                                 │
│ 3. Choisit email + mot de passe (Supabase Auth signUp)       │
│ 4. RPC lie profile.role=farmer, farms.owner_id=profile.id    │
│ 5. Code marqué used_at                                       │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│ CONNEXIONS SUIVANTES                                         │
│ Login classique → FarmerDashboard                            │
└─────────────────────────────────────────────────────────────┘
```

**Bonnes pratiques sécurité :**

- Code 8–12 caractères, alphabet sans ambiguïté (pas O/0, I/l).
- Expiration : 7 à 30 jours.
- 3 tentatives max → blocage temporaire.
- Révocation admin : invalide l’invitation non utilisée.

---

## 8. Stats fermier — indicateurs Phase 1

| KPI | Source | Note |
|-----|--------|------|
| Commandes du mois | `order_items` + `products.farm_id` | Commandes contenant au moins un produit de la ferme |
| Unités vendues | Somme `order_items.quantity` | Par produit et total |
| CA brut vente | Somme `order_items.quantity * unit_price` | Prix client payé |
| Top produits | GROUP BY product_id | Top 5 |
| Produits actifs | `products` WHERE `farm_id` AND status published | Déjà `productCount` côté admin |
| Frais livraison | — | **Non affiché au fermier** (charge client / Dream Field) |

**Phase 2+ (optionnel) :**

| KPI | Description |
|-----|-------------|
| Net dû au fermier | CA brut − marge Dream Field − retenues |
| Prochaine collecte | Date / lieu planifiés par admin |
| Paiements reçus | Historique des versements |

---

## 9. Impact sur le checkout & commandes (inchangé Phase 1–3)

Le parcours client reste :

```text
Panier → Checkout → sous-total produits
                  + delivery_fee (global admin, app_settings)
                  = total → commande cash (puis mobile money futur)
```

Le fermier voit **sa part des lignes de commande**, pas la gestion du frais de livraison global.

Champs commande existants à conserver :

- `delivery_fee_amount`
- `delivery_fee_currency`
- `subtotal`, `total`, `items` (JSON ou table `order_items`)

---

## 10. Structure Redux recommandée

```text
store/
├── admin/          # existant
├── client/         # existant
├── cart/           # existant
├── auth/           # existant — étendre redirect farmer
└── farmer/         # nouveau
    ├── farmerDashboardSlice.js
    ├── farmerProductsSlice.js
    ├── farmerSalesSlice.js
    └── index.js
```

**Thunks typiques :**

- `fetchFarmerDashboard`
- `fetchFarmerProducts`
- `fetchFarmerSales({ from, to })`
- `updateFarmerProductStock` (Phase 2)
- `submitProductProposal` (Phase 3)

---

## 11. Tests & qualité

| Type | Cible |
|------|-------|
| RLS | Fermier A ≠ Fermier B ; fermier ≠ admin data |
| Services | `farmerStatsService` mocks Supabase |
| Navigation | `role=farmer` → FarmerStack only |
| Régression | `deliveryFeeService`, checkout total |
| E2E manuel | Invitation → activation → dashboard chiffres OK |

---

## 12. Hors périmèse (phases futures)

Documentées mais **non incluses** dans les 3 phases ci-dessus :

- Mobile Money client
- Frais livraison par zone / commune
- Portail web admin desktop
- Chat fermier ↔ admin
- App offline fermier
- Multi-fermes par compte (1 user = N fermes)
- Auto-inscription publique fermier

---

## 13. Ordre d’implémentation recommandé

```text
1. Migration DB (owner_id, farmer_invites, RLS)
2. farmerInvitationService + activation RPC
3. FarmerStackNavigator + redirect auth
4. FarmerActivateScreen
5. farmerStatsService + RPC dashboard
6. FarmerDashboardScreen + FarmerProductsScreen (read-only)
7. Admin UI invitations sur FarmDetail / FarmForm
8. Phase 2 stock
9. Phase 3 workflow validation
```

---

## 14. Liens documentation & code existants

| Sujet | Fichier |
|-------|---------|
| Frais livraison admin | `src/screens/Admin/Settings/DeliveryFeeSettings.jsx` |
| Service frais livraison | `src/backend/services/deliveryFeeService.js` |
| Migration app_settings | `supabase/migrations/20260606124500_fix_app_settings_rls_and_push_tokens.sql` |
| Rôles | `src/backend/config/supabase.js` → `USER_ROLES` |
| Gestion fermes admin | `src/screens/Admin/Farms/FarmsManagement.jsx` |
| Compteur produits ferme | `farmService` → `productCount` |

---

## 15. Résumé exécutif

| Phase | Fermier peut | Admin garde |
|-------|--------------|-------------|
| **1** | Voir ventes & stats, liste produits | Tout le catalogue, invitations, frais livraison global |
| **2** | Mettre à jour stock / dispo | Prix, publication, validation finale |
| **3** | Proposer nouveaux produits | Validation avant mise en ligne |

Dream Field reste le **pont unique** vers le marché. L’espace fermier renforce la **transparence et la confiance** du partenariat, sans fragmenter la marque ni la logistique.

---

---

## 16. Implémentation Phase 1 (livré dans le code)

### Migration Supabase à exécuter

Dans **Supabase → SQL Editor**, exécuter le fichier :

`supabase/migrations/20260608120000_farmer_portal_phase1.sql`

### Parcours admin

1. Admin → Gestion des fermes → ouvrir une ferme
2. Section **Accès producteur** → saisir identifiant → **Générer un code**
3. Transmettre le code au fermier (WhatsApp)

### Parcours fermier

1. Écran d'accueil → **J'ai un code producteur**
2. Identifiant + code → création du compte
3. Espace producteur : Accueil (stats), Produits, Ventes, Profil

### Fichiers ajoutés

- `src/navigation/FarmerNavigator.jsx`
- `src/screens/Farmer/*`
- `src/store/farmer/farmerSlice.js`
- `src/backend/services/farmerInvitationService.js`
- `src/backend/services/farmerStatsService.js`
- `src/utils/authRouting.js`
- `src/screens/Admin/Farms/FarmerInviteSection.jsx`

---

## 17. Implémentation Phase 2 (livré dans le code)

### Migration Supabase à exécuter

Dans **Supabase → SQL Editor**, exécuter le fichier :

`supabase/migrations/20260608140000_farmer_portal_phase2.sql`

### Parcours fermier

1. Espace producteur → onglet **Produits**
2. Ajuster le stock (+/−), basculer **Rupture**, puis **Enregistrer**
3. Stock à 0 → produit désactivé automatiquement (`is_active = false`)

### Parcours admin

1. Dashboard admin → section **Alertes stock** (stocks bas, épuisés, ruptures)
2. Lien **Voir produits** → gestion catalogue (override stock / publication)

### RPC & tables

| Élément | Rôle |
|---------|------|
| `product_stock_logs` | Audit `old_stock` / `new_stock`, `changed_by` |
| `update_farmer_product_stock` | Mise à jour stock fermier (SECURITY DEFINER) |
| `get_product_stock_logs` | Historique par produit |
| `get_admin_stock_alerts` | Alertes dashboard admin |

### Fichiers ajoutés / modifiés

- `supabase/migrations/20260608140000_farmer_portal_phase2.sql`
- `src/backend/services/farmerProductService.js`
- `src/store/farmer/farmerSlice.js` — thunk `updateFarmerProductStock`
- `src/screens/Farmer/FarmerProductsScreen.jsx` — éditeur stock
- `src/components/admin/AdminStockAlertsSection.jsx`
- `src/screens/Admin/AdminDashboard.jsx` — intégration alertes

---

## 18. Implémentation Phase 3 (livré dans le code)

### Migration Supabase à exécuter

Dans **Supabase → SQL Editor**, exécuter le fichier :

`supabase/migrations/20260608160000_farmer_portal_phase3.sql`

### Parcours fermier

1. Espace producteur → **Produits** → **Proposer un nouveau produit**
2. Remplir le formulaire → **Enregistrer le brouillon**
3. Liste **Mes propositions** → **Soumettre** → statut `pending_review`
4. Notification à la publication ou au refus (avec motif)

### Parcours admin

1. Dashboard → section **Produits à valider** (approuver / refuser)
2. Gestion produits → filtre **À valider**
3. À l’approbation : saisir le prix de vente final → produit `published`

### RPC & colonnes

| Élément | Rôle |
|---------|------|
| `products.review_status` | `draft` → `pending_review` → `published` \| `rejected` |
| `upsert_farmer_product_proposal` | Créer / modifier un brouillon fermier |
| `submit_farmer_product_proposal` | Soumettre pour validation |
| `review_farmer_product` | Admin approuve ou rejette |
| `get_admin_pending_products` | File d’attente admin |

### Fichiers ajoutés / modifiés

- `supabase/migrations/20260608160000_farmer_portal_phase3.sql`
- `src/backend/services/farmerProposalService.js`
- `src/backend/services/adminProductReviewService.js`
- `src/screens/Farmer/FarmerProposalsScreen.jsx`
- `src/screens/Farmer/FarmerProductProposalScreen.jsx`
- `src/components/admin/AdminPendingProductsSection.jsx`
- `src/navigation/FarmerNavigator.jsx` — stack produits
- `src/backend/services/productService.js` — catalogue client = `published` only

*Document vivant — mettre à jour à chaque phase livrée.*
