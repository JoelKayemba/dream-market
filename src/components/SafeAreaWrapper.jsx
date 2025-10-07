import React from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * Wrapper global pour appliquer les safe area insets automatiquement
 * Utilise useSafeAreaInsets pour obtenir les marges et les applique à tous les enfants
 */
const SafeAreaWrapper = ({ 
  children, 
  style, 
  edges = ['top', 'bottom', 'left', 'right'],
  backgroundColor = '#f5f5f5'
}) => {
  const insets = useSafeAreaInsets();

  const safeAreaStyle = {
    flex: 1,
    backgroundColor,
    paddingTop: edges.includes('top') ? insets.top : 0,
    paddingBottom: edges.includes('bottom') ? insets.bottom : 0,
    paddingLeft: edges.includes('left') ? insets.left : 0,
    paddingRight: edges.includes('right') ? insets.right : 0,
  };

  return (
    <View style={[safeAreaStyle, style]}>
      {children}
    </View>
  );
};

export default SafeAreaWrapper;
