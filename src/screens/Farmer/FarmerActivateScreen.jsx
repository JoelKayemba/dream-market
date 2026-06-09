import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch } from 'react-redux';
import { ScreenWrapper } from '../../components/ui';
import { farmerInvitationService } from '../../backend/services/farmerInvitationService';
import { supabase } from '../../backend/config/supabase';
import { resetToScreen, navigateRoot } from '../../navigation/navigationRef';

export default function FarmerActivateScreen({ navigation }) {
  const dispatch = useDispatch();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [inviteData, setInviteData] = useState(null);

  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [code, setCode] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  const handleValidateCode = async () => {
    if (!loginIdentifier.trim() || !code.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir votre identifiant et votre code partenaire.');
      return;
    }

    setLoading(true);
    try {
      const result = await farmerInvitationService.validateInvite(loginIdentifier, code);
      if (!result?.valid) {
        Alert.alert('Code invalide', result?.message || 'Identifiant ou code incorrect.');
        return;
      }
      setInviteData(result);
      setStep(2);
    } catch (error) {
      Alert.alert('Erreur', error.message || 'Impossible de valider le code.');
    } finally {
      setLoading(false);
    }
  };

  const syncAuthToRedux = async (session, role = 'farmer') => {
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .maybeSingle();

    dispatch({
      type: 'auth/loginUser/fulfilled',
      payload: {
        user: {
          id: session.user.id,
          email: session.user.email,
          role: role || profile?.role || 'farmer',
          firstName: profile?.first_name || firstName,
          lastName: profile?.last_name || lastName,
          phone: profile?.phone || '',
          address: profile?.address || '',
          avatarUrl: profile?.avatar_url || '',
        },
        token: session.access_token,
        refreshToken: session.refresh_token,
      },
    });
  };

  const waitForProfile = async (userId, attempts = 8) => {
    for (let i = 0; i < attempts; i += 1) {
      const { data } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .maybeSingle();
      if (data?.id) return true;
      await new Promise((resolve) => setTimeout(resolve, 400));
    }
    return false;
  };

  const goToFarmerApp = () => {
    resetToScreen(navigation, 'FarmerApp');
  };

  const handleActivateAccount = async () => {
    if (!email.trim() || !password.trim() || !firstName.trim()) {
      Alert.alert('Erreur', 'Email, mot de passe et prénom sont requis.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Erreur', 'Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Erreur', 'Les mots de passe ne correspondent pas.');
      return;
    }

    setLoading(true);
    try {
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            first_name: firstName.trim(),
            last_name: lastName.trim(),
            role: 'farmer',
          },
        },
      });

      if (signUpError) throw signUpError;

      if (!signUpData.session) {
        Alert.alert(
          'Confirmez votre email',
          'Un email de confirmation a été envoyé. Après confirmation, connectez-vous avec votre email et mot de passe pour accéder à votre espace producteur.',
          [{ text: 'OK', onPress: () => navigateRoot('Login') }]
        );
        return;
      }

      await waitForProfile(signUpData.user.id);
      await farmerInvitationService.completeActivation(inviteData.invite_id);
      await syncAuthToRedux(signUpData.session, 'farmer');

      goToFarmerApp();
    } catch (error) {
      Alert.alert('Erreur', error.message || 'Activation impossible.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper style={styles.container}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#283106" />
          </TouchableOpacity>

          <View style={styles.hero}>
            <View style={styles.iconWrap}>
              <Ionicons name="leaf" size={28} color="#2E7D32" />
            </View>
            <Text style={styles.title}>Espace producteur</Text>
            <Text style={styles.subtitle}>
              Activez votre accès Dream Field avec l'identifiant et le code remis par notre équipe.
            </Text>
          </View>

          {step === 1 ? (
            <View style={styles.card}>
              <Text style={styles.stepLabel}>Étape 1 — Code partenaire</Text>
              <Text style={styles.label}>Identifiant</Text>
              <TextInput
                style={styles.input}
                value={loginIdentifier}
                onChangeText={setLoginIdentifier}
                placeholder="Ex. +243810000000 ou FERME-KIN-001"
                autoCapitalize="none"
              />
              <Text style={styles.label}>Code unique</Text>
              <TextInput
                style={styles.input}
                value={code}
                onChangeText={setCode}
                placeholder="Ex. DM-ABCD-EFGH"
                autoCapitalize="characters"
              />
              <TouchableOpacity style={styles.primaryBtn} onPress={handleValidateCode} disabled={loading}>
                {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.primaryBtnText}>Continuer</Text>}
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.card}>
              <Text style={styles.stepLabel}>Étape 2 — Créer votre compte</Text>
              <View style={styles.farmBadge}>
                <Ionicons name="business-outline" size={18} color="#2E7D32" />
                <Text style={styles.farmBadgeText}>{inviteData?.farm_name}</Text>
              </View>
              <Text style={styles.label}>Prénom</Text>
              <TextInput style={styles.input} value={firstName} onChangeText={setFirstName} />
              <Text style={styles.label}>Nom</Text>
              <TextInput style={styles.input} value={lastName} onChangeText={setLastName} />
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <Text style={styles.label}>Mot de passe</Text>
              <TextInput style={styles.input} value={password} onChangeText={setPassword} secureTextEntry />
              <Text style={styles.label}>Confirmer le mot de passe</Text>
              <TextInput
                style={styles.input}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
              />
              <TouchableOpacity style={styles.primaryBtn} onPress={handleActivateAccount} disabled={loading}>
                {loading ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.primaryBtnText}>Activer mon espace</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity style={styles.linkBtn} onPress={() => setStep(1)}>
                <Text style={styles.linkText}>Modifier le code</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F6F3' },
  flex: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },
  backBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  hero: { alignItems: 'center', marginBottom: 24 },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  title: { fontSize: 24, fontWeight: '800', color: '#283106', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#6B7280', textAlign: 'center', lineHeight: 20 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E8E6E1',
  },
  stepLabel: { fontSize: 12, fontWeight: '700', color: '#2E7D32', marginBottom: 16, textTransform: 'uppercase' },
  label: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6, marginTop: 8 },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#111827',
    backgroundColor: '#FAFAF9',
  },
  primaryBtn: {
    marginTop: 20,
    backgroundColor: '#2E7D32',
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },
  linkBtn: { marginTop: 14, alignItems: 'center' },
  linkText: { color: '#2E7D32', fontWeight: '600' },
  farmBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F0F8F0',
    padding: 12,
    borderRadius: 16,
    marginBottom: 8,
  },
  farmBadgeText: { fontSize: 14, fontWeight: '700', color: '#283106', flex: 1 },
});
