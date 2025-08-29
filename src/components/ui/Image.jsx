import React, { useState } from 'react';
import { Image as RNImage, View, StyleSheet, ActivityIndicator } from 'react-native';
import { colors, spacing } from '../../theme';

/**
 * 🖼️ Composant Image - Image personnalisée avec gestion des états
 * 
 * @param {Object} props - Propriétés de l'image
 * @param {string} props.source - Source de l'image (URI ou require)
 * @param {string} props.alt - Texte alternatif pour l'accessibilité
 * @param {string} props.variant - Variante de l'image ('rounded', 'circular', 'thumbnail')
 * @param {number} props.width - Largeur de l'image
 * @param {number} props.height - Hauteur de l'image
 * @param {string} props.resizeMode - Mode de redimensionnement
 * @param {boolean} props.showLoader - Afficher l'indicateur de chargement
 * @param {Object} props.style - Styles personnalisés
 * @param {Function} props.onLoad - Fonction appelée lors du chargement
 * @param {Function} props.onError - Fonction appelée en cas d'erreur
 */
const Image = ({
  source,
  alt,
  variant = 'default',
  width,
  height,
  resizeMode = 'cover',
  showLoader = true,
  style,
  onLoad,
  onError,
  ...props
}) => {
  // 🎨 États de l'image
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // 🎨 Gestion du chargement
  const handleLoadStart = () => {
    setIsLoading(true);
    setHasError(false);
  };

  const handleLoadEnd = () => {
    setIsLoading(false);
  };

  const handleLoad = (event) => {
    setIsLoading(false);
    onLoad?.(event);
  };

  const handleError = (error) => {
    setIsLoading(false);
    setHasError(true);
    onError?.(error);
  };

  // 🎨 Styles selon la variante
  const getVariantStyles = () => {
    switch (variant) {
      case 'rounded':
        return { borderRadius: spacing.borderRadius.md };
      case 'circular':
        return { borderRadius: Math.min(width || 100, height || 100) / 2 };
      case 'thumbnail':
        return { 
          borderRadius: spacing.borderRadius.sm,
          borderWidth: 1,
          borderColor: colors.border.light,
        };
      default:
        return {};
    }
  };

  // 🎨 Styles de base
  const baseStyles = {
    width,
    height,
    ...getVariantStyles(),
  };

  // 🎨 Rendu de l'image
  const renderImage = () => (
    <RNImage
      source={source}
      style={[baseStyles, style]}
      resizeMode={resizeMode}
      onLoadStart={handleLoadStart}
      onLoadEnd={handleLoadEnd}
      onLoad={handleLoad}
      onError={handleError}
      accessibilityLabel={alt}
      {...props}
    />
  );

  // 🎨 Rendu du loader
  const renderLoader = () => (
    <View style={[baseStyles, styles.loaderContainer]}>
      <ActivityIndicator size="small" color={colors.primary.main} />
    </View>
  );

  // 🎨 Rendu de l'erreur
  const renderError = () => (
    <View style={[baseStyles, styles.errorContainer]}>
      <View style={styles.errorIcon}>
        {/* Icône d'erreur simple */}
        <View style={styles.errorIconInner} />
      </View>
    </View>
  );

  // 🎨 Rendu conditionnel
  if (hasError) {
    return renderError();
  }

  return (
    <View style={styles.container}>
      {renderImage()}
      {showLoader && isLoading && renderLoader()}
    </View>
  );
};

// 🎨 Styles du composant
const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  loaderContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.background.light,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorContainer: {
    backgroundColor: colors.background.light,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  errorIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.error.light,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorIconInner: {
    width: 16,
    height: 16,
    backgroundColor: colors.error.main,
    borderRadius: 8,
  },
});

export default Image;
