# Product Brief - Dream Market MVP

## Contexte & Cible

### Entreprise
**OFT (Organisation pour la Formation et le Travail)** - Entreprise agricole établie en RDC, spécialisée dans la production et la distribution de produits agricoles bio et de qualité.

### Marché cible
- **Ménages** : Consommateurs finaux cherchant des produits frais et locaux
- **Revendeurs** : Petits commerçants et distributeurs locaux
- **Restaurants** : Établissements de restauration soucieux de la qualité des ingrédients

### Contexte RDC
- Marché agricole en pleine croissance
- Demande croissante pour des produits bio et tracés
- Infrastructure numérique en développement
- Importance de la proximité et de la confiance

## Objectif MVP

### Vision
Créer une application mobile simple et intuitive permettant aux clients d'acheter des produits agricoles et de réserver des services spécialisés, tout en maintenant la simplicité opérationnelle.

### Objectifs principaux
- **Simplifier l'achat** : Réduire la friction entre le producteur et le consommateur
- **Démocratiser l'accès** : Rendre les produits de qualité accessibles à tous
- **Valoriser le local** : Mettre en avant la proximité et la fraîcheur
- **Faciliter la réservation** : Simplifier l'accès aux services agricoles

### Modèle économique MVP
- **Paiement hors application** : Règlement à la livraison ou via Mobile Money
- **Pas de commission** : Prix direct du producteur
- **Focus sur le volume** : Priorité à l'adoption et à l'expérience utilisateur

## Rôles et Permissions

### Client (Utilisateur final)
- **Navigation libre** : Consultation du catalogue sans compte
- **Authentification** : Connexion obligatoire uniquement avant commande/réservation
- **Actions autorisées** :
  - Parcourir le catalogue
  - Ajouter au panier
  - Consulter les détails produits
  - Passer des commandes
  - Réserver des services
  - Consulter l'historique

### Admin OFT
- **Gestion catalogue** : Ajout, modification, suppression de produits
- **Gestion services** : Configuration des services disponibles
- **Suivi commandes** : Validation, suivi, mise à jour des statuts
- **Promotions sponsorisées** : Gestion des mises en avant payantes
- **Notifications** : Communication avec les clients
- **Analytics** : Suivi des performances et comportements

## Parcours utilisateur clés

### Parcours d'achat principal
```
Accueil → Catalogue → Sélection Produit → Panier → Checkout (Auth Gate) → Confirmation
```

### Parcours de réservation
```
Accueil → Services → Sélection Service → Réservation (Auth Gate) → Confirmation
```

### Points de conversion
- **Auth Gate** : Seuil d'authentification au moment de la finalisation
- **Panier** : Sauvegarde automatique des sélections
- **Confirmation** : Récapitulatif clair et instructions de retrait

## Accroches marketing

### Slogans principaux
- **"Du champ à votre table."**
  - Évoque la traçabilité et la fraîcheur
  - Met l'accent sur la proximité géographique

- **"Fraîcheur locale, choix responsable."**
  - Valorise le circuit court
  - Appelle à la responsabilité environnementale

### Accroches secondaires
- **"Des produits vrais, des producteurs proches."**
  - Authenticité et transparence
  - Relation humaine préservée

- **"Réservez votre expertise agricole en 2 clics."**
  - Simplicité d'usage
  - Focus sur les services

## Fonctionnalités MVP

### Fonctionnalités client
- [ ] **Catalogue produits** : Navigation, filtres, recherche
- [ ] **Panier d'achat** : Ajout, modification, persistance
- [ ] **Processus de commande** : Checkout simplifié
- [ ] **Réservation services** : Sélection et réservation
- [ ] **Profil utilisateur** : Gestion des informations
- [ ] **Suivi commandes** : Historique et statuts

### Fonctionnalités admin
- [ ] **Gestion catalogue** : CRUD produits
- [ ] **Gestion services** : Configuration et disponibilités
- [ ] **Suivi commandes** : Tableau de bord opérationnel
- [ ] **Promotions** : Gestion des contenus sponsorisés
- [ ] **Communication** : Notifications et emails

## Critères de succès

### Métriques quantitatives
- **Taux de conversion** : >70% des paniers deviennent des commandes
- **Temps de parcours** : <2 minutes de l'accueil à la commande
- **Adoption** : 80% des utilisateurs testeurs recommandent l'app

### Métriques qualitatives
- **Satisfaction utilisateur** : Note moyenne >4/5
- **Simplicité perçue** : Interface intuitive et fluide
- **Confiance** : Sentiment de sécurité et de transparence

## Contraintes et limitations

### Contraintes techniques
- **Paiement** : Pas d'intégration de moyens de paiement
- **Backend** : Gestion initiale via Supabase Dashboard
- **Notifications** : Pas de push notifications avancées

### Contraintes opérationnelles
- **Livraison** : Retrait en point de vente uniquement
- **Support** : Support client basique (email + WhatsApp)
- **Gestion** : Équipe OFT limitée pour la gestion

## Évolution future

### Phase 2 (Post-MVP)
- Intégration de moyens de paiement
- Système de livraison à domicile
- Notifications push avancées
- Dashboard admin complet

### Phase 3 (Évolution)
- Marketplace multi-producteurs
- Système de fidélité
- Analytics avancées
- Intégrations tierces

## Conclusion

Le MVP Dream Market vise à créer une expérience d'achat simple et transparente pour les produits agricoles locaux, en mettant l'accent sur la proximité, la qualité et la simplicité d'usage. L'objectif est de valider le concept et d'établir une base solide pour l'évolution future de la plateforme.
