import React, { useState } from 'react';
import { 
  TouchableOpacity, 
  View, 
  StyleSheet, 
  Animated, 
  Dimensions 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Text from './Text';
import Badge from './Badge';

const { width } = Dimensions.get('window');

export default function CategoryCard({ 
  category, 
  onPress, 
  style,
  isFeatured = false 
}) {
  const [scaleValue] = useState(new Animated.Value(1));
  const [isPressed, setIsPressed] = useState(false);

  const handlePressIn = () => {
    setIsPressed(true);
    Animated.spring(scaleValue, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    setIsPressed(false);
    Animated.spring(scaleValue, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const handlePress = () => {
    onPress && onPress(category);
  };

  return (
    <TouchableOpacity
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      activeOpacity={0.9}
      style={[styles.container, style]}
    >
      <Animated.View 
        style={[
          styles.card, 
          isFeatured && styles.featuredCard,
          { transform: [{ scale: scaleValue }] }
        ]}
      >
        <Animated.Image
          source={{ uri: category.image }}
          style={[styles.image, isFeatured && styles.featuredImage]}
          resizeMode="cover"
        />
        
        <Animated.View style={styles.overlay}>
          <Text variant="h3" style={styles.title}>
            {category.name}
          </Text>
          
          {category.description && (
            <Text variant="caption" style={styles.description}>
              {category.description}
            </Text>
          )}
          
          <Animated.View style={styles.badgesContainer}>
            {category.isPopular && (
              <Badge text="Populaire" style={styles.popularBadge} />
            )}
            {category.isNew && (
              <Badge text="Nouveau" style={styles.newBadge} />
            )}
            {category.isOrganic && (
              <Badge text="Bio" style={styles.organicBadge} />
            )}
          </Animated.View>
        </Animated.View>
        
        {/* Indicateur de sélection */}
        {isPressed && (
          <Animated.View style={styles.selectionIndicator} />
        )}
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    margin: 2,
  },
  card: {
    width: width * 0.35,
    height: 120,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  featuredCard: {
    width: width * 0.75,
    height: 140,
    marginHorizontal: 8,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  featuredImage: {
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(40, 49, 6, 0.9)',
    padding: 10,
    paddingTop: 12,
    minHeight: 60,
  },
  title: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    fontSize: 14,
    lineHeight: 16,
  },
  description: {
    color: '#DFEODC',
    marginBottom: 6,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
    fontSize: 10,
    lineHeight: 12,
  },
  badgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  popularBadge: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  newBadge: {
    backgroundColor: '#4ECDC4',
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  organicBadge: {
    backgroundColor: '#45B7D1',
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  selectionIndicator: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
  },
});
