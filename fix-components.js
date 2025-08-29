const fs = require('fs');
const path = require('path');

// Fichiers à corriger
const files = [
  'src/components/home/NewProductsSection.jsx',
  'src/components/home/PopularProductsSection.jsx'
];

files.forEach(filePath => {
  console.log(`Correction de ${filePath}...`);
  
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Remplacer les HorizontalRail onSeeAll par showSeeAll={false}
    content = content.replace(
      /(\s+)onSeeAll={onSeeAllPress}(\s+)\}/g,
      '$1showSeeAll={false}$2}'
    );
    
    // Remplacer dans le return final si nécessaire
    content = content.replace(
      /(\s+)onSeeAll={onSeeAllPress}(\s+)\/>/g,
      '$1ctaText="Voir tout"$2onCtaPress={onSeeAllPress}$2/>'
    );
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ ${filePath} corrigé`);
    
  } catch (error) {
    console.error(`❌ Erreur lors de la correction de ${filePath}:`, error.message);
  }
});

console.log('\n🎉 Corrections terminées !');






