import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';


 //Wrapper pour tous les écrans de l'application
 //Applique automatiquement les safe area insets
 
const ScreenWrapper = ({ 
  children, 
  style,
  backgroundColor = '#f5f5f5',
  edges = ['top', 'bottom', 'left', 'right']
}) => {
  const insets = useSafeAreaInsets();

  const screenStyle = [
    styles.container,
    {
      backgroundColor,
      paddingTop: edges.includes('top') ? insets.top : 0,
      paddingBottom: edges.includes('bottom') ? insets.bottom : 0,
      paddingLeft: edges.includes('left') ? insets.left : 0,
      paddingRight: edges.includes('right') ? insets.right : 0,
    },
    style
  ];

  return (
    <View style={screenStyle}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default ScreenWrapper;
