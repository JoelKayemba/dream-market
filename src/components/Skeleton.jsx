import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

/**
 * Composant Skeleton avec effet shimmer (miroir)
 * Utilisé pour afficher des placeholders pendant le chargement
 */
export const Skeleton = ({ width, height, borderRadius = 8, style }) => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const shimmer = Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      })
    );
    shimmer.start();
    return () => shimmer.stop();
  }, [shimmerAnim]);

  const translateX = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-SCREEN_WIDTH, SCREEN_WIDTH],
  });

  return (
    <View
      style={[
        styles.skeleton,
        {
          width: width || '100%',
          height: height || 20,
          borderRadius,
        },
        style,
      ]}
      overflow="hidden"
    >
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          {
            transform: [{ translateX }],
          },
        ]}
      >
        <LinearGradient
          colors={['transparent', 'rgba(255, 255, 255, 0.6)', 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </View>
  );
};

/**
 * Skeleton pour une carte de catégorie
 */
export const CategorySkeleton = () => (
  <View style={styles.categorySkeleton}>
    <View style={styles.categorySkeletonCard}>
      <Skeleton width={32} height={32} borderRadius={10} />
      <Skeleton width={60} height={12} borderRadius={4} />
    </View>
  </View>
);

/**
 * Skeleton pour une carte de produit
 */
export const ProductCardSkeleton = ({ width = 160 }) => (
  <View style={[styles.productCardSkeleton, { width }]}>
    <Skeleton width="100%" height={120} borderRadius={12} />
    <View style={styles.productCardSkeletonContent}>
      <Skeleton width="80%" height={16} borderRadius={4} />
      <Skeleton width="60%" height={14} borderRadius={4} style={{ marginTop: 8 }} />
      <Skeleton width="50%" height={18} borderRadius={4} style={{ marginTop: 8 }} />
    </View>
  </View>
);

/**
 * Skeleton pour une carte de produit pleine largeur
 */
export const ProductCardFullWidthSkeleton = () => (
  <View style={styles.productCardFullWidthSkeleton}>
    <Skeleton width={120} height={120} borderRadius={12} />
    <View style={styles.productCardFullWidthContent}>
      <Skeleton width="70%" height={18} borderRadius={4} />
      <Skeleton width="90%" height={14} borderRadius={4} style={{ marginTop: 8 }} />
      <Skeleton width="50%" height={16} borderRadius={4} style={{ marginTop: 12 }} />
    </View>
  </View>
);

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: '#E5E7EB',
    overflow: 'hidden',
  },
  categorySkeleton: {
    marginRight: 8,
  },
  categorySkeletonCard: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 120,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    padding: 8,
    paddingHorizontal: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  productCardSkeleton: {
    marginRight: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productCardSkeletonContent: {
    marginTop: 12,
    paddingHorizontal: 4,
  },
  productCardFullWidthSkeleton: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    gap: 12,
  },
  productCardFullWidthContent: {
    flex: 1,
    justifyContent: 'center',
  },
});

