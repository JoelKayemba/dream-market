import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * ⭐ Composant Rating - Système de notation avec étoiles
 * 
 * @param {Object} props - Propriétés du rating
 * @param {number} props.value - Valeur actuelle du rating (0-5)
 * @param {Function} props.onChange - Fonction appelée lors du changement de rating
 * @param {number} props.maxValue - Valeur maximale du rating (défaut: 5)
 * @param {boolean} props.readonly - Si le rating est en lecture seule
 * @param {string} props.size - Taille des étoiles ('small', 'medium', 'large')
 * @param {boolean} props.showValue - Si la valeur numérique doit être affichée
 * @param {Object} props.style - Styles personnalisés
 * @param {Object} props.textStyle - Styles personnalisés du texte
 */
const Rating = ({
  value = 0,
  onChange,
  maxValue = 5,
  readonly = true,
  size = 'medium',
  showValue = false,
  style,
  textStyle,
  ...props
}) => {
  // 🎨 Styles des étoiles selon la taille
  const getStarSize = () => {
    switch (size) {
      case 'small': return 14;
      case 'large': return 20;
      default: return 16;
    }
  };

  // 🔄 Gestion du clic sur une étoile
  const handleStarPress = (starIndex) => {
    if (readonly || !onChange) return;
    
    const newValue = starIndex + 1;
    onChange(newValue);
  };

  // 🔄 Rendu d'une étoile
  const renderStar = (starIndex) => {
    const isActive = starIndex < value;
    
    return (
      <TouchableOpacity
        key={starIndex}
        style={styles.star}
        onPress={() => handleStarPress(starIndex)}
        disabled={readonly}
        activeOpacity={readonly ? 1 : 0.7}
      >
        <Ionicons
          name={isActive ? 'star' : 'star-outline'}
          size={getStarSize()}
          color={isActive ? '#FFD700' : '#E0E0E0'}
        />
      </TouchableOpacity>
    );
  };

  // 🔄 Rendu de la valeur numérique
  const renderValue = () => {
    if (!showValue) return null;
    
    return (
      <Text style={[styles.value, textStyle]}>
        {value.toFixed(1)}
      </Text>
    );
  };

  return (
    <View style={[styles.container, style]} {...props}>
      {/* ⭐ Container des étoiles */}
      <View style={styles.starsContainer}>
        {Array.from({ length: maxValue }, (_, index) => renderStar(index))}
        {renderValue()}
      </View>
    </View>
  );
};

// 🎨 Styles du composant
const styles = StyleSheet.create({
  // 🎯 Container principal
  container: {
    alignItems: 'flex-start',
  },

  // ⭐ Container des étoiles
  starsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  // 🌟 Styles des étoiles
  star: {
    marginRight: 2,
  },

  // 📊 Valeur numérique
  value: {
    marginLeft: 8,
    color: '#777E5C',
    fontSize: 12,
    fontWeight: '500',
  },
});

export default Rating;
