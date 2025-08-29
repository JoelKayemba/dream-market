// 🏠 Composants de l'accueil - Dream Market App
// Export centralisé de tous les composants spécifiques à l'écran d'accueil

// 🎯 Composants principaux de l'accueil
export { default as HeroBanner } from './HeroBanner';
export { default as CategoriesGrid } from './CategoriesGrid';
export { default as SponsoredSlider } from './SponsoredSlider';
export { default as ServicesSection } from './ServicesSection';

// 📱 Composants de navigation rapide
export { default as QuickActions } from './QuickActions';
export { default as SearchBar } from './SearchBar';
export { default as NotificationBanner } from './NotificationBanner';

// 🌾 Composants de contenu agricole
export { default as FeaturedProducts } from './FeaturedProducts';
export { default as SeasonalHighlights } from './SeasonalHighlights';
export { default as FarmSpotlight } from './FarmSpotlight';

// 📊 Composants d'information
export { default as StatsOverview } from './StatsOverview';
export { default as NewsSection } from './NewsSection';
export { default as TipsSection } from './TipsSection';

// 🔗 Composants de connexion
export { default as CallToAction } from './CallToAction';
export { default as SocialProof } from './SocialProof';
export { default as NewsletterSignup } from './NewsletterSignup';

// 📋 Export par défaut
export default {
  // Composants principaux
  HeroBanner,
  CategoriesGrid,
  SponsoredSlider,
  ServicesSection,
  
  // Navigation rapide
  QuickActions,
  SearchBar,
  NotificationBanner,
  
  // Contenu agricole
  FeaturedProducts,
  SeasonalHighlights,
  FarmSpotlight,
  
  // Informations
  StatsOverview,
  NewsSection,
  TipsSection,
  
  // Connexion
  CallToAction,
  SocialProof,
  NewsletterSignup,
};


