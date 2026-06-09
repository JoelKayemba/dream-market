import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '../../components/ui';
import { useAuth } from '../../hooks/useAuth';
import { useFarmerDataRefresh } from '../../hooks/useFarmerDataRefresh';
import {
  clearFarmerState,
  fetchFarmerDashboard,
  selectFarmerFarmProfile,
  selectFarmerLoading,
} from '../../store/farmer/farmerSlice';
import { resetToScreen } from '../../navigation/navigationRef';

const parseContact = (contact) => {
  if (!contact) return {};
  if (typeof contact === 'string') {
    try {
      return JSON.parse(contact);
    } catch {
      return {};
    }
  }
  return contact;
};

const InfoRow = ({ icon, label, value }) => (
  <View style={styles.infoRow}>
    <Ionicons name={icon} size={18} color="#6B7280" />
    <View style={styles.infoRowText}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  </View>
);

export default function FarmerProfileScreen({ navigation }) {
  const dispatch = useDispatch();
  const { user, logout } = useAuth();
  const farmProfile = useSelector(selectFarmerFarmProfile);
  const loading = useSelector(selectFarmerLoading);
  const farm = farmProfile?.farm;

  const contact = useMemo(() => parseContact(farm?.contact), [farm?.contact]);

  const coverUri = farm?.cover_image || farm?.main_image || farm?.image || null;
  const mainUri = farm?.main_image || farm?.cover_image || farm?.image || null;

  const establishedYear = farm?.established
    ? typeof farm.established === 'number'
      ? String(farm.established)
      : String(new Date(farm.established).getFullYear())
    : null;

  const certifications = Array.isArray(farm?.certifications) ? farm.certifications : [];
  const practices = Array.isArray(farm?.sustainablePractices) ? farm.sustainablePractices : [];

  useFarmerDataRefresh(fetchFarmerDashboard);

  const handleLogout = () => {
    Alert.alert('Déconnexion', 'Voulez-vous quitter votre espace producteur ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Déconnexion',
        style: 'destructive',
        onPress: async () => {
          dispatch(clearFarmerState());
          await logout();
          resetToScreen(navigation, 'MainApp');
        },
      },
    ]);
  };

  return (
    <ScreenWrapper style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Mon profil</Text>

        <View style={styles.card}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={32} color="#2E7D32" />
          </View>
          <Text style={styles.name}>
            {[user?.firstName, user?.lastName].filter(Boolean).join(' ') || 'Producteur'}
          </Text>
          <Text style={styles.email}>{user?.email}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>Partenaire fermier</Text>
          </View>
        </View>

        {loading && !farmProfile ? (
          <ActivityIndicator size="large" color="#2E7D32" style={{ marginVertical: 24 }} />
        ) : farm ? (
          <View style={styles.farmSection}>
            <View style={styles.readOnlyBanner}>
              <Ionicons name="lock-closed-outline" size={16} color="#1565C0" />
              <Text style={styles.readOnlyText}>
                Fiche ferme en lecture seule — modifications via Dream Field uniquement.
              </Text>
            </View>

            {coverUri ? (
              <Image source={{ uri: coverUri }} style={styles.coverImage} resizeMode="cover" />
            ) : (
              <View style={[styles.coverImage, styles.coverPlaceholder]}>
                <Ionicons name="image-outline" size={32} color="#9CA3AF" />
              </View>
            )}

            <View style={styles.farmCard}>
              {mainUri ? (
                <Image source={{ uri: mainUri }} style={styles.mainImage} resizeMode="cover" />
              ) : (
                <View style={[styles.mainImage, styles.mainPlaceholder]}>
                  <Ionicons name="leaf-outline" size={28} color="#2E7D32" />
                </View>
              )}

              <View style={styles.farmHeader}>
                <Text style={styles.farmName}>{farm.name}</Text>
                {farm.verified ? (
                  <View style={styles.verifiedRow}>
                    <Ionicons name="checkmark-circle" size={16} color="#2E7D32" />
                    <Text style={styles.verifiedText}>Ferme vérifiée Dream Field</Text>
                  </View>
                ) : null}
                {(farm.commission_rate || 0) > 0 ? (
                  <View style={styles.commissionBadge}>
                    <Ionicons name="pie-chart-outline" size={14} color="#6A1B9A" />
                    <Text style={styles.commissionBadgeText}>
                      Commission Dream Field : {Number(farm.commission_rate)} % sur vos ventes
                    </Text>
                  </View>
                ) : null}
              </View>

              {farm.location ? (
                <View style={styles.chipRow}>
                  <View style={styles.chip}>
                    <Ionicons name="navigate-outline" size={14} color="#2E7D32" />
                    <Text style={styles.chipText}>{farm.location}</Text>
                  </View>
                  {farm.specialty ? (
                    <View style={styles.chip}>
                      <Ionicons name="leaf-outline" size={14} color="#2E7D32" />
                      <Text style={styles.chipText}>{farm.specialty}</Text>
                    </View>
                  ) : null}
                </View>
              ) : null}

              <View style={styles.metricsRow}>
                {farm.size ? (
                  <View style={styles.metric}>
                    <Text style={styles.metricValue}>{farm.size} ha</Text>
                    <Text style={styles.metricLabel}>Surface</Text>
                  </View>
                ) : null}
                {establishedYear ? (
                  <View style={styles.metric}>
                    <Text style={styles.metricValue}>{establishedYear}</Text>
                    <Text style={styles.metricLabel}>Création</Text>
                  </View>
                ) : null}
                {farm.rating != null ? (
                  <View style={styles.metric}>
                    <Text style={styles.metricValue}>{farm.rating}/5</Text>
                    <Text style={styles.metricLabel}>Note</Text>
                  </View>
                ) : null}
              </View>

              {farm.description ? (
                <View style={styles.textBlock}>
                  <Text style={styles.blockTitle}>Description</Text>
                  <Text style={styles.blockText}>{String(farm.description)}</Text>
                </View>
              ) : null}

              {farm.story ? (
                <View style={styles.textBlock}>
                  <Text style={styles.blockTitle}>Notre histoire</Text>
                  <Text style={styles.blockText}>{String(farm.story)}</Text>
                </View>
              ) : null}

              {certifications.length > 0 ? (
                <View style={styles.textBlock}>
                  <Text style={styles.blockTitle}>Certifications</Text>
                  <View style={styles.tagRow}>
                    {certifications.map((item, idx) => (
                      <View key={`cert-${idx}`} style={styles.tag}>
                        <Text style={styles.tagText}>{String(item)}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              ) : null}

              {practices.length > 0 ? (
                <View style={styles.textBlock}>
                  <Text style={styles.blockTitle}>Pratiques durables</Text>
                  <View style={styles.tagRow}>
                    {practices.map((item, idx) => (
                      <View key={`practice-${idx}`} style={styles.tag}>
                        <Text style={styles.tagText}>{String(item)}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              ) : null}

              {(contact.phone || contact.email || contact.website) ? (
                <View style={styles.textBlock}>
                  <Text style={styles.blockTitle}>Contact</Text>
                  {contact.phone ? <InfoRow icon="call-outline" label="Téléphone" value={contact.phone} /> : null}
                  {contact.email ? <InfoRow icon="mail-outline" label="Email" value={contact.email} /> : null}
                  {contact.website ? <InfoRow icon="globe-outline" label="Site web" value={contact.website} /> : null}
                </View>
              ) : null}
            </View>
          </View>
        ) : (
          <View style={styles.infoBox}>
            <Ionicons name="information-circle-outline" size={20} color="#1565C0" />
            <Text style={styles.infoText}>Aucune ferme associée à votre compte.</Text>
          </View>
        )}

        <View style={styles.infoBox}>
          <Ionicons name="information-circle-outline" size={20} color="#1565C0" />
          <Text style={styles.infoText}>
            Les prix, photos catalogue et la mise en ligne des produits sont gérés par l'équipe Dream Field.
            Contactez-nous pour toute modification.
          </Text>
        </View>

        <TouchableOpacity style={styles.clientBtn} onPress={() => resetToScreen(navigation, 'MainApp')}>
          <Ionicons name="storefront-outline" size={20} color="#2E7D32" />
          <Text style={styles.clientBtnText}>Voir la boutique client</Text>
          <Ionicons name="chevron-forward" size={18} color="#2E7D32" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#C62828" />
          <Text style={styles.logoutText}>Se déconnecter</Text>
        </TouchableOpacity>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F6F3' },
  content: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 24, fontWeight: '800', color: '#283106', marginBottom: 16 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8E6E1',
    marginBottom: 16,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  name: { fontSize: 18, fontWeight: '800', color: '#111827' },
  email: { fontSize: 13, color: '#6B7280', marginTop: 4 },
  roleBadge: { marginTop: 12, backgroundColor: '#F0F8F0', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999 },
  roleText: { fontSize: 12, fontWeight: '700', color: '#2E7D32' },
  farmSection: { marginBottom: 16 },
  readOnlyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#E3F2FD',
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
  },
  readOnlyText: { flex: 1, fontSize: 12, color: '#1565C0', lineHeight: 17, fontWeight: '600' },
  coverImage: { width: '100%', height: 140, borderRadius: 20 },
  coverPlaceholder: {
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  farmCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 16,
    marginTop: -32,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#E8E6E1',
  },
  mainImage: {
    width: 72,
    height: 72,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  mainPlaceholder: {
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  farmHeader: { marginBottom: 8 },
  farmName: { fontSize: 20, fontWeight: '800', color: '#283106' },
  verifiedRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
  verifiedText: { fontSize: 12, fontWeight: '600', color: '#2E7D32' },
  commissionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    backgroundColor: '#F3E5F5',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    alignSelf: 'flex-start',
  },
  commissionBadgeText: { fontSize: 11, fontWeight: '700', color: '#6A1B9A' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F0F8F0',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  chipText: { fontSize: 12, fontWeight: '600', color: '#2E7D32' },
  metricsRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  metric: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    padding: 10,
    alignItems: 'center',
  },
  metricValue: { fontSize: 15, fontWeight: '800', color: '#111827' },
  metricLabel: { fontSize: 11, color: '#6B7280', marginTop: 2 },
  textBlock: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#F3F4F6' },
  blockTitle: { fontSize: 12, fontWeight: '700', color: '#6B7280', textTransform: 'uppercase', marginBottom: 6 },
  blockText: { fontSize: 14, color: '#374151', lineHeight: 21 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: { backgroundColor: '#F3F4F6', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  tagText: { fontSize: 12, color: '#374151', fontWeight: '600' },
  infoRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginTop: 8 },
  infoRowText: { flex: 1 },
  infoLabel: { fontSize: 11, color: '#9CA3AF', fontWeight: '600' },
  infoValue: { fontSize: 14, color: '#111827', marginTop: 2 },
  infoBox: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: '#E3F2FD',
    padding: 14,
    borderRadius: 20,
    marginBottom: 20,
  },
  infoText: { flex: 1, fontSize: 13, color: '#1565C0', lineHeight: 18 },
  clientBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 999,
    backgroundColor: '#E8F5E9',
    borderWidth: 1,
    borderColor: '#C8E6C9',
    marginBottom: 16,
  },
  clientBtnText: { flex: 1, color: '#2E7D32', fontWeight: '700', fontSize: 15 },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 999,
    backgroundColor: '#FFEBEE',
  },
  logoutText: { color: '#C62828', fontWeight: '700', fontSize: 15 },
});
