import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';

export const useImagePicker = () => {
  const [loading, setLoading] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);

  const requestPermissions = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission requise',
          'Nous avons besoin de votre permission pour accéder à vos photos.',
          [{ text: 'OK' }]
        );
        return false;
      }
      return true;
    } catch (error) {
      console.error('Erreur lors de la demande de permission:', error);
      Alert.alert('Erreur', 'Impossible de demander la permission d\'accès aux photos.');
      return false;
    }
  };

  const pickSingleImage = async (options = {}) => {
    try {
      setLoading(true);
      
      const hasPermission = await requestPermissions();
      if (!hasPermission) {
        setLoading(false);
        return null;
      }

      // Options par défaut améliorées
      const defaultOptions = {
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: options.allowsEditing !== undefined ? options.allowsEditing : false, // Désactivé par défaut pour garder l'image entière
        aspect: options.aspect || [16, 9], // Format paysage par défaut
        quality: options.quality || 1, // Qualité maximale par défaut
        base64: options.base64 || false,
        allowsMultipleSelection: false,
        exif: true, // Inclure les métadonnées EXIF
      };

      const result = await ImagePicker.launchImageLibraryAsync({
        ...defaultOptions,
        ...options // Les options passées en paramètre écrasent les défauts
      });

      setLoading(false);

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        return {
          uri: asset.uri,
          width: asset.width,
          height: asset.height,
          type: asset.type,
          fileName: asset.fileName || `image_${Date.now()}.jpg`,
          fileSize: asset.fileSize,
          base64: asset.base64,
          exif: asset.exif
        };
      }

      return null;
    } catch (error) {
      setLoading(false);
      console.error('Erreur lors de la sélection d\'image:', error);
      Alert.alert('Erreur', 'Impossible de sélectionner l\'image. Veuillez réessayer.');
      return null;
    }
  };

  const pickMultipleImages = async (options = {}) => {
    try {
      setLoading(true);
      
      const hasPermission = await requestPermissions();
      if (!hasPermission) {
        setLoading(false);
        return [];
      }

      // Options par défaut améliorées
      const defaultOptions = {
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        allowsEditing: false, // Pas d'édition pour sélection multiple
        quality: options.quality || 1, // Qualité maximale par défaut
        base64: options.base64 || false,
        selectionLimit: options.limit || 5,
        exif: true,
      };

      const result = await ImagePicker.launchImageLibraryAsync({
        ...defaultOptions,
        ...options // Les options passées en paramètre écrasent les défauts
      });

      setLoading(false);

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const assets = result.assets.map((asset, index) => ({
          uri: asset.uri,
          width: asset.width,
          height: asset.height,
          type: asset.type,
          fileName: asset.fileName || `image_${Date.now()}_${index}.jpg`,
          fileSize: asset.fileSize,
          base64: asset.base64,
          exif: asset.exif
        }));
        return assets;
      }

      return [];
    } catch (error) {
      setLoading(false);
      console.error('Erreur lors de la sélection d\'images:', error);
      Alert.alert('Erreur', 'Impossible de sélectionner les images. Veuillez réessayer.');
      return [];
    }
  };

  const takePhoto = async (options = {}) => {
    try {
      setLoading(true);
      
      // Demander la permission pour la caméra
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission requise',
          'Nous avons besoin de votre permission pour accéder à la caméra.',
          [{ text: 'OK' }]
        );
        setLoading(false);
        return null;
      }

      // Options par défaut améliorées
      const defaultOptions = {
        allowsEditing: options.allowsEditing !== undefined ? options.allowsEditing : false, // Désactivé par défaut
        aspect: options.aspect || [16, 9],
        quality: options.quality || 1, // Qualité maximale
        base64: options.base64 || false,
        exif: true,
      };

      const result = await ImagePicker.launchCameraAsync({
        ...defaultOptions,
        ...options // Les options passées en paramètre écrasent les défauts
      });

      setLoading(false);

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        return {
          uri: asset.uri,
          width: asset.width,
          height: asset.height,
          type: asset.type,
          fileName: asset.fileName || `photo_${Date.now()}.jpg`,
          fileSize: asset.fileSize,
          base64: asset.base64,
          exif: asset.exif
        };
      }

      return null;
    } catch (error) {
      setLoading(false);
      console.error('Erreur lors de la prise de photo:', error);
      Alert.alert('Erreur', 'Impossible de prendre la photo. Veuillez réessayer.');
      return null;
    }
  };

  const removeImage = (index) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const clearImages = () => {
    setSelectedImages([]);
  };

  const addImage = (image) => {
    setSelectedImages(prev => [...prev, image]);
  };

  const addImages = (images) => {
    setSelectedImages(prev => [...prev, ...images]);
  };

  const showImagePickerOptions = (onImageSelected, options = {}) => {
    Alert.alert(
      'Sélectionner une image',
      'Choisissez une option',
      [
        {
          text: 'Annuler',
          style: 'cancel'
        },
        {
          text: 'Prendre une photo',
          onPress: async () => {
            const image = await takePhoto(options);
            if (image) {
              onImageSelected(image);
            }
          }
        },
        {
          text: 'Choisir dans la galerie',
          onPress: async () => {
            const image = await pickSingleImage(options);
            if (image) {
              onImageSelected(image);
            }
          }
        }
      ]
    );
  };

  const showMultipleImagePickerOptions = (onImagesSelected, options = {}) => {
    Alert.alert(
      'Sélectionner des images',
      'Choisissez une option',
      [
        {
          text: 'Annuler',
          style: 'cancel'
        },
        {
          text: 'Prendre une photo',
          onPress: async () => {
            const image = await takePhoto(options);
            if (image) {
              onImagesSelected([image]);
            }
          }
        },
        {
          text: 'Choisir dans la galerie',
          onPress: async () => {
            const images = await pickMultipleImages(options);
            if (images.length > 0) {
              onImagesSelected(images);
            }
          }
        }
      ]
    );
  };

  return {
    loading,
    selectedImages,
    pickSingleImage,
    pickMultipleImages,
    takePhoto,
    removeImage,
    clearImages,
    addImage,
    addImages,
    showImagePickerOptions,
    showMultipleImagePickerOptions,
    setSelectedImages
  };
};

export default useImagePicker;
