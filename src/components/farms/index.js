// 🏡 Composants des fermes - Dream Market App
// Export centralisé de tous les composants liés aux fermes

// 🎯 Composants principaux des fermes
// export { default as FarmCard } from './FarmCard'; // Utilise celui de ui/FarmCard.jsx
export { default as FarmGallery } from './FarmGallery';
export { default as FarmInfo } from './FarmInfo';
export { default as FarmHeader } from './FarmHeader';

// 📱 Composants de liste et grille
export { default as FarmList } from './FarmList';
export { default as FarmGrid } from './FarmGrid';
export { default as FarmCarousel } from './FarmCarousel';
export { default as FarmRow } from './FarmRow';

// 🖼️ Composants de galerie et images
export { default as ImageCarousel } from './ImageCarousel';
export { default as ThumbnailGrid } from './ThumbnailGrid';
export { default as FullscreenImage } from './FullscreenImage';
export { default as ImageOverlay } from './ImageOverlay';

// 📊 Composants d'information de ferme
export { default as FarmStats } from './FarmStats';
export { default as FarmCertifications } from './FarmCertifications';
export { default as FarmSpecialties } from './FarmSpecialties';
export { default as FarmSchedule } from './FarmSchedule';

// 📍 Composants de localisation
export { default as FarmLocation } from './FarmLocation';
export { default as MapView } from './MapView';
export { default as AddressDisplay } from './AddressDisplay';
export { default as DirectionsButton } from './DirectionsButton';

// 🌾 Composants de contenu agricole
export { default as FarmProducts } from './FarmProducts';
export { default as FarmServices } from './FarmServices';
export { default as FarmStory } from './FarmStory';
export { default as FarmHistory } from './FarmHistory';

// ⭐ Composants d'évaluation et avis
export { default as FarmRating } from './FarmRating';
export { default as ReviewList } from './ReviewList';
export { default as ReviewCard } from './ReviewCard';
export { default as RatingSummary } from './RatingSummary';

// 🔗 Composants de contact et interaction
export { default as ContactInfo } from './ContactInfo';
export { default as ContactButtons } from './ContactButtons';
export { default as SocialLinks } from './SocialLinks';
export { default as VisitButton } from './VisitButton';

// 📋 Export par défaut
export default {
  // Composants principaux
  // FarmCard, // Utilise celui de ui/FarmCard.jsx
  FarmGallery,
  FarmInfo,
  FarmHeader,
  
  // Liste et grille
  FarmList,
  FarmGrid,
  FarmCarousel,
  FarmRow,
  
  // Galerie et images
  ImageCarousel,
  ThumbnailGrid,
  FullscreenImage,
  ImageOverlay,
  
  // Information de ferme
  FarmStats,
  FarmCertifications,
  FarmSpecialties,
  FarmSchedule,
  
  // Localisation
  FarmLocation,
  MapView,
  AddressDisplay,
  DirectionsButton,
  
  // Contenu agricole
  FarmProducts,
  FarmServices,
  FarmStory,
  FarmHistory,
  
  // Évaluation et avis
  FarmRating,
  ReviewList,
  ReviewCard,
  RatingSummary,
  
  // Contact et interaction
  ContactInfo,
  ContactButtons,
  SocialLinks,
  VisitButton,
};


