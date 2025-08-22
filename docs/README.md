# Dream Market - Documentation de Cadrage

## Vue d'ensemble du projet

**Produit** : Application mobile Dream Market pour OFT (entreprise agricole en RDC)

**Objectif** : Plateforme d'achat de produits agricoles bio et de réservation de services spécialisés

**Public cible** : Particuliers et petits professionnels (ménages, revendeurs, restaurants)

**Modèle MVP** : Sans paiement intégré - règlement à la livraison ou via Mobile Money

---

## Navigation rapide

- [Vision & Périmètre MVP](./01-vision-perimetre-mvp.md)
- [Principes UX & Navigation](./02-principes-ux-navigation.md)
- [Règles Sécurité & Conformité](./03-regles-securite-conformite.md)
- [Stratégie Performance & Offline](./04-strategie-performance-offline.md)
- [Roadmap des Étapes](./05-roadmap-etapes.md)
- [Critères de Succès & Risques](./06-criteres-succes-risques.md)
- [Règles de Travail](./07-regles-travail.md)

---

## Technologies & Architecture

- **Framework** : Expo React Native
- **Langage** : JavaScript (extensions .jsx)
- **État global** : Redux Toolkit
- **Persistance** : expo-secure-store
- **Backend futur** : Supabase (PostgreSQL + Auth + Storage + RLS)
- **Navigation** : Tabs + Stacks

---

## Rôles utilisateurs

- **Client** : Parcours libre, connexion requise uniquement avant commande
- **Admin OFT** : Gestion catalogue, services, commandes, promotions sponsorisées

---

## Tonalité & Style

Local, authentique, professionnel, visuels soignés, cartes arrondies, ombres légères, images ratio 4:3 uniforme.
