// 🔧 Écrans des services - Dream Market App
// Export centralisé de tous les écrans liés aux services

// 🎯 Écrans principaux des services
export { default as ServicesScreen } from './ServicesScreen';
export { default as ServiceDetailsScreen } from './ServiceDetailsScreen';
export { default as ServiceSearchScreen } from './ServiceSearchScreen';

// 📱 Écrans de navigation service
export { default as ServiceCategoryScreen } from './ServiceCategoryScreen';
export { default as ServiceComparisonScreen } from './ServiceComparisonScreen';
export { default as ServiceFavoritesScreen } from './ServiceFavoritesScreen';

// 🔍 Écrans de recherche et filtrage
export { default as ServiceFilterScreen } from './ServiceFilterScreen';
export { default as ServiceSortScreen } from './ServiceSortScreen';
export { default as ServiceSearchResultsScreen } from './ServiceSearchResultsScreen';

// 📋 Écrans de réservation
export { default as ServiceBookingScreen } from './ServiceBookingScreen';
export { default as BookingConfirmationScreen } from './BookingConfirmationScreen';
export { default as BookingHistoryScreen } from './BookingHistoryScreen';
export { default as BookingDetailsScreen } from './BookingDetailsScreen';

// 📊 Écrans d'information service
export { default as ServiceReviewsScreen } from './ServiceReviewsScreen';
export { default as ServiceSpecificationsScreen } from './ServiceSpecificationsScreen';
export { default as ServiceAvailabilityScreen } from './ServiceAvailabilityScreen';
export { default as ServiceContactScreen } from './ServiceContactScreen';

// 🗓️ Écrans de planification
export { default as ServiceCalendarScreen } from './ServiceCalendarScreen';
export { default as TimeSlotSelectionScreen } from './TimeSlotSelectionScreen';
export { default as ServiceScheduleScreen } from './ServiceScheduleScreen';

// 📋 Export par défaut
export default {
  // Écrans principaux
  ServicesScreen,
  ServiceDetailsScreen,
  ServiceSearchScreen,
  
  // Navigation service
  ServiceCategoryScreen,
  ServiceComparisonScreen,
  ServiceFavoritesScreen,
  
  // Recherche et filtrage
  ServiceFilterScreen,
  ServiceSortScreen,
  ServiceSearchResultsScreen,
  
  // Réservation
  ServiceBookingScreen,
  BookingConfirmationScreen,
  BookingHistoryScreen,
  BookingDetailsScreen,
  
  // Information service
  ServiceReviewsScreen,
  ServiceSpecificationsScreen,
  ServiceAvailabilityScreen,
  ServiceContactScreen,
  
  // Planification
  ServiceCalendarScreen,
  TimeSlotSelectionScreen,
  ServiceScheduleScreen,
};


