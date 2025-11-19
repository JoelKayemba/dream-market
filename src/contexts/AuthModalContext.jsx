import React, { createContext, useContext, useState, useEffect } from 'react';
import { Modal, View, StyleSheet, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';

// Import dynamique pour éviter les cycles de dépendances
let LoginScreen = null;
let RegisterScreen = null;
let ForgotPasswordScreen = null;

// Fonction pour charger les screens de manière différée
const loadLoginScreen = () => {
  if (!LoginScreen) {
    LoginScreen = require('../screens/LoginScreen').default;
  }
  return LoginScreen;
};

const loadRegisterScreen = () => {
  if (!RegisterScreen) {
    RegisterScreen = require('../screens/RegisterScreen').default;
  }
  return RegisterScreen;
};

const loadForgotPasswordScreen = () => {
  if (!ForgotPasswordScreen) {
    ForgotPasswordScreen = require('../screens/ForgotPasswordScreen').default;
  }
  return ForgotPasswordScreen;
};

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const AuthModalContext = createContext({
  openLogin: () => {},
  openRegister: () => {},
  openForgotPassword: () => {},
  closeAuthModal: () => {},
});

export const useAuthModal = () => {
  const context = useContext(AuthModalContext);
  if (!context) {
    throw new Error('useAuthModal must be used within AuthModalProvider');
  }
  return context;
};

export const AuthModalProvider = ({ children }) => {
  const [visible, setVisible] = useState(false);
  const [modalType, setModalType] = useState('login'); // 'login', 'register', 'forgotPassword'
  const [slideAnim] = useState(new Animated.Value(SCREEN_HEIGHT));
  const insets = useSafeAreaInsets();
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  // Fermer automatiquement le modal après une connexion réussie
  useEffect(() => {
    if (isAuthenticated && visible) {
      Animated.timing(slideAnim, {
        toValue: SCREEN_HEIGHT,
        duration: 250,
        useNativeDriver: true,
      }).start(() => {
        setVisible(false);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, visible]);

  const openLogin = () => {
    setModalType('login');
    setVisible(true);
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 65,
      friction: 11,
    }).start();
  };

  const openRegister = () => {
    setModalType('register');
    setVisible(true);
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 65,
      friction: 11,
    }).start();
  };

  const openForgotPassword = () => {
    setModalType('forgotPassword');
    setVisible(true);
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 65,
      friction: 11,
    }).start();
  };

  const closeAuthModal = () => {
    Animated.timing(slideAnim, {
      toValue: SCREEN_HEIGHT,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      setVisible(false);
    });
  };

  const renderModalContent = () => {
    // Navigation mock pour les modals
    const mockNavigation = {
      goBack: closeAuthModal,
      navigate: (screen) => {
        if (screen === 'Register') {
          openRegister();
        } else if (screen === 'Login') {
          openLogin();
        } else if (screen === 'ForgotPassword') {
          openForgotPassword();
        }
      },
      replace: (screen) => {
        if (screen === 'Register') {
          openRegister();
        } else if (screen === 'Login') {
          openLogin();
        }
      },
      addListener: () => () => {}, // Mock listener
    };

    switch (modalType) {
      case 'register':
        const RegisterComponent = loadRegisterScreen();
        return <RegisterComponent navigation={mockNavigation} />;
      case 'forgotPassword':
        const ForgotPasswordComponent = loadForgotPasswordScreen();
        return <ForgotPasswordComponent navigation={mockNavigation} />;
      case 'login':
      default:
        const LoginComponent = loadLoginScreen();
        return <LoginComponent navigation={mockNavigation} />;
    }
  };

  return (
    <AuthModalContext.Provider
      value={{
        openLogin,
        openRegister,
        openForgotPassword,
        closeAuthModal,
      }}
    >
      {children}
      <Modal
        visible={visible}
        transparent
        animationType="none"
        onRequestClose={closeAuthModal}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.backdrop}
            activeOpacity={1}
            onPress={closeAuthModal}
          />
          <Animated.View
            style={[
              styles.modalContent,
              {
                transform: [{ translateY: slideAnim }],
                maxHeight: SCREEN_HEIGHT * 0.95,
                height: SCREEN_HEIGHT * 0.95,
              },
            ]}
          >
            <View style={styles.handle} />
            <View style={[styles.modalScrollContainer, { paddingBottom: insets.bottom }]}>
              {renderModalContent()}
            </View>
          </Animated.View>
        </View>
      </Modal>
    </AuthModalContext.Provider>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  backdrop: {
    flex: 1,
  },
  modalContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: SCREEN_HEIGHT * 0.95,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  modalScrollContainer: {
    flex: 1,
    height: SCREEN_HEIGHT * 0.95 - 20, // Hauteur fixe moins l'espace pour le handle
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
});

