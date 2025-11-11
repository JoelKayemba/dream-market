import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Text, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Container, Button  , ScreenWrapper } from '../components/ui';

export default function SupportScreen({ navigation }) {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const categories = [
    { id: 'technical', title: 'Problème technique', icon: 'settings-outline' },
    { id: 'order', title: 'Question sur commande', icon: 'receipt-outline' },
    { id: 'product', title: 'Information produit', icon: 'leaf-outline' },
    { id: 'delivery', title: 'Livraison', icon: 'car-outline' },
    { id: 'other', title: 'Autre', icon: 'help-circle-outline' }
  ];

  const contactMethods = [
    { id: 'email', title: 'Email', subtitle: 'support@dreammarket.com', icon: 'mail-outline', color: '#4CAF50' },
    { id: 'phone', title: 'Téléphone', subtitle: '+33 1 23 45 67 89', icon: 'call-outline', color: '#2196F3' },
    { id: 'chat', title: 'Chat en ligne', subtitle: 'Disponible 9h-18h', icon: 'chatbubbles-outline', color: '#FF9800' }
  ];

  const handleSubmit = () => {
    if (!subject || !message || !selectedCategory) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    Alert.alert(
      'Message envoyé',
      'Votre message a été envoyé. Nous vous répondrons dans les plus brefs délais.',
      [
        {
          text: 'OK',
          onPress: () => {
            setSubject('');
            setMessage('');
            setSelectedCategory('');
          }
        }
      ]
    );
  };

  const handleContactMethod = (method) => {
    switch (method.id) {
      case 'email':
        // Ici on pourrait ouvrir l'app mail
        Alert.alert('Email', 'support@dreammarket.com');
        break;
      case 'phone':
        // Ici on pourrait composer le numéro
        Alert.alert('Téléphone', '+243 123456789');
        break;
      case 'chat':
        // Ici on pourrait ouvrir le chat
        Alert.alert('Chat', 'Fonctionnalité à venir');
        break;
    }
  };

  return (
    <ScreenWrapper >
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <Container style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#283106" />
        </TouchableOpacity>
        <Text style={styles.title}>Support & Aide</Text>
        <View style={styles.placeholder} />
      </Container>

      {/* Méthodes de contact */}
      <Container style={styles.contactSection}>
        <Text style={styles.sectionTitle}>Nous contacter</Text>
        
        <View style={styles.contactMethods}>
          {contactMethods.map((method) => (
            <TouchableOpacity
              key={method.id}
              style={styles.contactMethod}
              onPress={() => handleContactMethod(method)}
            >
              <View style={[styles.methodIcon, { backgroundColor: method.color }]}>
                <Ionicons name={method.icon} size={24} color="#FFFFFF" />
              </View>
              <View style={styles.methodInfo}>
                <Text style={styles.methodTitle}>{method.title}</Text>
                <Text style={styles.methodSubtitle}>{method.subtitle}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#777E5C" />
            </TouchableOpacity>
          ))}
        </View>
      </Container>

      {/* Formulaire de contact */}
      <Container style={styles.formSection}>
        <Text style={styles.sectionTitle}>Envoyer un message</Text>
        
        {/* Catégories */}
        <Text style={styles.fieldLabel}>Catégorie</Text>
        <View style={styles.categoriesGrid}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryButton,
                selectedCategory === category.id && styles.selectedCategory
              ]}
              onPress={() => setSelectedCategory(category.id)}
            >
              <Ionicons 
                name={category.icon} 
                size={20} 
                color={selectedCategory === category.id ? '#FFFFFF' : '#777E5C'} 
              />
              <Text style={[
                styles.categoryText,
                selectedCategory === category.id && styles.selectedCategoryText
              ]}>
                {category.title}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Sujet */}
        <Text style={styles.fieldLabel}>Sujet</Text>
        <TextInput
          style={styles.input}
          placeholder="Décrivez brièvement votre problème"
          value={subject}
          onChangeText={setSubject}
        />

        {/* Message */}
        <Text style={styles.fieldLabel}>Message</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Détaillez votre demande..."
          value={message}
          onChangeText={setMessage}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />

        <Button
          title="Envoyer le message"
          onPress={handleSubmit}
          variant="primary"
          size="large"
          style={styles.submitButton}
        />
      </Container>

      {/* FAQ rapide */}
      <Container style={styles.faqSection}>
        <Text style={styles.sectionTitle}>Questions fréquentes</Text>
        
        <View style={styles.faqList}>
          <TouchableOpacity style={styles.faqItem}>
            <Text style={styles.faqQuestion}>Comment annuler une commande ?</Text>
            <Ionicons name="chevron-down" size={16} color="#777E5C" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.faqItem}>
            <Text style={styles.faqQuestion}>Délais de livraison ?</Text>
            <Ionicons name="chevron-down" size={16} color="#777E5C" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.faqItem}>
            <Text style={styles.faqQuestion}>Problème avec un produit ?</Text>
            <Ionicons name="chevron-down" size={16} color="#777E5C" />
          </TouchableOpacity>
        </View>
      </Container>
    </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 20,
  },
  backButton: {
    padding: 8,
  },
  title: {
    color: '#283106',
    fontWeight: 'bold',
    fontSize: 20,
  },
  placeholder: {
    width: 40,
  },
  contactSection: {
    paddingVertical: 20,
  },
  sectionTitle: {
    color: '#283106',
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 16,
  },
  contactMethods: {
    gap: 12,
  },
  contactMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  methodIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  methodInfo: {
    flex: 1,
  },
  methodTitle: {
    color: '#283106',
    fontWeight: '600',
    fontSize: 16,
    marginBottom: 2,
  },
  methodSubtitle: {
    color: '#777E5C',
    fontSize: 14,
  },
  formSection: {
    paddingVertical: 20,
  },
  fieldLabel: {
    color: '#283106',
    fontWeight: '600',
    fontSize: 14,
    marginBottom: 8,
    marginTop: 16,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    gap: 6,
  },
  selectedCategory: {
    backgroundColor: '#283106',
    borderColor: '#283106',
  },
  categoryText: {
    color: '#777E5C',
    fontSize: 12,
    fontWeight: '500',
  },
  selectedCategoryText: {
    color: '#FFFFFF',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#283106',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    marginTop: 20,
  },
  faqSection: {
    paddingVertical: 20,
  },
  faqList: {
    gap: 8,
  },
  faqItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  faqQuestion: {
    color: '#283106',
    fontSize: 16,
    fontWeight: '500',
  },
});
