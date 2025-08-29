import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Animated } from 'react-native';
import { colors, spacing, typography } from '../../theme';

/**
 * 🔄 Composant Loader - Indicateur de chargement avec différentes variantes
 * 
 * @param {string} props.variant - Variante du loader ('spinner', 'dots', 'pulse')
 * @param {string} props.size - Taille du loader ('small', 'medium', 'large')
 * @param {string} props.color - Couleur personnalisée
 * @param {string} props.text - Texte à afficher
 * @param {boolean} props.overlay - Si le loader doit couvrir tout l'écran
 * @param {Object} props.style - Styles personnalisés
 */
const Loader = ({
  variant = 'spinner',
  size = 'medium',
  color,
  text,
  overlay = false,
  style,
  ...props
}) => {
  // 🎨 Couleur du loader
  const getLoaderColor = () => {
    if (color) return color;
    return colors.primary.main;
  };

  // 🎨 Taille du loader
  const getLoaderSize = () => {
    const sizeMap = {
      small: 20,
      medium: 30,
      large: 40,
    };
    return sizeMap[size] || 30;
  };

  // 🎨 Taille des points pour la variante dots
  const getDotSize = () => {
    const dotSizeMap = {
      small: 6,
      medium: 8,
      large: 10,
    };
    return dotSizeMap[size] || 8;
  };

  // 🎨 Taille du pulse
  const getPulseSize = () => {
    const pulseSizeMap = {
      small: 30,
      medium: 40,
      large: 50,
    };
    return pulseSizeMap[size] || 40;
  };

  // 🎨 Animation des points
  const dotAnimations = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;

  // 🎨 Animation du pulse
  const pulseAnimation = useRef(new Animated.Value(1)).current;

  // 🎨 Démarrage des animations
  useEffect(() => {
    if (variant === 'dots') {
      const animateDots = () => {
        const animations = dotAnimations.map((dot, index) =>
          Animated.sequence([
            Animated.timing(dot, {
              toValue: 1,
              duration: 600,
              delay: index * 200,
              useNativeDriver: true,
            }),
            Animated.timing(dot, {
              toValue: 0,
              duration: 600,
              useNativeDriver: true,
            }),
          ])
        );

        Animated.loop(Animated.stagger(200, animations)).start();
      };

      animateDots();
    } else if (variant === 'pulse') {
      const animatePulse = () => {
        Animated.loop(
          Animated.sequence([
            Animated.timing(pulseAnimation, {
              toValue: 0.3,
              duration: 1000,
              useNativeDriver: true,
            }),
            Animated.timing(pulseAnimation, {
              toValue: 1,
              duration: 1000,
              useNativeDriver: true,
            }),
          ])
        ).start();
      };

      animatePulse();
    }
  }, [variant, dotAnimations, pulseAnimation]);

  // 🎨 Rendu du spinner
  const renderSpinner = () => (
    <ActivityIndicator
      size={getLoaderSize()}
      color={getLoaderColor()}
      style={styles.spinner}
    />
  );

  // 🎨 Rendu des points animés
  const renderDots = () => (
    <View style={styles.dotsContainer}>
      {dotAnimations.map((dot, index) => (
        <Animated.View
          key={index}
          style={[
            styles.dot,
            styles[`${size}Dot`],
            {
              backgroundColor: getLoaderColor(),
              opacity: dot,
              transform: [{ scale: dot }],
            },
          ]}
        />
      ))}
    </View>
  );

  // 🎨 Rendu du pulse
  const renderPulse = () => (
    <View style={[styles.pulse, styles[`${size}Pulse`]]}>
      <Animated.View
        style={[
          styles.pulseInner,
          {
            backgroundColor: getLoaderColor(),
            opacity: pulseAnimation,
            transform: [{ scale: pulseAnimation }],
          },
        ]}
      />
    </View>
  );

  // 🎨 Rendu du loader selon la variante
  const renderLoader = () => {
    switch (variant) {
      case 'dots':
        return renderDots();
      case 'pulse':
        return renderPulse();
      default:
        return renderSpinner();
    }
  };

  // 🎨 Rendu du texte
  const renderText = () => {
    if (!text) return null;

    return (
      <Text
        style={[
          styles.text,
          styles[`${size}Text`],
          { color: colors.text.secondary },
        ]}
      >
        {text}
      </Text>
    );
  };

  // 🎨 Rendu avec overlay
  if (overlay) {
    return (
      <View style={styles.overlay}>
        <View style={styles.overlayContent}>
          {renderLoader()}
          {renderText()}
        </View>
      </View>
    );
  }

  // 🎨 Rendu normal
  return (
    <View style={[styles.container, style]} {...props}>
      {renderLoader()}
      {renderText()}
    </View>
  );
};

// 🎨 Styles du composant
const styles = StyleSheet.create({
  // 🎯 Container principal
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
  },

  // 🌫️ Overlay
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.background.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000, // Valeur fixe au lieu de theme.zIndex.overlay
  },
  overlayContent: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    backgroundColor: colors.background.card,
    borderRadius: spacing.borders.radius.lg,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },

  // 📝 Texte du loader
  text: {
    ...typography.textStyles.body,
    marginTop: spacing.md,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  smallText: {
    fontSize: typography.fontSizes.sm,
    marginTop: spacing.sm,
  },
  mediumText: {
    fontSize: typography.fontSizes.base,
    marginTop: spacing.md,
  },
  largeText: {
    fontSize: typography.fontSizes.md,
    marginTop: spacing.lg,
  },

  // 🔴 Styles des points animés
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    borderRadius: spacing.borders.radius.round,
    marginHorizontal: spacing.xs,
  },
  smallDot: {
    width: 6,
    height: 6,
  },
  mediumDot: {
    width: 8,
    height: 8,
  },
  largeDot: {
    width: 10,
    height: 10,
  },

  // 💓 Styles du pulse
  pulse: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  smallPulse: {
    width: 30,
    height: 30,
  },
  mediumPulse: {
    width: 40,
    height: 40,
  },
  largePulse: {
    width: 50,
    height: 50,
  },
  pulseInner: {
    width: '100%',
    height: '100%',
    borderRadius: spacing.borders.radius.round,
    opacity: 0.6,
  },
});

export default Loader;
