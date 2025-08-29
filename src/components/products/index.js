// 🛍️ Composants des produits - Dream Market App
// Export centralisé de tous les composants liés aux produits

// 🎯 Composants principaux des produits
export { default as ProductCard } from './ProductCard';
export { default as ProductGrid } from './ProductGrid';
export { default as ProductFilter } from './ProductFilter';
export { default as SearchBar } from './SearchBar';

// 📱 Composants de liste et grille
export { default as ProductList } from './ProductList';
export { default as ProductCarousel } from './ProductCarousel';
export { default as ProductRow } from './ProductRow';
export { default as ProductColumn } from './ProductColumn';

// 🔍 Composants de recherche et filtrage
export { default as FilterPanel } from './FilterPanel';
export { default as SortDropdown } from './SortDropdown';
export { default as CategoryFilter } from './CategoryFilter';
export { default as PriceRangeFilter } from './PriceRangeFilter';

// 📊 Composants d'affichage des produits
export { default as ProductImage } from './ProductImage';
export { default as ProductInfo } from './ProductInfo';
export { default as ProductActions } from './ProductActions';
export { default as ProductBadges } from './ProductBadges';

// 🏷️ Composants d'étiquetage
export { default as PriceTag } from './PriceTag';
export { default as StockIndicator } from './StockIndicator';
export { default as AvailabilityBadge } from './AvailabilityBadge';
export { default as OrganicBadge } from './OrganicBadge';

// ⭐ Composants d'évaluation
export { default as ProductRating } from './ProductRating';
export { default as ReviewSummary } from './ReviewSummary';
export { default as StarRating } from './StarRating';

// 🔗 Composants de navigation produit
export { default as ProductNavigation } from './ProductNavigation';
export { default as BreadcrumbNav } from './BreadcrumbNav';
export { default as RelatedProducts } from './RelatedProducts';

// 📋 Export par défaut
export default {
  // Composants principaux
  ProductCard,
  ProductGrid,
  ProductFilter,
  SearchBar,
  
  // Liste et grille
  ProductList,
  ProductCarousel,
  ProductRow,
  ProductColumn,
  
  // Recherche et filtrage
  FilterPanel,
  SortDropdown,
  CategoryFilter,
  PriceRangeFilter,
  
  // Affichage des produits
  ProductImage,
  ProductInfo,
  ProductActions,
  ProductBadges,
  
  // Étiquetage
  PriceTag,
  StockIndicator,
  AvailabilityBadge,
  OrganicBadge,
  
  // Évaluation
  ProductRating,
  ReviewSummary,
  StarRating,
  
  // Navigation produit
  ProductNavigation,
  BreadcrumbNav,
  RelatedProducts,
};


