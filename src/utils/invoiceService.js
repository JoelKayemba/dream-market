/**
 * Service de génération de factures
 * Génère des factures au format HTML qui peuvent être converties en PDF
 */

import { formatPrice } from './currency';
import { CONTACT_INFO } from './contactInfo';

/**
 * Génère le HTML d'une facture à partir d'une commande
 * @param {object} order - La commande
 * @returns {string} - Le HTML de la facture
 */
export const generateInvoiceHTML = (order) => {
  const orderNumber = order.order_number || order.orderNumber || 'N/A';
  const orderDate = order.date || order.created_at || new Date().toISOString();
  const formattedDate = new Date(orderDate).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  // Informations client
  const customerFirstName = order.customer_first_name || order.customerFirstName || order.profiles?.first_name || '';
  const customerLastName = order.customer_last_name || order.customerLastName || order.profiles?.last_name || '';
  const customerEmail = order.customer_email || order.customerEmail || order.profiles?.email || '';
  const customerPhone = order.phone_number || order.phoneNumber || '';
  const customerName = [customerFirstName, customerLastName].filter(Boolean).join(' ') || customerEmail || 'Client';

  // Totaux
  const subtotals = order.totals || {};
  const deliveryFeeAmount = order.delivery_fee_amount || order.deliveryFeeAmount || 0;
  const deliveryFeeCurrency = order.delivery_fee_currency || order.deliveryFeeCurrency || 'CDF';
  
  // Calculer les totaux avec livraison
  const totalsWithDelivery = { ...subtotals };
  if (deliveryFeeAmount > 0) {
    totalsWithDelivery[deliveryFeeCurrency] = (totalsWithDelivery[deliveryFeeCurrency] || 0) + deliveryFeeAmount;
  }

  // Items de la commande
  const items = order.items || [];

  // Générer le HTML
  const html = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Facture ${orderNumber}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      font-size: 12px;
      line-height: 1.6;
      color: #333;
      background: #fff;
      padding: 20px;
    }
    .invoice-container {
      max-width: 800px;
      margin: 0 auto;
      background: #fff;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 3px solid #2F8F46;
    }
    .company-info {
      flex: 1;
    }
    .company-name {
      font-size: 24px;
      font-weight: bold;
      color: #2F8F46;
      margin-bottom: 8px;
    }
    .company-details {
      font-size: 11px;
      color: #666;
      line-height: 1.8;
    }
    .invoice-info {
      text-align: right;
    }
    .invoice-title {
      font-size: 32px;
      font-weight: bold;
      color: #283106;
      margin-bottom: 10px;
    }
    .invoice-number {
      font-size: 14px;
      color: #666;
      margin-bottom: 5px;
    }
    .invoice-date {
      font-size: 12px;
      color: #666;
    }
    .section {
      margin-bottom: 25px;
    }
    .section-title {
      font-size: 14px;
      font-weight: bold;
      color: #283106;
      margin-bottom: 10px;
      padding-bottom: 5px;
      border-bottom: 1px solid #E0E0E0;
    }
    .two-columns {
      display: flex;
      gap: 30px;
      margin-bottom: 20px;
    }
    .column {
      flex: 1;
    }
    .info-row {
      margin-bottom: 8px;
      font-size: 11px;
    }
    .info-label {
      font-weight: bold;
      color: #666;
      margin-bottom: 3px;
    }
    .info-value {
      color: #333;
    }
    .items-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
    }
    .items-table thead {
      background: #2F8F46;
      color: #fff;
    }
    .items-table th {
      padding: 12px 8px;
      text-align: left;
      font-size: 11px;
      font-weight: bold;
    }
    .items-table td {
      padding: 10px 8px;
      border-bottom: 1px solid #E0E0E0;
      font-size: 11px;
    }
    .items-table tbody tr:hover {
      background: #F9F9F9;
    }
    .text-right {
      text-align: right;
    }
    .text-center {
      text-align: center;
    }
    .totals-section {
      margin-top: 20px;
      margin-left: auto;
      width: 300px;
    }
    .total-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      font-size: 12px;
    }
    .total-row.subtotal {
      color: #666;
    }
    .total-row.delivery {
      color: #666;
      border-bottom: 1px solid #E0E0E0;
      padding-bottom: 12px;
      margin-bottom: 8px;
    }
    .total-row.final {
      font-size: 16px;
      font-weight: bold;
      color: #283106;
      padding-top: 12px;
      border-top: 2px solid #2F8F46;
    }
    .payment-info {
      margin-top: 30px;
      padding: 15px;
      background: #F8F9FA;
      border-left: 4px solid #2F8F46;
      font-size: 11px;
    }
    .payment-info strong {
      color: #2F8F46;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #E0E0E0;
      text-align: center;
      font-size: 10px;
      color: #999;
    }
    .status-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 10px;
      font-weight: bold;
      margin-top: 5px;
    }
    .status-pending { background: #FFF3E0; color: #FF9800; }
    .status-confirmed { background: #E3F2FD; color: #2196F3; }
    .status-preparing { background: #F3E5F5; color: #9C27B0; }
    .status-shipped { background: #FFEBEE; color: #FF5722; }
    .status-delivered { background: #E8F5E9; color: #4CAF50; }
    .status-cancelled { background: #FFEBEE; color: #F44336; }
    @media print {
      body {
        padding: 0;
        margin: 0;
      }
      .invoice-container {
        max-width: 100%;
        margin: 0;
      }
      .header {
        page-break-inside: avoid;
      }
      .items-table {
        page-break-inside: avoid;
      }
      .totals-section {
        page-break-inside: avoid;
      }
    }
    @page {
      margin: 20mm;
      size: A4;
    }
  </style>
</head>
<body>
  <div class="invoice-container">
    <!-- En-tête -->
    <div class="header">
      <div class="company-info">
        <div class="company-name">DREAM MARKET</div>
        <div class="company-details">
          ${CONTACT_INFO.address}<br>
          📞 ${CONTACT_INFO.phone1Display} - ${CONTACT_INFO.phone2Display}<br>
          ✉️ ${CONTACT_INFO.email}<br>
          🕑 ${CONTACT_INFO.hours}
        </div>
      </div>
      <div class="invoice-info">
        <div class="invoice-title">FACTURE</div>
        <div class="invoice-number">N° ${orderNumber}</div>
        <div class="invoice-date">Date: ${formattedDate}</div>
        <div class="status-badge status-${order.status || 'pending'}">
          ${getStatusLabel(order.status || 'pending')}
        </div>
      </div>
    </div>

    <!-- Informations client -->
    <div class="section">
      <div class="section-title">INFORMATIONS CLIENT</div>
      <div class="two-columns">
        <div class="column">
          <div class="info-row">
            <div class="info-label">Nom complet</div>
            <div class="info-value">${customerName}</div>
          </div>
          ${customerEmail ? `
          <div class="info-row">
            <div class="info-label">Email</div>
            <div class="info-value">${customerEmail}</div>
          </div>
          ` : ''}
        </div>
        <div class="column">
          ${customerPhone ? `
          <div class="info-row">
            <div class="info-label">Téléphone</div>
            <div class="info-value">${customerPhone}</div>
          </div>
          ` : ''}
          <div class="info-row">
            <div class="info-label">Adresse de livraison</div>
            <div class="info-value">${order.delivery_address || order.deliveryAddress || 'Non renseignée'}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Articles -->
    <div class="section">
      <div class="section-title">DÉTAIL DES ARTICLES</div>
      <table class="items-table">
        <thead>
          <tr>
            <th style="width: 5%;">#</th>
            <th style="width: 40%;">Produit</th>
            <th style="width: 15%;" class="text-center">Ferme</th>
            <th style="width: 10%;" class="text-center">Qté</th>
            <th style="width: 15%;" class="text-right">Prix unitaire</th>
            <th style="width: 15%;" class="text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          ${items.map((item, index) => `
            <tr>
              <td>${index + 1}</td>
              <td>
                <strong>${item.product_name || 'Produit'}</strong>
              </td>
              <td class="text-center">${item.farm_name || '-'}</td>
              <td class="text-center">${item.quantity || 0}</td>
              <td class="text-right">${formatPrice(item.product_price || 0, item.product_currency || 'CDF')}</td>
              <td class="text-right"><strong>${formatPrice(item.subtotal || 0, item.product_currency || 'CDF')}</strong></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>

    <!-- Totaux -->
    <div class="section">
      <div class="totals-section">
        ${Object.entries(subtotals).map(([currency, amount]) => `
          <div class="total-row subtotal">
            <span>Sous-total (${currency})</span>
            <span><strong>${formatPrice(amount, currency)}</strong></span>
          </div>
        `).join('')}
        <div class="total-row delivery">
          <span>Frais de livraison</span>
          <span>${deliveryFeeAmount > 0 ? formatPrice(deliveryFeeAmount, deliveryFeeCurrency) : 'Gratuit'}</span>
        </div>
        ${Object.entries(totalsWithDelivery).map(([currency, amount]) => `
          <div class="total-row final">
            <span>TOTAL (${currency})</span>
            <span>${formatPrice(amount, currency)}</span>
          </div>
        `).join('')}
      </div>
    </div>

    <!-- Informations de paiement -->
    <div class="payment-info">
      <strong>Mode de paiement:</strong> ${getPaymentMethodLabel(order.payment_method || order.paymentMethod || 'cash')}<br>
      ${order.notes ? `<strong>Notes:</strong> ${order.notes}<br>` : ''}
      ${order.estimated_delivery || order.estimatedDelivery ? `
        <strong>Livraison estimée:</strong> ${new Date(order.estimated_delivery || order.estimatedDelivery).toLocaleDateString('fr-FR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })}
      ` : ''}
    </div>

    <!-- Pied de page -->
    <div class="footer">
      <p>Merci de votre confiance !</p>
      <p>Cette facture a été générée automatiquement par Dream Market.</p>
      <p>Pour toute question, contactez-nous: ${CONTACT_INFO.phone1Display} | ${CONTACT_INFO.email}</p>
    </div>
  </div>
</body>
</html>
  `;

  return html;
};

/**
 * Obtient le libellé du statut
 */
const getStatusLabel = (status) => {
  const labels = {
    pending: 'En attente',
    confirmed: 'Confirmée',
    preparing: 'En préparation',
    shipped: 'Expédiée',
    delivered: 'Livrée',
    cancelled: 'Annulée'
  };
  return labels[status] || status;
};

/**
 * Obtient le libellé du mode de paiement
 */
const getPaymentMethodLabel = (method) => {
  const labels = {
    cash: 'Paiement à la livraison (Espèces)',
    mobile_money: 'Mobile Money',
    card: 'Carte bancaire'
  };
  return labels[method] || method;
};

/**
 * Génère le nom du fichier de facture
 */
export const getInvoiceFileName = (order, extension = 'pdf') => {
  const orderNumber = order.order_number || order.orderNumber || 'N/A';
  const date = new Date().toISOString().split('T')[0];
  return `Facture_${orderNumber}_${date}.${extension}`;
};

