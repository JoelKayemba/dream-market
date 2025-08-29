# User Stories & Flows - Dream Market

## User Stories - Client

### Navigation et découverte
- **En tant que** visiteur
- **Je veux** parcourir le catalogue sans créer de compte
- **Afin de** découvrir les produits disponibles avant de m'engager

- **En tant que** visiteur
- **Je veux** voir les produits vedettes sur la page d'accueil
- **Afin de** identifier rapidement les offres intéressantes

- **En tant que** visiteur
- **Je veux** filtrer les produits par catégorie et prix
- **Afin de** trouver rapidement ce qui m'intéresse

### Gestion du panier
- **En tant que** visiteur
- **Je veux** ajouter des produits au panier
- **Afin de** préparer ma commande

- **En tant que** visiteur
- **Je veux** modifier les quantités dans mon panier
- **Afin de** ajuster ma commande selon mes besoins

- **En tant que** visiteur
- **Je veux** voir le total de ma commande
- **Afin de** connaître le montant à payer

### Authentification et commande
- **En tant que** visiteur avec panier
- **Je veux** créer un compte rapidement
- **Afin de** finaliser ma commande

- **En tant que** utilisateur connecté
- **Je veux** confirmer ma commande
- **Afin de** recevoir mes produits

- **En tant que** utilisateur connecté
- **Je veux** recevoir une confirmation par email
- **Afin de** avoir une trace de ma commande

### Services et réservations
- **En tant que** visiteur
- **Je veux** consulter les services disponibles
- **Afin de** identifier les prestations qui m'intéressent

- **En tant que** utilisateur connecté
- **Je veux** réserver un créneau de service
- **Afin de** bénéficier de l'expertise agricole

### Suivi et support
- **En tant que** utilisateur connecté
- **Je veux** consulter l'historique de mes commandes
- **Afin de** suivre mes achats précédents

- **En tant que** utilisateur connecté
- **Je veux** contacter le support via WhatsApp
- **Afin de** résoudre rapidement mes problèmes

## User Stories - Admin OFT

### Gestion du catalogue
- **En tant qu'** administrateur OFT
- **Je veux** ajouter de nouveaux produits
- **Afin de** enrichir l'offre disponible

- **En tant qu'** administrateur OFT
- **Je veux** modifier les informations des produits
- **Afin de** maintenir le catalogue à jour

- **En tant qu'** administrateur OFT
- **Je veux** gérer les promotions sponsorisées
- **Afin de** optimiser la visibilité des produits

### Gestion des services
- **En tant qu'** administrateur OFT
- **Je veux** configurer les services disponibles
- **Afin de** proposer une gamme complète

- **En tant qu'** administrateur OFT
- **Je veux** gérer les créneaux de réservation
- **Afin de** optimiser l'utilisation des ressources

### Suivi des commandes
- **En tant qu'** administrateur OFT
- **Je veux** voir toutes les commandes en cours
- **Afin de** organiser la préparation

- **En tant qu'** administrateur OFT
- **Je veux** mettre à jour le statut des commandes
- **Afin de** informer les clients de l'avancement

- **En tant qu'** administrateur OFT
- **Je veux** envoyer des notifications aux clients
- **Afin de** maintenir une communication proactive

## Parcours utilisateur détaillés

### Parcours d'achat principal

#### 1. Accueil et découverte
```
Écran d'accueil
├── Bannière principale avec message marketing
├── Produits vedettes (avec badge "Sponsorisé" si applicable)
├── Services populaires
└── Navigation vers catalogue ou services
```

#### 2. Navigation catalogue
```
Écran catalogue
├── Grille de produits avec images
├── Filtres (catégorie, prix, disponibilité)
├── Barre de recherche
└── Sélection d'un produit
```

#### 3. Consultation produit
```
Écran détails produit
├── Galerie d'images (ratio 4:3)
├── Informations produit (nom, description, prix)
├── Disponibilité et stock
├── Bouton "Ajouter au panier"
└── Produits similaires
```

#### 4. Gestion panier
```
Écran panier
├── Liste des produits sélectionnés
├── Quantités modifiables
├── Calcul du total
├── Bouton "Passer la commande"
└── Retour au catalogue
```

#### 5. Checkout et authentification
```
Écran checkout
├── Récapitulatif de la commande
├── Informations de livraison
├── Gate d'authentification
│   ├── Connexion existant
│   └── Création de compte
└── Confirmation de commande
```

#### 6. Confirmation
```
Écran confirmation
├── Numéro de commande
├── Récapitulatif des produits
├── Instructions de retrait
├── Email de confirmation envoyé
└── Retour à l'accueil
```

### Parcours de réservation de service

#### 1. Consultation services
```
Écran services
├── Liste des services disponibles
├── Descriptions et tarifs
├── Sélection d'un service
└── Navigation vers détails
```

#### 2. Détails et réservation
```
Écran détails service
├── Description complète du service
├── Tarifs et conditions
├── Calendrier des créneaux
├── Sélection d'un créneau
└── Bouton "Réserver"
```

#### 3. Processus de réservation
```
Écran réservation
├── Récapitulatif du service
├── Créneau sélectionné
├── Informations personnelles
├── Gate d'authentification
└── Confirmation de réservation
```

## Points de conversion et Auth Gate

### Principe de l'Auth Gate
- **Objectif** : Minimiser la friction tout en collectant les informations nécessaires
- **Timing** : Authentification requise uniquement au moment de la finalisation
- **Avantages** : 
  - Réduction du taux d'abandon
  - Collecte d'informations qualifiées
  - Expérience utilisateur fluide

### Implémentation technique
```javascript
// Exemple de logique Auth Gate
const requiresAuth = (action) => {
  const authRequiredActions = ['checkout', 'service_booking'];
  return authRequiredActions.includes(action);
};

const handleAction = (action, user) => {
  if (requiresAuth(action) && !user) {
    // Redirection vers l'authentification
    navigateToAuth(action);
  } else {
    // Exécution de l'action
    executeAction(action);
  }
};
```

## Gestion des états et feedback

### États de chargement
- **Skeleton screens** : Placeholders pendant le chargement des données
- **Indicateurs de progression** : Barres de progression pour les actions longues
- **Messages contextuels** : Informations sur l'état actuel

### Feedback utilisateur
- **Confirmations visuelles** : Animation ou changement d'état après une action
- **Messages de succès** : Confirmation claire des actions réussies
- **Gestion des erreurs** : Messages d'erreur explicites avec solutions

## Communication et notifications

### Email de confirmation
- **Contenu** : Récapitulatif de la commande, instructions de retrait
- **Design** : Template professionnel aux couleurs OFT
- **Timing** : Envoi immédiat après confirmation

### Contact WhatsApp
- **Intégration** : Lien direct vers WhatsApp avec message pré-rempli
- **Contexte** : Support client, questions sur les commandes
- **Avantages** : Communication rapide et familière en RDC

## Métriques de suivi des parcours

### KPIs de conversion
- **Taux de complétion panier** : % de paniers qui deviennent des commandes
- **Temps de parcours** : Durée moyenne de l'accueil à la commande
- **Taux d'abandon** : % d'utilisateurs qui quittent avant la finalisation

### Points de friction identifiés
- **Page de connexion** : Temps passé sur l'authentification
- **Formulaire de commande** : Complexité des champs requis
- **Confirmation finale** : Clarté des instructions de retrait

## Optimisations et améliorations

### Réduction de la friction
- **Formulaires simplifiés** : Champs minimaux requis
- **Validation en temps réel** : Feedback immédiat sur les erreurs
- **Sauvegarde automatique** : Conservation des données en cas d'interruption

### Amélioration de l'expérience
- **Suggestions intelligentes** : Recommandations basées sur l'historique
- **Navigation contextuelle** : Liens vers les actions probables
- **Support multilingue** : Interface en français avec support local

## Tests et validation

### Tests utilisateur
- **Scénarios de test** : Parcours complets d'achat et de réservation
- **Métriques** : Temps de tâche, taux de succès, satisfaction
- **Feedback qualitatif** : Commentaires et suggestions d'amélioration

### Tests d'accessibilité
- **Navigation clavier** : Validation de l'accessibilité
- **Lecteurs d'écran** : Test avec VoiceOver/TalkBack
- **Contraste et lisibilité** : Validation des standards WCAG

## Conclusion

Les user stories et parcours utilisateur de Dream Market sont conçus pour maximiser la simplicité et l'efficacité. L'Auth Gate stratégiquement placé permet de collecter les informations nécessaires tout en minimisant la friction. Les parcours sont optimisés pour une expérience fluide et intuitive, adaptée au contexte RDC et aux habitudes des utilisateurs locaux.

