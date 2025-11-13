import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Text,
  Alert,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { generateInvoiceHTML, getInvoiceFileName } from '../../utils/invoiceService';
import { Asset } from 'expo-asset';

import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as Print from 'expo-print';

// Import WebView avec gestion d'erreur
let WebView;
try {
  const WebViewModule = require('react-native-webview');
  WebView = WebViewModule.WebView || WebViewModule.default;
} catch (error) {
  console.warn('⚠️ [InvoiceModal] react-native-webview non disponible:', error);
  WebView = null;
}

export default function InvoiceModal({ visible, order, onClose }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [webViewError, setWebViewError] = useState(false);
  const [logoUri, setLogoUri] = useState(null);

  // Charger le logo au montage du composant et le convertir en base64
  useEffect(() => {
    const loadLogo = async () => {
      try {
        const asset = Asset.fromModule(require('../../../assets/Dream_logo.png'));
        await asset.downloadAsync();
        const uri = asset.localUri || asset.uri;
        
        // Convertir l'image en base64 pour une meilleure compatibilité avec expo-print
        try {
          // Utiliser fetch pour lire le fichier
          const response = await fetch(uri);
          const arrayBuffer = await response.arrayBuffer();
          
          // Convertir ArrayBuffer en base64 manuellement
          const bytes = new Uint8Array(arrayBuffer);
          let binary = '';
          for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
          }
          const base64 = btoa(binary);
          
          // Déterminer le type MIME (PNG dans ce cas)
          const mimeType = 'image/png';
          setLogoUri(`data:${mimeType};base64,${base64}`);
        } catch (base64Error) {
          // Si la conversion base64 échoue, utiliser l'URI directement
          console.warn('⚠️ [InvoiceModal] Impossible de convertir le logo en base64, utilisation de l\'URI:', base64Error);
          setLogoUri(uri);
        }
      } catch (error) {
        console.warn('⚠️ [InvoiceModal] Impossible de charger le logo:', error);
      }
    };
    
    if (visible) {
      loadLogo();
    }
  }, [visible]);

  if (!order) return null;

  const invoiceHTML = generateInvoiceHTML(order, logoUri);
  const fileName = getInvoiceFileName(order, 'pdf');

  const handleDownload = async () => {
    try {
      setIsGenerating(true);

      // Générer le HTML de la facture avec le logo
      const html = generateInvoiceHTML(order, logoUri);

      // Générer le PDF à partir du HTML
      const { uri } = await Print.printToFileAsync({
        html: html,
        base64: false,
        width: 595, // A4 width in points
        height: 842, // A4 height in points
      });

      // Vérifier si le partage est disponible
      const isAvailable = await Sharing.isAvailableAsync();
      
      if (isAvailable) {
        // Partager/télécharger le fichier PDF
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Télécharger la facture PDF',
          UTI: 'com.adobe.pdf',
        });
      } else {
        // Copier le fichier vers un emplacement accessible
        const destinationUri = `${FileSystem.documentDirectory}${fileName}`;
        await FileSystem.copyAsync({
          from: uri,
          to: destinationUri,
        });
        
        Alert.alert(
          'Téléchargement',
          `Le fichier PDF a été sauvegardé.\n\nEmplacement: ${destinationUri}\n\nVous pouvez le partager depuis votre gestionnaire de fichiers.`,
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('❌ [InvoiceModal] Erreur lors de la génération du PDF:', error);
      Alert.alert(
        'Erreur',
        'Impossible de générer le PDF. Vous pouvez faire une capture d\'écran de la facture affichée.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = async () => {
    try {
      // Sur mobile, on peut ouvrir le partage qui permet d'imprimer
      await handleDownload();
    } catch (error) {
      console.error('❌ [InvoiceModal] Erreur lors de l\'impression:', error);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Ionicons name="receipt-outline" size={24} color="#283106" />
            <Text style={styles.headerTitle}>Facture</Text>
            <Text style={styles.headerSubtitle}>
              #{order.order_number || order.orderNumber}
            </Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleDownload}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <ActivityIndicator size="small" color="#2F8F46" />
              ) : (
                <>
                  <Ionicons name="document-text-outline" size={20} color="#2F8F46" />
                  <Text style={styles.actionButtonText}>Télécharger PDF</Text>
                </>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
            >
              <Ionicons name="close" size={24} color="#283106" />
            </TouchableOpacity>
          </View>
        </View>

        {/* WebView pour afficher la facture */}
        {WebView ? (
          <WebView
            source={{ html: invoiceHTML }}
            style={styles.webview}
            scalesPageToFit={true}
            showsVerticalScrollIndicator={true}
            startInLoadingState={true}
            onError={(syntheticEvent) => {
              const { nativeEvent } = syntheticEvent;
              console.error('❌ [InvoiceModal] Erreur WebView:', nativeEvent);
              setWebViewError(true);
            }}
            onHttpError={(syntheticEvent) => {
              const { nativeEvent } = syntheticEvent;
              console.error('❌ [InvoiceModal] Erreur HTTP WebView:', nativeEvent);
            }}
            renderLoading={() => (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#2F8F46" />
                <Text style={styles.loadingText}>Chargement de la facture...</Text>
              </View>
            )}
          />
        ) : (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={48} color="#FF9800" />
            <Text style={styles.errorTitle}>WebView non disponible</Text>
            <Text style={styles.errorText}>
              Pour afficher la facture, veuillez installer react-native-webview:
            </Text>
            <Text style={styles.errorCode}>npx expo install react-native-webview</Text>
            <Text style={styles.errorText}>
              Vous pouvez toujours télécharger la facture en PDF en utilisant le bouton "Télécharger".
            </Text>
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
  },
  headerLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#283106',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#777E5C',
    marginLeft: 4,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#E8F5E9',
    borderWidth: 1,
    borderColor: '#2F8F46',
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2F8F46',
  },
  closeButton: {
    padding: 4,
  },
  webview: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#777E5C',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#FFFFFF',
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#283106',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#777E5C',
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 20,
  },
  errorCode: {
    fontSize: 12,
    fontFamily: 'monospace',
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderRadius: 8,
    color: '#283106',
    marginTop: 16,
    marginBottom: 8,
  },
});

