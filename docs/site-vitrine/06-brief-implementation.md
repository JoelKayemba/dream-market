# Brief d'implémentation du site

Ce document décrit comment transformer les contenus du dossier en site vitrine.

## Type de site recommandé

Site vitrine responsive, rapide et facile à maintenir.

Options techniques possibles :

- **Next.js** : recommandé si le site doit être évolutif, SEO propre, pages légales, blog futur.
- **Astro** : excellent pour un site vitrine très rapide avec peu d'interactivité.
- **React + Vite** : simple si l'équipe veut rester proche de React.
- **Webflow / Framer** : rapide si priorité au design sans développement lourd.

Recommandation :

Utiliser **Next.js** ou **Astro** pour un rendu professionnel, rapide et bien référencé.

## Arborescence web proposée

```text
/
/application
/produits-services
/a-propos
/equipe
/faq
/contact
/telecharger
/confidentialite
/conditions-utilisation
/conditions-commande-livraison
/mentions-legales
```

## Sections de la homepage

Ordre recommandé :

1. Header.
2. Hero.
3. Logo ou preuve courte.
4. Problème.
5. Solution.
6. Fonctionnalités.
7. Captures d'écran.
8. Produits et services.
9. Dream Field.
10. Équipe courte.
11. FAQ courte.
12. CTA téléchargement.
13. Footer.

## Composants nécessaires

- Header responsive.
- Bouton principal.
- Bouton secondaire.
- Hero avec mockup téléphone.
- Carte fonctionnalité.
- Carte capture d'écran.
- Carte valeur.
- Carte équipe.
- Accordéon FAQ.
- Formulaire contact.
- Footer légal.
- Bannière cookies si nécessaire.

## SEO

Titres recommandés :

Accueil :

```text
Dream Market - Produits agricoles frais et services agricoles
```

Description :

```text
Dream Market est une application mobile qui simplifie l'achat de produits agricoles frais et l'accès à des services agricoles locaux avec Dream Field.
```

Mots clés :

- Dream Market.
- Dream Field.
- produits agricoles.
- produits frais.
- agriculture RDC.
- commande produits agricoles.
- services agricoles.
- application agricole.
- livraison produits frais.

## Référencement local

Prévoir :

- Adresse complète dans le footer.
- Numéro WhatsApp cliquable.
- Email cliquable.
- Page contact claire.
- Données structurées `Organization` si possible.

## Performance

Objectifs :

- Chargement rapide sur mobile.
- Images compressées.
- Captures en WebP si possible.
- Lazy loading pour les sections basses.
- Aucun script marketing inutile au lancement.

## Accessibilité

À respecter :

- Contraste suffisant.
- Boutons lisibles.
- Navigation clavier.
- Textes alternatifs pour images.
- Labels sur formulaire.
- Taille texte confortable sur mobile.

## Formulaire de contact

Champs :

- Nom complet.
- Email.
- Téléphone.
- Sujet.
- Message.

Sujets suggérés :

- Question générale.
- Support application.
- Devenir producteur partenaire.
- Service agricole.
- Presse ou partenariat.

## Téléchargement application

Prévoir une section avec :

- Bouton Google Play.
- Bouton App Store.
- QR code si disponible.
- Message temporaire si l'application n'est pas encore publiée.

Texte si publication en attente :

```text
L'application Dream Market sera bientôt disponible. Contactez-nous pour être informé du lancement.
```

## Contenus à collecter

- Logo Dream Market.
- Logo Dream Field.
- Captures d'écran listées dans `04-captures-ecrans.md`.
- Photos équipe.
- Texte officiel sur Dream Field.
- Noms et rôles des membres.
- Liens App Store / Play Store.
- Informations légales exactes.
- Témoignages clients ou partenaires.

## Première version minimale

Si le temps est limité, créer seulement :

- Accueil.
- Application.
- À propos.
- Contact.
- Politique de confidentialité.
- Conditions d'utilisation.
- Mentions légales.

Les pages Équipe, FAQ détaillée et Produits & Services peuvent venir juste après.
