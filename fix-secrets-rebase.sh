#!/bin/bash
# Script pour nettoyer les secrets du commit f52bcb2

# Sauvegarder l'état actuel
echo "📦 Sauvegarde de l'état actuel..."
git branch backup-before-rebase

# Faire un rebase interactif depuis le commit avant f52bcb2
echo "🔧 Démarrage du rebase interactif..."
echo "Dans l'éditeur qui s'ouvre :"
echo "  1. Trouvez la ligne avec 'f52bcb2 changement connexion'"
echo "  2. Remplacez 'pick' par 'edit'"
echo "  3. Sauvegardez et fermez"
echo ""
echo "Ensuite, dans le terminal, exécutez :"
echo "  git checkout f52bcb2 -- DEBUG_EMAIL_BREVO.md"
echo "  # Modifier DEBUG_EMAIL_BREVO.md pour retirer les secrets"
echo "  git checkout f52bcb2 -- eas.json"
echo "  # Modifier eas.json pour retirer les secrets"
echo "  git add DEBUG_EMAIL_BREVO.md eas.json"
echo "  git commit --amend --no-edit"
echo "  git rebase --continue"

git rebase -i f2c70b2

