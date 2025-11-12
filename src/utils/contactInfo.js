import { Linking, Alert, Platform } from 'react-native';

// Informations de contact Dream Market
export const CONTACT_INFO = {
  phone1: '+243858000217',
  phone2: '+243899292369',
  phone1Display: '+243 858 000 217',
  phone2Display: '899 292 369',
  email: 'dreamfield2000@gmail.com',
  address: 'Avenue Lufira, N°16, Q/école, C/Lemba, référence église notre dame d\'Afrique et arrêt mayadi station total échangeur',
  hours: 'Ouvert de 8H30 à 16H30 du lundi au vendredi',
};

/**
 * Ouvre WhatsApp avec un numéro de téléphone
 */
export const openWhatsApp = async (phoneNumber = CONTACT_INFO.phone1, message = '') => {
  try {
    // Format du numéro pour WhatsApp (sans + et espaces)
    const cleanPhone = phoneNumber.replace(/[\s\+]/g, '');
    const url = `whatsapp://send?phone=${cleanPhone}${message ? `&text=${encodeURIComponent(message)}` : ''}`;
    
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
    } else {
      // Si WhatsApp n'est pas installé, essayer avec le web
      const webUrl = `https://wa.me/${cleanPhone}${message ? `?text=${encodeURIComponent(message)}` : ''}`;
      await Linking.openURL(webUrl);
    }
  } catch (error) {
    console.error('Erreur lors de l\'ouverture de WhatsApp:', error);
    Alert.alert(
      'Erreur',
      'Impossible d\'ouvrir WhatsApp. Veuillez installer l\'application ou utiliser un autre moyen de contact.',
      [{ text: 'OK' }]
    );
  }
};

/**
 * Ouvre l'application d'appel avec un numéro de téléphone
 */
export const openPhoneCall = async (phoneNumber = CONTACT_INFO.phone1) => {
  try {
    const url = `tel:${phoneNumber}`;
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
    } else {
      Alert.alert('Erreur', 'Impossible de passer un appel depuis cet appareil.');
    }
  } catch (error) {
    console.error('Erreur lors de l\'appel:', error);
    Alert.alert('Erreur', 'Impossible de passer un appel.');
  }
};

/**
 * Ouvre l'application d'email
 */
export const openEmail = async (email = CONTACT_INFO.email, subject = '', body = '') => {
  try {
    const url = `mailto:${email}${subject ? `?subject=${encodeURIComponent(subject)}` : ''}${body ? `${subject ? '&' : '?'}body=${encodeURIComponent(body)}` : ''}`;
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
    } else {
      Alert.alert('Erreur', 'Aucune application de messagerie trouvée sur cet appareil.');
    }
  } catch (error) {
    console.error('Erreur lors de l\'ouverture de l\'email:', error);
    Alert.alert('Erreur', 'Impossible d\'ouvrir l\'application de messagerie.');
  }
};

/**
 * Affiche un menu de contact avec les options disponibles
 */
export const showContactMenu = (itemName = '') => {
  Alert.alert(
    'Nous contacter',
    `Comment souhaitez-vous nous contacter${itemName ? ` concernant ${itemName}` : ''} ?`,
    [
      {
        text: 'WhatsApp',
        onPress: () => openWhatsApp(CONTACT_INFO.phone1, itemName ? `Bonjour, je souhaite des informations concernant ${itemName}` : 'Bonjour, je souhaite des informations'),
        style: 'default',
      },
      {
        text: 'Appeler',
        onPress: () => openPhoneCall(CONTACT_INFO.phone1),
        style: 'default',
      },
      {
        text: 'Email',
        onPress: () => openEmail(CONTACT_INFO.email, itemName ? `Demande d'informations - ${itemName}` : 'Demande d\'informations'),
        style: 'default',
      },
      {
        text: 'Annuler',
        style: 'cancel',
      },
    ],
    { cancelable: true }
  );
};

