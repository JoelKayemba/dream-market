import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Text,
  Image,
  TouchableOpacity,
  Dimensions,
  Animated,
  StatusBar,
  BackHandler,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CommonActions } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

const ONBOARDING_DATA = [
  {
    id: 1,
    image: require('../../assets/skip/skip (4).jpg'),
    title: 'Découvrez la nature',
    subtitle: 'à votre porte',
    description: 'Connectez-vous avec les producteurs locaux et savourez des produits frais et authentiques.',
  },
  {
    id: 2,
    image: require('../../assets/skip/skip (3).jpg'),
    title: 'Cultivons ensemble',
    subtitle: 'votre avenir',
    description: 'Chaque graine plantée aujourd\'hui est une promesse de récolte pour demain.',
  },
  {
    id: 3,
    image: require('../../assets/skip/skip (2).jpg'),
    title: 'Unis pour une',
    subtitle: 'agriculture durable',
    description: 'Ensemble, nous construisons un écosystème agricole respectueux de l\'environnement.',
  },
  {
    id: 4,
    image: require('../../assets/skip/skip (1).jpg'),
    title: 'Des produits frais',
    subtitle: 'directement de la ferme',
    description: 'De la ferme à votre table, sans intermédiaire. Fraîcheur garantie.',
  },
];

const ONBOARDING_STORAGE_KEY = '@dream_market_onboarding_completed';

export default function OnboardingScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [currentIndex, setCurrentIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animation d'entrée
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  // Bloquer le retour en arrière sur OnboardingScreen
  useEffect(() => {
    const backAction = () => {
      // Retourner true empêche le retour en arrière
      return true;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

    return () => backHandler.remove();
  }, []);

  // Empêcher la navigation par swipe
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      // Empêcher le retour en arrière par swipe
      e.preventDefault();
    });

    return unsubscribe;
  }, [navigation]);

  const handleNext = () => {
    if (currentIndex < ONBOARDING_DATA.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      
      // Animation de transition
      fadeAnim.setValue(0);
      slideAnim.setValue(-50);
      
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      handleFinish();
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      setCurrentIndex(prevIndex);
      
      // Animation de transition
      fadeAnim.setValue(0);
      slideAnim.setValue(50);
      
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };

  const handleSkip = async () => {
    await AsyncStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
    navigation.navigate('MainApp');
  };

  const handleFinish = async () => {
    await AsyncStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
    navigation.navigate('MainApp');
  };

  const currentSlide = ONBOARDING_DATA[currentIndex];
  const isLastSlide = currentIndex === ONBOARDING_DATA.length - 1;
  const isFirstSlide = currentIndex === 0;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Image de fond avec overlay */}
      <Image
        source={currentSlide.image}
        style={styles.backgroundImage}
        resizeMode="cover"
      />
      <LinearGradient
        colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.7)']}
        style={styles.overlay}
      />

      {/* Bouton Skip */}
      <TouchableOpacity
        style={[styles.skipButton, { top: insets.top + 16 }]}
        onPress={handleSkip}
        activeOpacity={0.7}
      >
        <Text style={styles.skipText}>Passer</Text>
      </TouchableOpacity>

      {/* Indicateurs de pagination */}
      <View style={styles.pagination}>
        {ONBOARDING_DATA.map((_, index) => (
          <Animated.View
            key={index}
            style={[
              styles.paginationDot,
              {
                width: currentIndex === index ? 24 : 8,
                opacity: currentIndex === index ? 1 : 0.3,
              },
            ]}
          />
        ))}
      </View>

      {/* Contenu animé */}
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateX: slideAnim }],
          },
        ]}
      >
        <View style={styles.textContainer}>
          <Text style={styles.title}>{currentSlide.title}</Text>
          <Text style={styles.subtitle}>{currentSlide.subtitle}</Text>
          <Text style={styles.description}>{currentSlide.description}</Text>
        </View>
      </Animated.View>

      {/* Boutons de navigation */}
      <View style={[styles.navigation, { paddingBottom: insets.bottom + 20 }]}>
        {!isFirstSlide && (
          <TouchableOpacity
            style={styles.navButton}
            onPress={handlePrevious}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        )}

        <View style={styles.navSpacer} />

        <TouchableOpacity
          style={[styles.nextButton, isLastSlide && styles.finishButton]}
          onPress={handleNext}
          activeOpacity={0.8}
        >
          <Text style={styles.nextButtonText}>
            {isLastSlide ? 'Commencer' : 'Suivant'}
          </Text>
          {!isLastSlide && (
            <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Fonction utilitaire pour vérifier si l'onboarding a été complété
export const checkOnboardingCompleted = async () => {
  try {
    const value = await AsyncStorage.getItem(ONBOARDING_STORAGE_KEY);
    return value === 'true';
  } catch (error) {
    console.error('Erreur lors de la vérification de l\'onboarding:', error);
    return false;
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  backgroundImage: {
    position: 'absolute',
    width: width,
    height: height,
  },
  overlay: {
    position: 'absolute',
    width: width,
    height: height,
  },
  skipButton: {
    position: 'absolute',
    right: 20,
    zIndex: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  skipText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  pagination: {
    position: 'absolute',
    top: '15%',
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    zIndex: 5,
  },
  paginationDot: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
    transition: 'all 0.3s ease',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 32,
    zIndex: 5,
  },
  textContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 42,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 42,
    fontWeight: '800',
    color: '#4CAF50',
    textAlign: 'center',
    marginBottom: 24,
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  description: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
    opacity: 0.95,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  navigation: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 32,
    zIndex: 5,
  },
  navButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  navSpacer: {
    flex: 1,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 30,
    backgroundColor: '#4CAF50',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  finishButton: {
    backgroundColor: '#2F8F46',
    paddingHorizontal: 40,
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});

