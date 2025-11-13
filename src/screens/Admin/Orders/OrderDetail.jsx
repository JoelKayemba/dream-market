import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Text,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import SafeAreaWrapper from '../../../components/SafeAreaWrapper';
import { InvoiceModal } from '../../../components/ui';
import {
  updateOrderStatus,
  selectOrderById,
} from '../../../store/admin/ordersSlice';
import { openWhatsApp, openPhoneCall, openEmail } from '../../../utils/contactInfo';

/* === Palette conservée === */
const COLORS = {
  bg: '#f5f5f5',
  ink: '#283106',
  muted: '#777E5C',
  accent: '#4CAF50',
  border: '#E0E0E0',
  card: '#FFFFFF',
};

export default function OrderDetail({ route, navigation }) {
  const { order: initialOrder } = route.params;
  const dispatch = useDispatch();

  const order = useSelector(selectOrderById(initialOrder.id)) || initialOrder;

  const [showStatusModal, setShowStatusModal] = React.useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  /* ===== Helpers ===== */
  const getTrimmedValue = (value) => {
    if (value === null || value === undefined) return '';
    if (typeof value === 'string') return value.trim();
    return String(value);
  };

  const customerFirstName =
    getTrimmedValue(order?.customerFirstName) ||
    getTrimmedValue(order?.customer_first_name) ||
    getTrimmedValue(order?.profiles?.first_name);
  const customerLastName =
    getTrimmedValue(order?.customerLastName) ||
    getTrimmedValue(order?.customer_last_name) ||
    getTrimmedValue(order?.profiles?.last_name);
  const customerEmail =
    getTrimmedValue(order?.customerEmail) ||
    getTrimmedValue(order?.customer_email) ||
    getTrimmedValue(order?.profiles?.email);
  const customerPhone =
    getTrimmedValue(order?.customerPhone) ||
    getTrimmedValue(order?.phone_number);

  const customerName =
    [customerFirstName, customerLastName].filter(Boolean).join(' ').trim() ||
    customerEmail ||
    customerPhone ||
    'Client inconnu';

  const formatPrice = (amount, currency = 'CDF') => {
    if (amount === null || amount === undefined || isNaN(amount)) {
      return currency === 'USD' ? '$0.00' : '0 FC';
    }
    if (currency === 'USD') return `$${parseFloat(amount).toFixed(2)}`;
    return `${parseFloat(amount).toFixed(0)} FC`;
  };

  const deliveryFeeAmount =
    Number(order?.deliveryFeeAmount ?? order?.delivery_fee_amount ?? 0) || 0;
  const deliveryFeeCurrency =
    getTrimmedValue(order?.deliveryFeeCurrency) ||
    getTrimmedValue(order?.delivery_fee_currency) ||
    'CDF';
  const deliveryFeeValue =
    deliveryFeeAmount > 0
      ? formatPrice(deliveryFeeAmount, deliveryFeeCurrency)
      : 'Gratuit';

  const totalsWithDelivery = React.useMemo(() => {
    if (order?.totalsWithDelivery) return order.totalsWithDelivery;
    const baseTotals = { ...(order?.totals || {}) };
    if (deliveryFeeAmount > 0) {
      baseTotals[deliveryFeeCurrency] =
        (baseTotals[deliveryFeeCurrency] || 0) + deliveryFeeAmount;
    }
    return baseTotals;
  }, [order?.totalsWithDelivery, order?.totals, deliveryFeeAmount, deliveryFeeCurrency]);

  const STATUS = {
    pending:   { label: 'En attente',      color: '#FF9800', icon: 'time-outline' },
    confirmed: { label: 'Confirmée',       color: '#2196F3', icon: 'checkmark-circle-outline' },
    preparing: { label: 'En préparation',  color: '#9C27B0', icon: 'restaurant-outline' },
    shipped:   { label: 'Expédiée',        color: '#FF5722', icon: 'car-outline' },
    delivered: { label: 'Livrée',          color: '#4CAF50', icon: 'checkmark-done-outline' },
    cancelled: { label: 'Annulée',         color: '#F44336', icon: 'close-circle-outline' },
  };

  const getStatusLabel = (s) => STATUS[s]?.label || s;
  const getStatusColor = (s) => STATUS[s]?.color || COLORS.muted;

  const formatDate = (dateString) => {
    if (!dateString) return 'Date inconnue';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Date invalide';
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'Date invalide';
    }
  };

  const getNextStatus = () => {
    const flow = {
      pending: 'confirmed',
      confirmed: 'preparing',
      preparing: 'shipped',
      shipped: 'delivered',
    };
    return flow[order.status];
  };

  const getAvailableStatuses = () =>
    Object.entries(STATUS)
      .map(([id, meta]) => ({ id, ...meta }))
      .filter((s) => s.id !== order.status);

  const handleUpdateStatus = (newStatus) => {
    Alert.alert(
      'Changer le statut',
      `Passer la commande ${order.orderNumber || order.order_number} à "${getStatusLabel(
        newStatus
      )}" ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Confirmer',
          onPress: async () => {
            try {
              setSaving(true);
              await dispatch(
                updateOrderStatus({
                  orderId: order.id,
                  status: newStatus,
                  notes: `Statut changé vers "${getStatusLabel(newStatus)}" par l'admin`,
                })
              ).unwrap();
              setShowStatusModal(false);
              Alert.alert('Succès', 'Statut mis à jour avec succès');
            } catch (err) {
              console.error('OrderDetail update error:', err);
              Alert.alert('Erreur', `Impossible de mettre à jour le statut`);
            } finally {
              setSaving(false);
            }
          },
        },
      ]
    );
  };

  const handleContactCustomer = (method) => {
    const phone = customerPhone;
    const email = customerEmail;
    const orderNumber = order.orderNumber || order.order_number;

    const actions = {
      call: () => {
        if (phone) {
          openPhoneCall(phone);
        } else {
          Alert.alert('Contact non disponible', 'Le numéro de téléphone du client n\'est pas disponible.');
        }
      },
      whatsapp: () => {
        if (phone) {
          openWhatsApp(phone, `Bonjour, concernant votre commande ${orderNumber}`);
        } else {
          Alert.alert('Contact non disponible', 'Le numéro de téléphone du client n\'est pas disponible.');
        }
      },
      email: () => {
        if (email) {
          openEmail(email, `Commande ${orderNumber}`, `Bonjour,\n\nConcernant votre commande ${orderNumber}...`);
        } else {
          Alert.alert('Contact non disponible', 'L\'adresse email du client n\'est pas disponible.');
        }
      },
    };

    if (actions[method]) {
      actions[method]();
    } else {
      Alert.alert('Erreur', 'Méthode de contact non reconnue.');
    }
  };

  /* ====== UI réutilisable ====== */
  const Card = ({ children, style }) => (
    <View style={[styles.card, style]}>{children}</View>
  );

  const SectionTitle = ({ children }) => (
    <View style={{ marginBottom: 10 }}>
      <Text style={styles.sectionTitle}>{children}</Text>
      <View style={styles.hairline} />
    </View>
  );

  const Pill = ({ color, text }) => (
    <View style={[styles.pill, { backgroundColor: `${color}20`, borderColor: color }]}>
      <Text style={[styles.pillText, { color }]}>{text}</Text>
    </View>
  );

  const GhostButton = ({ icon, children, onPress, style, textStyle }) => (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.9}
      style={[styles.ghostBtn, style]}
    >
      {icon}
      <Text style={[styles.ghostBtnText, textStyle]}>{children}</Text>
    </TouchableOpacity>
  );

  const SolidButton = ({ icon, children, onPress, style, textStyle }) => (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.9}
      style={[styles.solidBtn, style]}
    >
      {icon}
      <Text style={[styles.solidBtnText, textStyle]}>{children}</Text>
    </TouchableOpacity>
  );

  /* ====== Render ====== */
  return (
    <SafeAreaWrapper>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={22} color={COLORS.ink} />
        </TouchableOpacity>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={styles.headerTitle}>Détails de la commande</Text>
          <Text style={styles.headerSubtitle}>
            #{order.orderNumber || order.order_number}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.iconBtn, { borderColor: COLORS.accent, borderWidth: 1 }]}
          onPress={() => setShowStatusModal(true)}
        >
          <Ionicons name="pencil" size={18} color={COLORS.accent} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Statut */}
        <Card>
          <SectionTitle>Statut de la commande</SectionTitle>

          <View style={styles.rowCenter}>
            <View style={[styles.statusIcon, { backgroundColor: `${getStatusColor(order.status)}20` }]}>
              <Ionicons name="checkmark-circle" size={26} color={getStatusColor(order.status)} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.statusTitle}>{getStatusLabel(order.status)}</Text>
              <Text style={styles.statusSubtitle}>
                Passée le {formatDate(order.date || order.created_at)}
              </Text>
            </View>
            <Pill color={getStatusColor(order.status)} text={getStatusLabel(order.status)} />
          </View>

          {(order.estimatedDelivery || order.estimated_delivery) && (
            <View style={[styles.rowStart, { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: COLORS.border }]}>
              <Ionicons name="time-outline" size={16} color={COLORS.muted} />
              <Text style={[styles.muted, { marginLeft: 8 }]}>
                Livraison estimée : {formatDate(order.estimatedDelivery || order.estimated_delivery)}
              </Text>
            </View>
          )}
        </Card>

        {/* Client */}
        <Card>
          <SectionTitle>Informations client</SectionTitle>

          <View style={styles.kvRow}>
            <Text style={styles.kvKey}>Nom</Text>
            <Text style={styles.kvVal}>{customerName}</Text>
          </View>
          <View style={styles.kvRow}>
            <Text style={styles.kvKey}>Téléphone</Text>
            <Text style={[styles.kvVal, styles.linkVal]}>{customerPhone || 'Non renseigné'}</Text>
          </View>
          {!!customerEmail && (
            <View style={styles.kvRow}>
              <Text style={styles.kvKey}>Email</Text>
              <Text style={[styles.kvVal, styles.linkVal]}>{customerEmail}</Text>
            </View>
          )}
        </Card>

        {/* Articles */}
        <Card>
          <SectionTitle>Articles commandés</SectionTitle>

          <View style={{ gap: 10 }}>
            {(order.items || []).map((item, idx) => {
              const currency = item.product_currency || 'CDF';
              return (
                <View key={idx} style={styles.itemRow}>
                  {item.product_image ? (
                    <Image source={{ uri: item.product_image }} style={styles.itemImg} />
                  ) : (
                    <View style={styles.itemImgPlaceholder}>
                      <Ionicons name="image-outline" size={22} color={COLORS.muted} />
                    </View>
                  )}

                  <View style={{ flex: 1 }}>
                    <Text style={styles.itemName}>
                      {item.product_name || 'Produit'}
                    </Text>
                    {item.farm_name && (
                      <View style={styles.farmRow}>
                        <Ionicons name="leaf-outline" size={12} color={COLORS.accent} />
                        <Text style={styles.itemFarm}>{item.farm_name}</Text>
                      </View>
                    )}
                    <Text style={styles.itemMeta}>
                      {formatPrice(item.product_price || 0, currency)} × {item.quantity}
                    </Text>
                  </View>

                  <Text style={styles.itemTotal}>
                    {formatPrice(item.subtotal || 0, currency)}
                  </Text>
                </View>
              );
            })}
          </View>
        </Card>

        {/* Livraison */}
        <Card>
          <SectionTitle>Informations de livraison</SectionTitle>

          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={18} color={COLORS.accent} />
            <View style={{ marginLeft: 10, flex: 1 }}>
              <Text style={styles.infoKey}>Adresse</Text>
              <Text style={styles.infoVal}>
                {order.deliveryAddress || order.delivery_address}
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="call-outline" size={18} color={COLORS.accent} />
            <View style={{ marginLeft: 10, flex: 1 }}>
              <Text style={styles.infoKey}>Téléphone</Text>
              <Text style={styles.infoVal}>
                {order.phoneNumber || order.phone_number}
              </Text>
            </View>
          </View>

          {!!order.notes && (
            <View style={styles.infoRow}>
              <Ionicons name="document-text-outline" size={18} color={COLORS.accent} />
              <View style={{ marginLeft: 10, flex: 1 }}>
                <Text style={styles.infoKey}>Instructions</Text>
                <Text style={styles.infoVal}>{order.notes}</Text>
              </View>
            </View>
          )}
        </Card>

        {/* Résumé */}
        <Card>
          <SectionTitle>Résumé de la commande</SectionTitle>

          <View style={styles.sumRow}>
            <Text style={styles.sumKey}>Sous-total</Text>
            <Text style={styles.sumVal}>
              {Object.entries(order.totals || {})
                .map(([cur, amt]) => formatPrice(amt, cur))
                .join(' + ')}
            </Text>
          </View>

          <View style={styles.sumRow}>
            <Text style={styles.sumKey}>Frais de livraison</Text>
            <Text style={[styles.sumVal, deliveryFeeAmount === 0 && { color: COLORS.accent }]}>
              {deliveryFeeValue}
            </Text>
          </View>

          <View style={styles.hairline} />

          <View style={styles.sumRow}>
            <Text style={styles.sumTotalKey}>Total</Text>
            <Text style={styles.sumTotalVal}>
              {Object.entries(totalsWithDelivery)
                .map(([cur, amt]) => formatPrice(amt, cur))
                .join(' + ')}
            </Text>
          </View>

          <View style={[styles.rowStart, { marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: COLORS.border }]}>
            <Ionicons name="cash-outline" size={16} color={COLORS.accent} />
            <Text style={[styles.mutedStrong, { marginLeft: 8 }]}>
              Paiement à la livraison ({order.paymentMethod || order.payment_method || 'cash'})
            </Text>
          </View>
        </Card>

        {/* Facture */}
        <Card>
          <SectionTitle>Facture</SectionTitle>

          <View style={styles.invoiceSection}>
            <View style={styles.invoiceInfoRow}>
              <Ionicons name="receipt-outline" size={20} color={COLORS.accent} />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.invoiceTitle}>
                  Facture #{order.orderNumber || order.order_number}
                </Text>
                <Text style={styles.invoiceSubtitle}>
                  {formatDate(order.date || order.created_at)}
                </Text>
              </View>
            </View>

            <GhostButton
              onPress={() => setShowInvoiceModal(true)}
              icon={<Ionicons name="document-text-outline" size={18} color={COLORS.accent} />}
              style={{ marginTop: 10 }}
            >
              Voir / Télécharger la facture
            </GhostButton>
          </View>
        </Card>

        {/* Actions rapides */}
        <Card>
          <SectionTitle>Actions rapides</SectionTitle>

          <View style={styles.actions}>
            <View style={styles.actionsRow}>
            {customerPhone && (
              <GhostButton
                onPress={() => handleContactCustomer('call')}
                icon={<Ionicons name="call" size={18} color={COLORS.accent} />}
              >
                Appeler
              </GhostButton>
            )}

            {customerPhone && (
              <GhostButton
                onPress={() => handleContactCustomer('whatsapp')}
                icon={<Ionicons name="logo-whatsapp" size={18} color="#25D366" />}
              >
                WhatsApp
              </GhostButton>
            )}
            </View>
            <View style={styles.actionsRow}>

            {customerEmail && (
              <GhostButton
                onPress={() => handleContactCustomer('email')}
                icon={<Ionicons name="mail-outline" size={18} color={COLORS.accent} />}
              >
                Email
              </GhostButton>
            )}

            {!!getNextStatus() && (
              <SolidButton
                onPress={() => handleUpdateStatus(getNextStatus())}
                icon={<Ionicons name="arrow-forward" size={18} color="#FFFFFF" />}
                style={{ backgroundColor: COLORS.accent }}
              >
                {getStatusLabel(getNextStatus())}
              </SolidButton>
            )}
            </View>            
          </View>
        </Card>
      </ScrollView>

      {/* Modal de statut */}
      {showStatusModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Changer le statut</Text>
              <TouchableOpacity onPress={() => setShowStatusModal(false)} style={styles.modalClose}>
                <Ionicons name="close" size={22} color={COLORS.ink} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 320 }}>
              {getAvailableStatuses().map((s) => (
                <TouchableOpacity
                  key={s.id}
                  style={styles.statusLine}
                  onPress={() => handleUpdateStatus(s.id)}
                >
                  <Ionicons name={s.icon} size={20} color={COLORS.accent} />
                  <Text style={styles.statusLineText}>{s.label}</Text>
                  <Pill color={s.color} text={s.label} />
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity
              onPress={() => setShowStatusModal(false)}
              style={styles.modalCancel}
              activeOpacity={0.9}
            >
              <Text style={styles.modalCancelText}>Fermer</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Overlay sauvegarde */}
      {saving && (
        <View style={styles.overlay}>
          <View style={styles.overlayCard}>
            <ActivityIndicator size="large" color={COLORS.ink} />
            <Text style={styles.overlayText}>Mise à jour…</Text>
          </View>
        </View>
      )}

      {/* Modal Facture */}
      <InvoiceModal
        visible={showInvoiceModal}
        order={order}
        onClose={() => setShowInvoiceModal(false)}
      />
    </SafeAreaWrapper>
  );
}

/* === Styles === */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },

  /* Header */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.card,
  },
  iconBtn: {
    padding: 8,
    borderRadius: 10,
    backgroundColor: 'rgba(40,49,6,0.06)',
  },
  headerTitle: {
    color: COLORS.ink,
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  headerSubtitle: { color: COLORS.muted, fontSize: 12, marginTop: 2 },

  /* Card */
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  sectionTitle: {
    color: COLORS.ink,
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.2,
    marginBottom: 8,
  },
  hairline: { height: 1, backgroundColor: COLORS.border, opacity: 0.9 },

  rowCenter: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rowStart: { flexDirection: 'row', alignItems: 'center' },

  /* Statut */
  statusIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 2,
  },
  statusTitle: { color: COLORS.ink, fontWeight: '800', fontSize: 16 },
  statusSubtitle: { color: COLORS.muted, marginTop: 2 },

  pill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  pillText: { fontWeight: '800', fontSize: 12 },

  /* Key/Value lignes client */
  kvRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  kvKey: { color: COLORS.muted, fontWeight: '700' },
  kvVal: { color: COLORS.ink, maxWidth: '60%', textAlign: 'right' },
  linkVal: { color: COLORS.accent, textDecorationLine: 'underline' },

  /* Items */
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    padding: 12,
  },
  itemImg: { width: 56, height: 56, borderRadius: 10, backgroundColor: '#FAFAFA' },
  itemImgPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FAFAFA',
  },
  itemName: { color: COLORS.ink, fontWeight: '700' },
  farmRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
    marginBottom: 2,
  },
  itemFarm: { 
    color: COLORS.accent, 
    fontSize: 12, 
    fontWeight: '600' 
  },
  itemMeta: { color: COLORS.muted, marginTop: 2, fontSize: 12 },
  itemTotal: { color: COLORS.accent, fontWeight: '800' },

  /* Livraison bloc */
  infoRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  infoKey: { color: COLORS.ink, fontWeight: '800' },
  infoVal: { color: COLORS.muted, marginTop: 2, lineHeight: 20 },

  /* Résumé */
  sumRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  sumKey: { color: COLORS.muted },
  sumVal: { color: COLORS.ink, fontWeight: '700' },
  sumTotalKey: { color: COLORS.ink, fontWeight: '900', fontSize: 16 },
  sumTotalVal: { color: COLORS.accent, fontWeight: '900', fontSize: 16 },
  muted: { color: COLORS.muted },
  mutedStrong: { color: COLORS.accent, fontWeight: '800' },

  /* Actions */
  actionsRow: { flexDirection: 'row', gap: 10, marginTop: 4 },
  ghostBtn: {
    flex: 1,
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: '#F7F7F7',
  },
  ghostBtnText: { color: COLORS.accent, fontWeight: '800' },
  solidBtn: {
    flex: 1,
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: COLORS.ink,
  },
  solidBtnText: { color: '#FFFFFF', fontWeight: '900' },

  /* Modal */
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCard: {
    width: '88%',
    maxHeight: '75%',
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: { flex: 1, color: COLORS.ink, fontWeight: '900', fontSize: 16 },
  modalClose: { padding: 6, borderRadius: 10, backgroundColor: 'rgba(40,49,6,0.06)' },
  statusLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.border,
  },
  statusLineText: { color: COLORS.ink, fontWeight: '700', flex: 1 },
  modalCancel: {
    marginTop: 10,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  modalCancelText: { color: COLORS.ink, fontWeight: '800' },

  /* Overlay save */
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlayCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 22,
    minWidth: 220,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  overlayText: { marginTop: 10, color: COLORS.ink, fontWeight: '800' },
  
  /* Facture */
  invoiceSection: {
    marginTop: 4,
  },
  invoiceInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  invoiceTitle: {
    color: COLORS.ink,
    fontWeight: '800',
    fontSize: 15,
  },
  invoiceSubtitle: {
    color: COLORS.muted,
    fontSize: 12,
    marginTop: 2,
  },
});
