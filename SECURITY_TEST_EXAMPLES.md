# Exemples de tests de sécurité

Ce document contient des exemples de données malveillantes pour tester la protection contre les attaques XSS, injection SQL, et autres vulnérabilités.

## ⚠️ IMPORTANT
Ces exemples sont destinés **UNIQUEMENT** à tester la sécurité de votre application. Ne les utilisez jamais dans un environnement de production avec de vraies données.

## 🧪 Comment tester

### 1. Test via l'interface utilisateur
- Ouvrez l'application
- Accédez aux formulaires (inscription, feedback, création de produit, etc.)
- Essayez d'entrer les exemples ci-dessous dans les champs
- Vérifiez que les données sont rejetées ou nettoyées

### 2. Test via les services backend
- Utilisez les outils de développement (React Native Debugger, etc.)
- Appelez directement les services avec ces données
- Vérifiez les erreurs retournées

---

## 📝 Exemples de tests par type d'attaque

### 1. Attaques XSS (Cross-Site Scripting)

#### Dans un champ texte (nom, description, etc.) :
```
<script>alert('XSS')</script>
<img src=x onerror=alert('XSS')>
<iframe src="javascript:alert('XSS')"></iframe>
<svg onload=alert('XSS')>
javascript:alert('XSS')
onclick=alert('XSS')
```

**Résultat attendu** : Les balises `<script>`, `<iframe>`, `<img>` et les event handlers (`onclick`, `onerror`, etc.) doivent être supprimés.

#### Test dans :
- **Feedback** : Champ "Sujet" ou "Message"
- **Produit** : Champ "Nom" ou "Description"
- **Ferme** : Champ "Nom" ou "Description"
- **Service** : Champ "Nom" ou "Description"

---

### 2. Injection SQL

#### Dans un champ texte :
```
'; DROP TABLE users; --
' OR '1'='1
' UNION SELECT * FROM users --
1' OR '1'='1
admin'--
```

**Résultat attendu** : Les caractères spéciaux SQL doivent être échappés ou supprimés. Supabase utilise des requêtes paramétrées, donc ces attaques ne devraient pas fonctionner, mais le nettoyage ajoute une couche de sécurité supplémentaire.

#### Test dans :
- **Connexion** : Champ "Email"
- **Feedback** : Tous les champs texte
- **Recherche** : Champ de recherche

---

### 3. Caractères de contrôle et encodage

#### Dans un champ texte :
```
\x00\x01\x02\x03 (caractères de contrôle)
%3Cscript%3Ealert('XSS')%3C/script%3E (URL encodé)
&lt;script&gt;alert('XSS')&lt;/script&gt; (HTML encodé)
```

**Résultat attendu** : Les caractères de contrôle doivent être supprimés.

#### Test dans :
- Tous les champs texte

---

### 4. Données trop longues

#### Dans un champ texte :
```
A répéter 10000 fois : "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa..."
```

**Résultat attendu** : Le texte doit être tronqué à la longueur maximale autorisée.

#### Test dans :
- **Feedback** : Sujet (max 255), Message (max 10000)
- **Produit** : Nom (max 255), Description (max 5000)
- **Email** : (max 255)

---

### 5. Emails invalides

#### Dans le champ email :
```
notanemail
@domain.com
user@
user@domain
user@domain.
user@domain..com
<script>alert('XSS')</script>@domain.com
user@domain.com<script>alert('XSS')</script>
```

**Résultat attendu** : Tous doivent être rejetés avec un message d'erreur "Format d'email invalide".

#### Test dans :
- **Inscription** : Champ "Email"
- **Connexion** : Champ "Email"
- **Réinitialisation mot de passe** : Champ "Email"
- **Commande** : Champ "Email client"

---

### 6. Numéros de téléphone invalides

#### Dans le champ téléphone :
```
123 (trop court)
12345678901234567890 (trop long)
+243 858 000 217<script>alert('XSS')</script>
abc123def456
```

**Résultat attendu** : Les numéros invalides doivent être rejetés. Les caractères non numériques (sauf +, espaces, tirets) doivent être supprimés.

#### Test dans :
- **Inscription** : Champ "Téléphone"
- **Profil** : Champ "Téléphone"
- **Ferme** : Champ "Téléphone"
- **Commande** : Champ "Téléphone"

---

### 7. URLs invalides

#### Dans le champ URL (site web) :
```
javascript:alert('XSS')
<script>alert('XSS')</script>
not-a-url
http://
https://domain
ftp://malicious.com
```

**Résultat attendu** : Seules les URLs avec les protocoles autorisés (http, https, mailto) doivent être acceptées.

#### Test dans :
- **Ferme** : Champ "Site web"

---

### 8. Nombres invalides

#### Dans un champ numérique (prix, rating, etc.) :
```
-100 (négatif non autorisé)
abc123
999999999999999999 (trop grand)
<script>alert('XSS')</script>
```

**Résultat attendu** : Les valeurs invalides doivent être rejetées.

#### Test dans :
- **Produit** : Champ "Prix" (doit être ≥ 0)
- **Service** : Champ "Prix" (doit être ≥ 0)
- **Feedback** : Champ "Rating" (doit être entre 1 et 5)

---

### 9. Tableaux (images, tags, etc.)

#### Dans un tableau d'URLs/images :
```
['https://valid-url.com/image.jpg', '<script>alert("XSS")</script>', 'javascript:alert("XSS")']
```

**Résultat attendu** : Les URLs malveillantes doivent être nettoyées ou supprimées.

#### Test dans :
- **Produit** : Champ "Images"
- **Ferme** : Champ "Images"
- **Service** : Champ "Images"

---

## 🎯 Scénarios de test complets

### Scénario 1 : Création d'un feedback malveillant

1. Allez dans **Profil** → **Feedback**
2. Remplissez le formulaire avec :
   - **Type** : Bug
   - **Sujet** : `<script>alert('XSS')</script>Test`
   - **Message** : `'; DROP TABLE feedbacks; -- <iframe src="javascript:alert('XSS')"></iframe>`
   - **Rating** : `-5` (puis essayez `10`)

**Résultat attendu** :
- Le sujet doit être nettoyé (sans les balises `<script>`)
- Le message doit être nettoyé (sans les balises `<iframe>` et les tentatives SQL)
- Le rating doit être rejeté s'il est invalide

---

### Scénario 2 : Inscription avec données malveillantes

1. Allez dans **Inscription**
2. Remplissez le formulaire avec :
   - **Email** : `<script>alert('XSS')</script>@domain.com`
   - **Prénom** : `'; DROP TABLE users; --`
   - **Nom** : `<img src=x onerror=alert('XSS')>`
   - **Téléphone** : `abc123<script>alert('XSS')</script>`
   - **Adresse** : `Avenue Lufira<script>alert('XSS')</script>`

**Résultat attendu** :
- Email invalide → Erreur "Format d'email invalide"
- Prénom et nom nettoyés (sans les tentatives SQL et balises)
- Téléphone nettoyé (seulement les chiffres et caractères autorisés)
- Adresse nettoyée (sans les balises)

---

### Scénario 3 : Création d'un produit avec données malveillantes

1. Allez dans **Admin** → **Gestion des Produits** → **Ajouter**
2. Remplissez le formulaire avec :
   - **Nom** : `<script>alert('XSS')</script>Produit Test`
   - **Description** : `Description normale avec <iframe src="javascript:alert('XSS')"></iframe>`
   - **Prix** : `-100` (puis `abc123`)
   - **Devise** : `EUR` (non autorisée, doit devenir `CDF`)

**Résultat attendu** :
- Nom nettoyé
- Description nettoyée (sans `<iframe>`)
- Prix rejeté s'il est négatif ou invalide
- Devise corrigée en `CDF` si non autorisée

---

### Scénario 4 : Réinitialisation de mot de passe

1. Allez dans **Mot de passe oublié**
2. Essayez avec :
   - **Email** : `<script>alert('XSS')</script>@domain.com`
   - **Code** : `abc123` (doit être 6 chiffres)
   - **Nouveau mot de passe** : `123` (trop court, minimum 6 caractères)

**Résultat attendu** :
- Email invalide → Erreur
- Code invalide → Erreur "Code de réinitialisation invalide"
- Mot de passe trop court → Erreur "Le mot de passe doit contenir au moins 6 caractères"

---

## ✅ Checklist de vérification

Après avoir testé, vérifiez que :

- [ ] Les balises `<script>`, `<iframe>`, `<img>` sont supprimées
- [ ] Les event handlers (`onclick`, `onerror`, etc.) sont supprimés
- [ ] Les tentatives d'injection SQL sont neutralisées
- [ ] Les emails invalides sont rejetés
- [ ] Les téléphones invalides sont rejetés ou nettoyés
- [ ] Les URLs invalides sont rejetées
- [ ] Les nombres invalides sont rejetés
- [ ] Les textes trop longs sont tronqués
- [ ] Les caractères de contrôle sont supprimés
- [ ] Les tableaux sont nettoyés

---

## 🔍 Où vérifier les résultats

1. **Console du navigateur/app** : Vérifiez les erreurs retournées
2. **Base de données Supabase** : Vérifiez que les données stockées sont propres
3. **Interface utilisateur** : Vérifiez que les données affichées sont sécurisées

---

## 📌 Notes importantes

- Ces tests doivent être effectués dans un environnement de **développement/test**
- Ne testez **JAMAIS** avec de vraies données utilisateur
- Les erreurs retournées doivent être claires mais ne pas révéler d'informations sensibles
- Tous les champs doivent être validés **avant** d'être envoyés à Supabase

