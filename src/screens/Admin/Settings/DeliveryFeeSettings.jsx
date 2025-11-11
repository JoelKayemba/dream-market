import React, { useEffect, useMemo, useState } from 'react';
import {
  SafeAreaView,
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Text,
  TextInput
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useDeliveryFee } from '../../../hooks/useDeliveryFee';
import { formatPrice, getCurrencySymbol } from '../../../utils/currency';

const AVAILABLE_CURRENCIES = ['CDF', 'USD', 'EUR'];

const COLORS = {
  background: '#F5F5F5',
  surface: '#FFFFFF',
  primary: '#4CAF50',
  primaryDark: '#2E7D32',
  primaryLight: '#ECF8EE',
  textPrimary: '#283106',
  textSecondary: '#5F6F52',
  border: '#E0E0E0',
  error: '#C62828',
};

const formatAmountInput = (value) => {
  if (typeof value === 'number') {
    return value.toString();
  }
  return value || '0';
};

export default function DeliveryFeeSettings({ navigation }) {
  const { fee, loading, error, updateFee, refresh } = useDeliveryFee({ autoRefresh: true });
  const [amountInput, setAmountInput] = useState('0');
  const [selectedCurrency, setSelectedCurrency] = useState('CDF');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (fee) {
      setAmountInput(formatAmountInput(fee.amount));
      setSelectedCurrency(fee.currency || 'CDF');
    }
  }, [fee]);

  const parsedAmount = useMemo(() => {
    const numeric = parseFloat(amountInput.replace(',', '.'));
    if (Number.isFinite(numeric) && numeric >= 0) {
      return numeric;
    }
    return NaN;
  }, [amountInput]);

  const hasChanges = useMemo(() => {
    if (!fee) return false;
    const normalizedInput = Number.isNaN(parsedAmount) ? fee.amount : parsedAmount;
    return normalizedInput !== fee.amount || selectedCurrency !== fee.currency;
  }, [fee, parsedAmount, selectedCurrency]);

  const handleCurrencySelect = (currency) => {
    setSelectedCurrency(currency);
  };

  const handleReset = () => {
    Alert.alert(
      'Réinitialiser le frais de livraison',
      'Êtes-vous sûr de vouloir remettre le frais de livraison à 0 ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Réinitialiser',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsSubmitting(true);
              await updateFee(0, selectedCurrency);
              Alert.alert('Succès', 'Le frais de livraison a été réinitialisé.');
            } catch (err) {
              Alert.alert('Erreur', err.message || 'Impossible de réinitialiser le frais de livraison');
            } finally {
              setIsSubmitting(false);
            }
          }
        }
      ]
    );
  };

  const handleSave = async () => {
    if (Number.isNaN(parsedAmount)) {
      Alert.alert('Montant invalide', 'Veuillez saisir un montant valide (utilisez un point ou une virgule pour les décimales).');
      return;
    }

    try {
      setIsSubmitting(true);
      await updateFee(parsedAmount, selectedCurrency);
      Alert.alert('Succès', 'Frais de livraison mis à jour avec succès.');
    } catch (err) {
      Alert.alert('Erreur', err.message || 'Impossible de mettre à jour le frais de livraison.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isSaveDisabled = loading || isSubmitting || !hasChanges || Number.isNaN(parsedAmount);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.headerIconButton}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Frais de livraison</Text>
          <TouchableOpacity
            onPress={refresh}
            disabled={loading || isSubmitting}
            style={[styles.headerIconButton, (loading || isSubmitting) && styles.iconButtonDisabled]}
          >
            <Ionicons name="refresh" size={22} color={loading ? '#B0B0B0' : COLORS.primary} />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Montant actuel</Text>
            <View style={styles.currentFeeBox}>
              {loading ? (
                <ActivityIndicator size="small" color={COLORS.primary} />
              ) : (
                <>
                  <Text style={styles.currentFeeValue}>{formatPrice(fee.amount, fee.currency)}</Text>
                  <Text style={styles.currentFeeSubtitle}>Appliqué à toutes les nouvelles commandes</Text>
                </>
              )}
            </View>

            {error && (
              <View style={styles.errorBox}>
                <Ionicons name="warning" size={18} color={COLORS.error} />
                <Text style={styles.errorText}>{error.message || 'Erreur de chargement du frais de livraison.'}</Text>
              </View>
            )}

            <View style={styles.divider} />

            <Text style={styles.sectionTitle}>Modifier le frais</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Montant</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="cash-outline" size={18} color={COLORS.primary} style={styles.inputIcon} />
                <TextInput
                  value={amountInput}
                  onChangeText={setAmountInput}
                  placeholder="0,00"
                  placeholderTextColor="#9AA48C"
                  keyboardType="decimal-pad"
                  style={styles.textInput}
                />
              </View>
            </View>

            <Text style={styles.currencyLabel}>Devise</Text>
            <View style={styles.currencyChipsContainer}>
              {AVAILABLE_CURRENCIES.map((currency) => {
                const isSelected = selectedCurrency === currency;
                return (
                  <TouchableOpacity
                    key={currency}
                    onPress={() => handleCurrencySelect(currency)}
                    activeOpacity={0.85}
                    style={[styles.currencyChip, isSelected && styles.currencyChipSelected]}
                  >
                    <Ionicons
                      name={isSelected ? 'checkmark-circle' : 'ellipse-outline'}
                      size={18}
                      color={isSelected ? '#FFFFFF' : COLORS.primary}
                      style={styles.currencyChipIcon}
                    />
                    <Text style={[styles.currencyChipText, isSelected && styles.currencyChipTextSelected]}>
                      {currency} ({getCurrencySymbol(currency)})
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.actionsRow}>
              <TouchableOpacity
                onPress={handleReset}
                disabled={isSubmitting || loading}
                style={[styles.secondaryButton, (isSubmitting || loading) && styles.buttonDisabled]}
              >
                <Text style={styles.secondaryButtonText}>Réinitialiser</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSave}
                disabled={isSaveDisabled}
                style={[styles.primaryButton, isSaveDisabled && styles.buttonDisabled]}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.primaryButtonText}>Enregistrer</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.infoCard}>
            <View style={styles.infoHeader}>
              <Ionicons name="information-circle" size={22} color={COLORS.primary} />
              <Text style={styles.infoTitle}>Comment ça marche ?</Text>
            </View>
            <View style={styles.infoBullet}>
              <Ionicons name="checkmark-circle" size={18} color={COLORS.primary} style={styles.infoBulletIcon} />
              <Text style={styles.infoText}>Le frais est ajouté automatiquement au total lors du paiement.</Text>
            </View>
            <View style={styles.infoBullet}>
              <Ionicons name="checkmark-circle" size={18} color={COLORS.primary} style={styles.infoBulletIcon} />
              <Text style={styles.infoText}>Chaque commande enregistre le montant appliqué pour garder un historique fiable.</Text>
            </View>
            <View style={styles.infoBullet}>
              <Ionicons name="checkmark-circle" size={18} color={COLORS.primary} style={styles.infoBulletIcon} />
              <Text style={styles.infoText}>Le total affiché côté client et dans la gestion admin inclut ce frais.</Text>
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  headerIconButton: {
    padding: 8,
    borderRadius: 24,
  },
  iconButtonDisabled: {
    opacity: 0.5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    padding: 18,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 16,
  },
  currentFeeBox: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  currentFeeValue: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.primaryDark,
    marginBottom: 6,
  },
  currentFeeSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FDECEA',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    gap: 8,
  },
  errorText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.error,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: COLORS.border,
    marginVertical: 18,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.primary,
    paddingHorizontal: 14,
    paddingVertical: 4,
  },
  inputIcon: {
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 18,
    color: COLORS.textPrimary,
    paddingVertical: 10,
  },
  currencyLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  currencyChipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 24,
  },
  currencyChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.primary,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  currencyChipSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
    shadowOpacity: 0.12,
    elevation: 2,
  },
  currencyChipIcon: {
    marginRight: 8,
  },
  currencyChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  currencyChipTextSelected: {
    color: '#FFFFFF',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.primary,
    backgroundColor: '#FFFFFF',
  },
  secondaryButtonText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  infoCard: {
    marginTop: 20,
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    paddingVertical: 20,
    paddingHorizontal: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  infoBullet: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 12,
  },
  infoBulletIcon: {
    marginTop: 2,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
});
