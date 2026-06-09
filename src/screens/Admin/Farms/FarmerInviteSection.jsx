import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { farmerInvitationService } from '../../../backend/services/farmerInvitationService';

const statusColors = {
  active: '#2E7D32',
  used: '#1565C0',
  expired: '#9CA3AF',
};

const statusLabels = {
  active: 'Active',
  used: 'Utilisée',
  expired: 'Expirée',
};

export default function FarmerInviteSection({ farmId, ownerId }) {
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [lastCode, setLastCode] = useState(null);

  const loadInvites = async () => {
    if (!farmId) return;
    setLoading(true);
    try {
      const data = await farmerInvitationService.getFarmInvites(farmId);
      setInvites(data || []);
    } catch (error) {
      console.error('[FarmerInviteSection]', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvites();
  }, [farmId]);

  const handleCreateInvite = async () => {
    if (!loginIdentifier.trim()) {
      Alert.alert('Erreur', 'Saisissez un identifiant (téléphone ou code ferme).');
      return;
    }

    setCreating(true);
    try {
      const result = await farmerInvitationService.createInvite(farmId, loginIdentifier.trim(), 30);
      setLastCode(result);
      setLoginIdentifier('');
      await loadInvites();
      Alert.alert(
        'Invitation créée',
        `Code à transmettre au fermier (une seule fois) :\n\n${result.code}\n\nIdentifiant : ${result.login_identifier}`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert('Erreur', error.message || 'Impossible de créer l\'invitation.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Accès producteur</Text>
      <Text style={styles.sectionHint}>
        Créez un identifiant et un code unique pour que le fermier active son espace (stats & ventes).
      </Text>

      {ownerId ? (
        <View style={styles.linkedBox}>
          <Ionicons name="checkmark-circle" size={18} color="#2E7D32" />
          <Text style={styles.linkedText}>Compte fermier déjà lié à cette ferme</Text>
        </View>
      ) : null}

      <Text style={styles.label}>Identifiant fermier</Text>
      <TextInput
        style={styles.input}
        value={loginIdentifier}
        onChangeText={setLoginIdentifier}
        placeholder="Ex. +243810150729"
        autoCapitalize="none"
      />

      <TouchableOpacity style={styles.createBtn} onPress={handleCreateInvite} disabled={creating}>
        {creating ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <>
            <Ionicons name="key-outline" size={18} color="#FFFFFF" />
            <Text style={styles.createBtnText}>Générer un code d'accès</Text>
          </>
        )}
      </TouchableOpacity>

      {lastCode?.code ? (
        <View style={styles.codeBox}>
          <Text style={styles.codeLabel}>Dernier code généré</Text>
          <Text style={styles.codeValue}>{lastCode.code}</Text>
        </View>
      ) : null}

      <Text style={styles.listTitle}>Historique des invitations</Text>
      {loading ? (
        <ActivityIndicator color="#4CAF50" style={{ marginVertical: 12 }} />
      ) : invites.length === 0 ? (
        <Text style={styles.empty}>Aucune invitation pour cette ferme.</Text>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.inviteList}>
          {invites.map((invite) => (
            <View key={invite.id} style={styles.inviteCard}>
              <Text style={styles.inviteId}>{invite.login_identifier}</Text>
              <Text style={[styles.inviteStatus, { color: statusColors[invite.status] || '#6B7280' }]}>
                {statusLabels[invite.status] || invite.status}
              </Text>
              <Text style={styles.inviteDate}>
                Expire : {new Date(invite.expires_at).toLocaleDateString('fr-FR')}
              </Text>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#283106', marginBottom: 6 },
  sectionHint: { fontSize: 13, color: '#777E5C', lineHeight: 18, marginBottom: 12 },
  linkedBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#E8F5E9',
    padding: 10,
    borderRadius: 12,
    marginBottom: 12,
  },
  linkedText: { fontSize: 13, fontWeight: '600', color: '#2E7D32' },
  label: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    marginBottom: 12,
    backgroundColor: '#FAFAF9',
  },
  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#4CAF50',
    borderRadius: 999,
    paddingVertical: 12,
    marginBottom: 12,
  },
  createBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
  codeBox: { backgroundColor: '#FFF8E1', padding: 12, borderRadius: 12, marginBottom: 12 },
  codeLabel: { fontSize: 11, fontWeight: '700', color: '#F57F17', marginBottom: 4 },
  codeValue: { fontSize: 18, fontWeight: '800', color: '#283106', letterSpacing: 1 },
  listTitle: { fontSize: 14, fontWeight: '700', color: '#283106', marginBottom: 8 },
  empty: { fontSize: 13, color: '#9CA3AF', fontStyle: 'italic' },
  inviteList: { gap: 10, paddingBottom: 4 },
  inviteCard: {
    minWidth: 160,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  inviteId: { fontSize: 13, fontWeight: '700', color: '#111827', marginBottom: 4 },
  inviteStatus: { fontSize: 12, fontWeight: '700', marginBottom: 4 },
  inviteDate: { fontSize: 11, color: '#6B7280' },
});
