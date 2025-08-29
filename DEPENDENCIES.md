# 📦 Dépendances - Dream Market App

## 🚀 **Installation des dépendances**

Exécutez la commande suivante pour installer toutes les dépendances nécessaires :

```bash
npm install
```

## 📱 **Dépendances principales**

### **React Native & Expo**
```json
{
  "expo": "^50.0.0",
  "react": "18.2.0",
  "react-native": "0.73.0",
  "react-native-safe-area-context": "^4.7.4",
  "react-native-screens": "^3.27.0"
}
```

### **Navigation**
```json
{
  "@react-navigation/native": "^6.1.9",
  "@react-navigation/bottom-tabs": "^6.5.11",
  "@react-navigation/stack": "^6.3.20",
  "@react-navigation/drawer": "^6.6.6"
}
```

### **Gestion d'état (Redux Toolkit)**
```json
{
  "@reduxjs/toolkit": "^1.9.7",
  "react-redux": "^8.1.3",
  "redux-persist": "^6.0.0"
}
```

### **Stockage sécurisé**
```json
{
  "expo-secure-store": "^12.8.1",
  "@react-native-async-storage/async-storage": "^1.21.0"
}
```

### **Icônes et UI**
```json
{
  "@expo/vector-icons": "^13.0.0",
  "react-native-vector-icons": "^10.0.3"
}
```

### **Images et médias**
```json
{
  "expo-image": "^1.10.0",
  "expo-image-picker": "^14.7.1",
  "react-native-fast-image": "^8.6.3"
}
```

### **Formulaires et validation**
```json
{
  "react-hook-form": "^7.48.2",
  "@hookform/resolvers": "^3.3.2",
  "yup": "^1.3.3"
}
```

### **Utilitaires**
```json
{
  "date-fns": "^2.30.0",
  "lodash": "^4.17.21",
  "react-native-reanimated": "^3.6.0",
  "react-native-gesture-handler": "^2.14.0"
}
```

## 🔧 **Dépendances de développement**

```json
{
  "@babel/core": "^7.20.0",
  "@types/react": "~18.2.45",
  "@types/react-native": "~0.72.8",
  "typescript": "^5.1.3",
  "eslint": "^8.45.0",
  "prettier": "^3.0.0"
}
```

## 📋 **Installation étape par étape**

### **Étape 1 : Dépendances de base**
```bash
npm install expo react react-native react-native-safe-area-context react-native-screens
```

### **Étape 2 : Navigation**
```bash
npm install @react-navigation/native @react-navigation/bottom-tabs @react-navigation/stack
```

### **Étape 3 : Redux Toolkit**
```bash
npm install @reduxjs/toolkit react-redux redux-persist
```

### **Étape 4 : Stockage**
```bash
npm install expo-secure-store @react-native-async-storage/async-storage
```

### **Étape 5 : Icônes et UI**
```bash
npm install @expo/vector-icons react-native-vector-icons
```

### **Étape 6 : Images et médias**
```bash
npm install expo-image expo-image-picker
```

### **Étape 7 : Formulaires**
```bash
npm install react-hook-form @hookform/resolvers yup
```

### **Étape 8 : Utilitaires**
```bash
npm install date-fns lodash
```

## 🚨 **Dépendances optionnelles (à installer selon les besoins)**

### **Animations avancées**
```bash
npm install react-native-reanimated react-native-gesture-handler
```

### **Tests**
```bash
npm install --save-dev jest @testing-library/react-native @testing-library/jest-native
```

### **Linting et formatage**
```bash
npm install --save-dev eslint prettier @typescript-eslint/eslint-plugin @typescript-eslint/parser
```

## 📱 **Configuration post-installation**

### **1. Configuration Expo**
```bash
npx expo install --fix
```

### **2. Configuration iOS (si nécessaire)**
```bash
cd ios && pod install && cd ..
```

### **3. Configuration Android (si nécessaire)**
```bash
npx react-native link
```

## 🔍 **Vérification de l'installation**

Après l'installation, vérifiez que tout fonctionne :

```bash
# Démarrer l'application
npx expo start

# Vérifier les dépendances
npm list --depth=0
```

## 📊 **Versions recommandées**

- **Node.js** : 18.x ou 20.x
- **npm** : 9.x ou 10.x
- **Expo CLI** : 6.x ou 7.x
- **React Native** : 0.73.x

## 🚨 **Résolution des problèmes courants**

### **Erreur de version incompatible**
```bash
npm install --force
```

### **Cache npm corrompu**
```bash
npm cache clean --force
```

### **Dépendances manquantes**
```bash
rm -rf node_modules package-lock.json
npm install
```

## 📋 **Checklist d'installation**

- [ ] Node.js installé (version 18+)
- [ ] npm installé (version 9+)
- [ ] Expo CLI installé
- [ ] Dépendances de base installées
- [ ] Navigation configurée
- [ ] Redux Toolkit configuré
- [ ] Stockage sécurisé configuré
- [ ] Icônes configurées
- [ ] Application qui démarre sans erreur

## 🎯 **Prochaines étapes après l'installation**

1. **Configurer le thème** ✅ (Déjà fait)
2. **Créer la structure des dossiers**
3. **Configurer Redux Toolkit**
4. **Mettre en place la navigation**
5. **Créer les composants UI de base**
6. **Implémenter les écrans principaux**
