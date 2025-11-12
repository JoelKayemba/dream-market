import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '../components/ui';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const FAQ_DATA = [
  {
    category: 'Général',
    questions: [
      {
        question: 'Qu\'est-ce que Dream Market ?',
        answer: 'Dream Market est une application mobile qui vous permet de commander des produits agricoles frais et d\'accéder à des services agricoles directement depuis votre smartphone.'
      },
      {
        question: 'L\'application est-elle gratuite ?',
        answer: 'L\'application est gratuite à télécharger et à utiliser. Seuls les produits et services commandés sont payants.'
      },
      {
        question: 'Sur quels appareils puis-je utiliser Dream Market ?',
        answer: 'Dream Market est disponible sur iOS et Android. Vous pouvez télécharger l\'application depuis l\'App Store (iOS) ou Google Play Store (Android).'
      }
    ]
  },
  {
    category: 'Compte et inscription',
    questions: [
      {
        question: 'Comment créer un compte ?',
        answer: 'Ouvrez l\'application, cliquez sur "S\'inscrire" et suivez les instructions. Vous devrez fournir votre nom, prénom, e-mail, numéro de téléphone et adresse.'
      },
      {
        question: 'Puis-je utiliser l\'application sans créer de compte ?',
        answer: 'Non, un compte est nécessaire pour passer des commandes et accéder à tous les services de l\'application.'
      },
      {
        question: 'J\'ai oublié mon mot de passe. Que faire ?',
        answer: 'Sur l\'écran de connexion, cliquez sur "Mot de passe oublié" et suivez les instructions pour réinitialiser votre mot de passe.'
      },
      {
        question: 'Puis-je modifier mes informations personnelles ?',
        answer: 'Oui, allez dans "Profil" > "Informations personnelles" pour modifier vos données.'
      }
    ]
  },
  {
    category: 'Commandes',
    questions: [
      {
        question: 'Comment passer une commande ?',
        answer: 'Parcourez les produits disponibles, ajoutez-les à votre panier, puis procédez au paiement lors du checkout.'
      },
      {
        question: 'Puis-je annuler ma commande ?',
        answer: 'Les commandes peuvent être annulées avant qu\'elles ne soient acceptées par le vendeur. Une fois acceptée, l\'annulation dépend de l\'état de préparation de la commande.'
      },
      {
        question: 'Comment suivre ma commande ?',
        answer: 'Allez dans "Mes Commandes" pour voir le statut de toutes vos commandes en cours et passées.'
      },
      {
        question: 'Quels modes de paiement sont acceptés ?',
        answer: 'Nous acceptons les cartes bancaires et autres modes de paiement sécurisés via nos prestataires de paiement.'
      }
    ]
  },
  {
    category: 'Livraison',
    questions: [
      {
        question: 'Quels sont les délais de livraison ?',
        answer: 'Les délais varient selon le type de produit, la disponibilité et votre localisation. Les délais estimés sont indiqués lors de la commande.'
      },
      {
        question: 'Y a-t-il des frais de livraison ?',
        answer: 'Les frais de livraison dépendent de votre localisation et du type de commande. Ils sont indiqués clairement avant la validation de votre commande.'
      },
      {
        question: 'Puis-je choisir l\'heure de livraison ?',
        answer: 'Cela dépend du vendeur et du type de produit. Certains vendeurs proposent des créneaux horaires de livraison.'
      },
      {
        question: 'Que faire si je ne suis pas présent lors de la livraison ?',
        answer: 'Contactez le vendeur ou le service client pour réorganiser la livraison. Des frais supplémentaires peuvent s\'appliquer.'
      }
    ]
  },
  {
    category: 'Produits et services',
    questions: [
      {
        question: 'D\'où viennent les produits ?',
        answer: 'Les produits proviennent directement d\'agriculteurs et de producteurs locaux partenaires de Dream Market.'
      },
      {
        question: 'Les produits sont-ils frais ?',
        answer: 'Oui, nous privilégions les produits frais et locaux. La fraîcheur est garantie par nos partenaires agriculteurs.'
      },
      {
        question: 'Puis-je voir les informations nutritionnelles des produits ?',
        answer: 'Les informations disponibles varient selon les produits. Consultez la page de détail de chaque produit pour plus d\'informations.'
      },
      {
        question: 'Y a-t-il des produits biologiques ?',
        answer: 'Oui, certains vendeurs proposent des produits biologiques. Recherchez les labels et certifications sur les pages produits.'
      }
    ]
  },
  {
    category: 'Retours et remboursements',
    questions: [
      {
        question: 'Puis-je retourner un produit ?',
        answer: 'Les produits défectueux ou non conformes peuvent être retournés dans un délai raisonnable suivant la réception. Contactez le service client pour initier un retour.'
      },
      {
        question: 'Comment obtenir un remboursement ?',
        answer: 'Les remboursements sont traités après vérification du retour. Le remboursement sera effectué sur le même moyen de paiement utilisé, dans un délai raisonnable.'
      },
      {
        question: 'Les produits périssables peuvent-ils être retournés ?',
        answer: 'Les conditions de retour pour les produits périssables peuvent varier. Contactez le service client pour plus d\'informations.'
      }
    ]
  },
  {
    category: 'Compte et sécurité',
    questions: [
      {
        question: 'Comment supprimer mon compte ?',
        answer: 'Allez dans "Profil" > "Paramètres" > "Supprimer mon compte". Notez que cette action est irréversible.'
      },
      {
        question: 'Comment modifier mes préférences de notification ?',
        answer: 'Allez dans "Profil" > "Paramètres" > "Notifications" pour gérer vos préférences.'
      },
      {
        question: 'Mes données sont-elles sécurisées ?',
        answer: 'Oui, nous utilisons des mesures de sécurité avancées pour protéger vos données personnelles. Consultez notre Politique de Confidentialité pour plus d\'informations.'
      }
    ]
  },
  {
    category: 'Technique',
    questions: [
      {
        question: 'L\'application ne fonctionne pas correctement. Que faire ?',
        answer: 'Essayez de fermer et rouvrir l\'application, ou de la redémarrer. Si le problème persiste, vérifiez que vous avez la dernière version de l\'application installée.'
      },
      {
        question: 'Comment mettre à jour l\'application ?',
        answer: 'Allez dans l\'App Store (iOS) ou Google Play Store (Android) et recherchez "Dream Market". Si une mise à jour est disponible, cliquez sur "Mettre à jour".'
      },
      {
        question: 'L\'application consomme-t-elle beaucoup de données ?',
        answer: 'L\'utilisation normale de l\'application consomme peu de données. Le téléchargement d\'images peut consommer plus de données. Vous pouvez désactiver le chargement automatique des images dans les paramètres.'
      }
    ]
  },
  {
    category: 'Favoris et listes',
    questions: [
      {
        question: 'Comment ajouter un produit aux favoris ?',
        answer: 'Sur la page de détail d\'un produit, cliquez sur l\'icône cœur pour l\'ajouter à vos favoris.'
      },
      {
        question: 'Où puis-je voir mes favoris ?',
        answer: 'Allez dans "Profil" > "Mes Favoris" pour voir tous vos produits et services favoris.'
      }
    ]
  },
  {
    category: 'Support et contact',
    questions: [
      {
        question: 'Comment contacter le service client ?',
        answer: 'Allez dans "Profil" > "Support" pour accéder à notre centre d\'aide et contacter notre équipe.'
      },
      {
        question: 'Quels sont les horaires du service client ?',
        answer: 'Notre service client est disponible de 8H30 à 16H30 du lundi au vendredi. Vous pouvez également nous envoyer un e-mail à tout moment.'
      },
      {
        question: 'Puis-je suggérer de nouvelles fonctionnalités ?',
        answer: 'Oui ! Nous apprécions vos suggestions. Contactez-nous via le support ou envoyez-nous un e-mail.'
      }
    ]
  },
  {
    category: 'Agriculteurs et vendeurs',
    questions: [
      {
        question: 'Comment devenir vendeur sur Dream Market ?',
        answer: 'Contactez-nous pour devenir partenaire. Nous examinerons votre demande et vous contacterons.'
      },
      {
        question: 'Quels sont les critères pour devenir vendeur ?',
        answer: 'Vous devez être un agriculteur ou un prestataire de services agricoles légitime, avec les autorisations nécessaires.'
      }
    ]
  },
  {
    category: 'Autres questions',
    questions: [
      {
        question: 'Où puis-je trouver les CGU et la politique de confidentialité ?',
        answer: 'Les Conditions Générales d\'Utilisation et la Politique de Confidentialité sont disponibles dans "Profil" > "Informations légales".'
      },
      {
        question: 'L\'application est-elle disponible dans d\'autres langues ?',
        answer: 'Actuellement, l\'application est disponible en français. D\'autres langues pourront être ajoutées à l\'avenir.'
      },
      {
        question: 'Puis-je utiliser l\'application hors ligne ?',
        answer: 'Certaines fonctionnalités nécessitent une connexion Internet. Vous pouvez consulter vos commandes passées et vos favoris hors ligne, mais vous ne pourrez pas passer de nouvelles commandes.'
      }
    ]
  }
];

const FAQItem = ({ question, answer, isExpanded, onToggle }) => {
  return (
    <View style={styles.faqItem}>
      <TouchableOpacity
        style={styles.faqQuestionContainer}
        onPress={onToggle}
        activeOpacity={0.7}
      >
        <Text style={styles.faqQuestion}>{question}</Text>
        <Ionicons
          name={isExpanded ? 'chevron-up' : 'chevron-down'}
          size={20}
          color="#777E5C"
        />
      </TouchableOpacity>
      {isExpanded && (
        <View style={styles.faqAnswerContainer}>
          <Text style={styles.faqAnswer}>{answer}</Text>
        </View>
      )}
    </View>
  );
};

export default function FAQScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [expandedItems, setExpandedItems] = useState({});

  const toggleItem = (categoryIndex, questionIndex) => {
    const key = `${categoryIndex}-${questionIndex}`;
    setExpandedItems(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#283106" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>FAQ</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Introduction */}
        <View style={styles.introCard}>
          <Ionicons name="help-circle" size={48} color="#4CAF50" />
          <Text style={styles.introTitle}>Foire aux Questions</Text>
          <Text style={styles.introText}>
            Trouvez rapidement les réponses à vos questions les plus fréquentes
          </Text>
        </View>

        {/* FAQ par catégorie */}
        {FAQ_DATA.map((category, categoryIndex) => (
          <View key={category.category} style={styles.categorySection}>
            <View style={styles.categoryHeader}>
              <Ionicons name="folder-outline" size={20} color="#4CAF50" />
              <Text style={styles.categoryTitle}>{category.category}</Text>
            </View>
            <View style={styles.questionsContainer}>
              {category.questions.map((item, questionIndex) => (
                <FAQItem
                  key={`${categoryIndex}-${questionIndex}`}
                  question={item.question}
                  answer={item.answer}
                  isExpanded={expandedItems[`${categoryIndex}-${questionIndex}`]}
                  onToggle={() => toggleItem(categoryIndex, questionIndex)}
                />
              ))}
            </View>
          </View>
        ))}

        {/* Contact footer */}
        <View style={styles.contactFooter}>
          <Text style={styles.contactFooterTitle}>Vous ne trouvez pas votre réponse ?</Text>
          <Text style={styles.contactFooterText}>
            N'hésitez pas à nous contacter via le support
          </Text>
          <TouchableOpacity
            style={styles.contactButton}
            onPress={() => navigation.navigate('Support')}
          >
            <Ionicons name="chatbubbles-outline" size={18} color="#FFFFFF" />
            <Text style={styles.contactButtonText}>Contacter le support</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#283106',
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  introCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 24,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  introTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#283106',
    marginTop: 16,
    marginBottom: 8,
  },
  introText: {
    fontSize: 14,
    color: '#777E5C',
    textAlign: 'center',
    lineHeight: 20,
  },
  categorySection: {
    marginBottom: 24,
    marginHorizontal: 20,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#283106',
  },
  questionsContainer: {
    gap: 8,
  },
  faqItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    marginBottom: 8,
  },
  faqQuestionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  faqQuestion: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#283106',
    lineHeight: 22,
  },
  faqAnswerContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  faqAnswer: {
    fontSize: 14,
    color: '#777E5C',
    lineHeight: 22,
    marginTop: 12,
  },
  contactFooter: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 24,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  contactFooterTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#283106',
    marginBottom: 8,
    textAlign: 'center',
  },
  contactFooterText: {
    fontSize: 14,
    color: '#777E5C',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  contactButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  bottomSpacing: {
    height: 20,
  },
});

