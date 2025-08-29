import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { 
  Button, 
  Card, 
  Text, 
  Input, 
  Badge, 
  Spacer, 
  Container, 
  Divider, 
  Loader, 
  Image, 
  Icon, 
  Rating 
} from './index';

export default function ComponentDemo() {
  const [inputValue, setInputValue] = useState('');
  const [rating, setRating] = useState(3);
  const [isLoading, setIsLoading] = useState(false);

  const handleButtonPress = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 2000);
  };

  return (
    <ScrollView 
      style={styles.scrollView}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={true}
    >
      <Container style={styles.content}>
        <Card style={styles.mainCard}>
          <Text variant="h1" style={styles.cardTitle}>Tous les Composants UI</Text>
          <Text variant="body" style={styles.cardSubtitle}>Démonstration complète des 12 composants essentiels !</Text>
          
          {/* Section 1: Boutons */}
          <Container style={styles.section}>
            <Text variant="h2">🎯 Boutons</Text>
            <View style={styles.buttonContainer}>
              <Button 
                title="Button Primary"
                onPress={handleButtonPress}
                variant="primary"
                size="large"
                style={styles.button1}
              />
              
              <Button 
                title="Button Secondary"
                onPress={() => console.log('Button 2 pressé !')}
                variant="secondary"
                size="medium"
                style={styles.button2}
              />
            </View>
          </Container>

          <Divider />

          {/* Section 2: Input et Badges */}
          <Container style={styles.section}>
            <Text variant="h2">📝 Saisie et Étiquettes</Text>
            <Input 
              placeholder="Tapez quelque chose..."
              value={inputValue}
              onChangeText={setInputValue}
              style={styles.input}
            />
            <Text variant="caption">Valeur saisie: {inputValue}</Text>
            
            <Spacer size="md" />
            
            <View style={styles.badgeRow}>
              <Badge text="Nouveau" />
              <Spacer size="sm" />
              <Badge text="Populaire" />
              <Spacer size="sm" />
              <Badge text="Promo" />
            </View>
          </Container>

          <Divider />

          {/* Section 3: Image et Icônes */}
          <Container style={styles.section}>
            <Text variant="h2">🖼️ Images et Icônes</Text>
            <View style={styles.imageIconContainer}>
              <Image 
                source={{ uri: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4' }}
                style={styles.testImage}
              />
              <Spacer size="md" />
              <View style={styles.iconRow}>
                <Icon name="star" size={24} color="#FFD700" />
                <Spacer size="sm" />
                <Icon name="heart" size={24} color="#FF6B6B" />
                <Spacer size="sm" />
                <Icon name="check" size={24} color="#4CAF50" />
              </View>
            </View>
          </Container>

          <Divider />

          {/* Section 4: Rating et Loader */}
          <Container style={styles.section}>
            <Text variant="h2">⭐ Notation et Chargement</Text>
            <View style={styles.ratingLoaderContainer}>
              <Rating 
                value={rating}
                onValueChange={setRating}
                size="large"
              />
              <Text variant="caption">Note actuelle: {rating}/5</Text>
              
              <Spacer size="lg" />
              
              <View style={styles.loaderContainer}>
                <Text variant="body">État de chargement:</Text>
                <Spacer size="sm" />
                {isLoading ? (
                  <Loader size="large" />
                ) : (
                  <Text variant="caption">Prêt !</Text>
                )}
              </View>
            </View>
          </Container>

          <Divider />

          {/* Section 5: Espacement et Séparateurs */}
          <Container style={styles.section}>
            <Text variant="h2">📏 Espacement et Séparateurs</Text>
            <View style={styles.spacingDemo}>
              <Text variant="body">Espacement petit</Text>
              <Spacer size="sm" />
              <Text variant="body">Espacement moyen</Text>
              <Spacer size="md" />
              <Text variant="body">Espacement grand</Text>
              <Spacer size="lg" />
              <Text variant="body">Espacement énorme</Text>
            </View>
          </Container>

          {/* Section 6: Démonstration supplémentaire */}
          <Divider />
          
          <Container style={styles.section}>
            <Text variant="h2">🎨 Démonstration Complète</Text>
            <Text variant="body" style={styles.demoText}>
              Cette application démontre tous les composants UI essentiels de Dream Market App.
              Vous pouvez faire défiler pour voir tous les composants en action !
            </Text>
            <Spacer size="md" />
            <Text variant="caption" style={styles.footerText}>
              Composants testés : Button, Card, Text, Input, Badge, Spacer, Container, Divider, Loader, Image, Icon, Rating
            </Text>
          </Container>
        </Card>
      </Container>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 20,
  },
  content: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  mainCard: {
    padding: 20,
    minWidth: 350,
    maxWidth: 400,
  },
  cardTitle: {
    textAlign: 'center',
    marginBottom: 10,
  },
  cardSubtitle: {
    textAlign: 'center',
    marginBottom: 20,
  },
  section: {
    paddingVertical: 15,
    alignItems: 'center',
  },
  buttonContainer: {
    alignItems: 'center',
    marginTop: 10,
  },
  button1: {
    marginBottom: 15,
  },
  button2: {
    marginTop: 5,
  },
  input: {
    marginVertical: 10,
    minWidth: 250,
  },
  badgeRow: {
    flexDirection: 'row',
    marginTop: 10,
  },
  imageIconContainer: {
    alignItems: 'center',
    marginTop: 10,
  },
  testImage: {
    width: 120,
    height: 120,
    borderRadius: 12,
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingLoaderContainer: {
    alignItems: 'center',
    marginTop: 10,
  },
  loaderContainer: {
    alignItems: 'center',
    marginTop: 10,
  },
  spacingDemo: {
    alignItems: 'center',
    marginTop: 10,
  },
  demoText: {
    textAlign: 'center',
    marginBottom: 10,
  },
  footerText: {
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
