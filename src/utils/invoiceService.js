/**
 * Service de génération de factures PDF responsive
 * Optimisé pour mobile et desktop
 */

import { formatPrice } from './currency';
import { CONTACT_INFO } from './contactInfo';

/**
 * Génère le HTML d'une facture responsive
 * @param {Object} order - La commande
 * @param {string|null} logoUri - URI du logo (optionnel)
 */
export const generateInvoiceHTML = (order, logoUri = null) => {
  const orderNumber = order.order_number || order.orderNumber || 'N/A';
  const orderDate = order.date || order.created_at || new Date().toISOString();
  const formattedDate = new Date(orderDate).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  // Informations client
  const customerFirstName = order.customer_first_name || order.customerFirstName || order.profiles?.first_name || '';
  const customerLastName = order.customer_last_name || order.customerLastName || order.profiles?.last_name || '';
  const customerEmail = order.customer_email || order.customerEmail || order.profiles?.email || '';
  const customerPhone = order.phone_number || order.phoneNumber || '';
  const customerName = [customerFirstName, customerLastName].filter(Boolean).join(' ') || customerEmail || 'Client';

  // Calculs financiers
  const subtotals = order.totals || {};
  const deliveryFeeAmount = order.delivery_fee_amount || order.deliveryFeeAmount || 0;
  const deliveryFeeCurrency = order.delivery_fee_currency || order.deliveryFeeCurrency || 'CDF';
  
  const totalsWithDelivery = { ...subtotals };
  if (deliveryFeeAmount > 0) {
    totalsWithDelivery[deliveryFeeCurrency] = (totalsWithDelivery[deliveryFeeCurrency] || 0) + deliveryFeeAmount;
  }

  const items = order.items || [];

  const html = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Facture ${orderNumber}</title>
  <style>
    /* Reset mobile-first */
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      font-size: 14px;
      line-height: 1.5;
      color: #333;
      background: #f5f5f5;
      padding: 0;
      margin: 0;
      -webkit-text-size-adjust: 100%;
      min-height: 100vh;
    }
    
    .invoice-container {
      max-width: 1200px;
      width: 100%;
      margin: 0 auto;
      background: #fff;
      padding: 24px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
    
    /* Header responsive */
    .header {
      display: flex;
      flex-direction: column;
      gap: 20px;
      margin-bottom: 24px;
      padding-bottom: 20px;
      border-bottom: 2px solid #10B981;
    }
    
    .company-info {
      order: 1;
      display: flex;
      align-items: flex-start;
      gap: 16px;
    }
    
    .company-logo {
      width: 80px;
      height: 80px;
      object-fit: contain;
      border-radius: 8px;
      flex-shrink: 0;
    }
    
    .company-text {
      flex: 1;
    }
    
    .company-name {
      font-size: 20px;
      font-weight: 700;
      color: #111827;
      margin-bottom: 4px;
    }
    
    .company-tagline {
      font-size: 14px;
      color: #6B7280;
      margin-bottom: 12px;
    }
    
    .company-details {
      font-size: 12px;
      color: #6B7280;
      line-height: 1.6;
    }
    
    .company-details div {
      margin-bottom: 4px;
    }
    
    .invoice-meta {
      order: 0;
      text-align: left;
    }
    
    .invoice-title {
      font-size: 24px;
      font-weight: 700;
      color: #10B981;
      margin-bottom: 8px;
    }
    
    .invoice-number {
      font-size: 14px;
      color: #6B7280;
      margin-bottom: 4px;
    }
    
    .invoice-date {
      font-size: 14px;
      color: #6B7280;
    }
    
    /* Status badge */
    .status-badge {
      display: inline-block;
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      margin-top: 8px;
    }
    
    .status-pending { background: #FEF3C7; color: #D97706; }
    .status-confirmed { background: #DBEAFE; color: #1D4ED8; }
    .status-preparing { background: #F3E8FF; color: #7C3AED; }
    .status-shipped { background: #FCE7F3; color: #BE185D; }
    .status-delivered { background: #D1FAE5; color: #065F46; }
    .status-cancelled { background: #FEE2E2; color: #DC2626; }
    
    /* Sections */
    .section {
      margin-bottom: 24px;
    }
    
    .section-title {
      font-size: 16px;
      font-weight: 600;
      color: #111827;
      margin-bottom: 12px;
      padding-bottom: 8px;
      border-bottom: 1px solid #E5E7EB;
    }
    
    /* Cartes d'information */
    .info-card {
      background: #F9FAFB;
      padding: 16px;
      border-radius: 8px;
      border-left: 4px solid #10B981;
      margin-bottom: 12px;
    }
    
    .info-row {
      display: flex;
      flex-direction: column;
      margin-bottom: 8px;
    }
    
    .info-label {
      font-weight: 600;
      color: #6B7280;
      font-size: 12px;
      margin-bottom: 2px;
    }
    
    .info-value {
      color: #111827;
      font-size: 14px;
    }
    
    /* Tableau responsive */
    .table-container {
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
      margin-bottom: 16px;
      border-radius: 8px;
      border: 1px solid #E5E7EB;
      width: 100%;
      max-width: 100%;
    }
    
    .items-table {
      width: 100%;
      min-width: 800px;
      border-collapse: collapse;
      font-size: 13px;
      table-layout: auto;
    }
    
    .items-table thead {
      background: #10B981;
      color: #fff;
    }
    
    .items-table th {
      padding: 14px 12px;
      text-align: left;
      font-weight: 600;
      font-size: 13px;
      white-space: nowrap;
    }
    
    .items-table td {
      padding: 14px 12px;
      border-bottom: 1px solid #E5E7EB;
      word-wrap: break-word;
      vertical-align: top;
    }
    
    /* Images produits */
    .product-image {
      width: 50px;
      height: 50px;
      object-fit: cover;
      border-radius: 6px;
      border: 1px solid #E5E7EB;
      background: #F9FAFB;
    }
    
    .product-image-mobile {
      width: 60px;
      height: 60px;
      object-fit: cover;
      border-radius: 8px;
      border: 1px solid #E5E7EB;
      background: #F9FAFB;
      margin-bottom: 8px;
    }
    
    .product-image-placeholder {
      width: 50px;
      height: 50px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #F3F4F6;
      border-radius: 6px;
      border: 1px solid #E5E7EB;
      color: #9CA3AF;
      font-size: 20px;
    }
    
    .product-image-placeholder-mobile {
      width: 60px;
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #F3F4F6;
      border-radius: 8px;
      border: 1px solid #E5E7EB;
      color: #9CA3AF;
      font-size: 24px;
    }
    
    .product-cell {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    
    .product-info {
      flex: 1;
    }
    
    .items-table tbody tr:last-child td {
      border-bottom: none;
    }
    
    .text-right {
      text-align: right;
    }
    
    .text-center {
      text-align: center;
    }
    
    /* Version mobile des items */
    .mobile-items {
      display: none;
    }
    
    /* Force l'affichage du tableau par défaut (pour PDF) */
    .desktop-only {
      display: block;
    }
    
    @media (max-width: 767px) {
      .desktop-only {
        display: none !important;
      }
    }
    
    .mobile-item {
      background: #F9FAFB;
      padding: 16px;
      border-radius: 8px;
      margin-bottom: 12px;
      border-left: 4px solid #10B981;
    }
    
    .item-header {
      display: flex;
      justify-content: between;
      align-items: start;
      margin-bottom: 8px;
    }
    
    .item-name {
      font-weight: 600;
      color: #111827;
      flex: 1;
    }
    
    .item-price {
      font-weight: 600;
      color: #10B981;
    }
    
    .item-details {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
      font-size: 12px;
      color: #6B7280;
    }
    
    /* Totaux */
    .totals-section {
      background: #F9FAFB;
      padding: 16px;
      border-radius: 8px;
      margin-top: 16px;
    }
    
    .total-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      font-size: 14px;
    }
    
    .total-row.subtotal {
      color: #6B7280;
    }
    
    .total-row.delivery {
      color: #6B7280;
      border-bottom: 1px solid #E5E7EB;
      padding-bottom: 12px;
    }
    
    .total-row.final {
      font-size: 16px;
      font-weight: 700;
      color: #111827;
      padding-top: 12px;
      border-top: 2px solid #10B981;
    }
    
    /* Informations supplémentaires */
    .additional-info {
      background: #F0F9FF;
      padding: 16px;
      border-radius: 8px;
      margin-top: 20px;
      border-left: 4px solid #0EA5E9;
    }
    
    .info-item {
      margin-bottom: 12px;
    }
    
    .info-item:last-child {
      margin-bottom: 0;
    }
    
    .info-item strong {
      color: #0C4A6E;
      display: block;
      margin-bottom: 4px;
      font-size: 14px;
    }
    
    /* Pied de page */
    .footer {
      margin-top: 32px;
      padding-top: 20px;
      border-top: 1px solid #E5E7EB;
      text-align: center;
      font-size: 12px;
      color: #6B7280;
      line-height: 1.6;
    }
    
    .legal-mentions {
      margin-top: 12px;
      font-style: italic;
      font-size: 11px;
    }
    
    /* Media Queries pour tablette */
    @media (min-width: 768px) {
      .invoice-container {
        padding: 32px;
      }
      
      body {
        padding: 20px;
      }
      
      .header {
        flex-direction: row;
        justify-content: space-between;
        align-items: flex-start;
      }
      
      .company-info {
        order: 0;
        flex: 1;
      }
      
      .invoice-meta {
        order: 1;
        text-align: right;
      }
      
      .customer-section {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 24px;
      }
      
      .info-row {
        flex-direction: row;
        align-items: center;
      }
      
      .info-label {
        min-width: 120px;
        margin-bottom: 0;
        font-size: 14px;
      }
      
      .info-value {
        font-size: 14px;
      }
      
      .desktop-only {
        display: block;
      }
      
      .mobile-only {
        display: none;
      }
      
      .items-table {
        min-width: 100%;
      }
    }
    
    /* Media Queries pour desktop */
    @media (min-width: 1024px) {
      .invoice-container {
        padding: 40px;
        margin: 20px auto;
      }
      
      body {
        padding: 30px;
      }
      
      .items-table {
        font-size: 14px;
      }
      
      .items-table th,
      .items-table td {
        padding: 16px 14px;
      }
    }
    
    /* Media Queries pour très grands écrans */
    @media (min-width: 1400px) {
      .invoice-container {
        padding: 50px;
      }
    }
    
    /* Media Queries pour mobile */
    @media (max-width: 767px) {
      body {
        padding: 12px;
      }
      
      .invoice-container {
        padding: 16px;
        box-shadow: none;
      }
      
      .desktop-only {
        display: none !important;
      }
      
      .mobile-only {
        display: block;
      }
      
      .items-table {
        display: none;
      }
      
      .mobile-items {
        display: block;
      }
      
      .company-details div {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      
      .header {
        gap: 16px;
      }
      
      .company-logo {
        width: 60px;
        height: 60px;
      }
    }
    
    /* Optimisations pour l'impression */
    @media print {
      body {
        padding: 0;
        margin: 0;
        font-size: 12px;
        background: #fff;
      }
      
      .invoice-container {
        max-width: 100%;
        margin: 0;
        padding: 20px;
        box-shadow: none;
      }
      
      /* Forcer l'affichage du tableau desktop dans le PDF */
      .desktop-only {
        display: block !important;
      }
      
      .mobile-only {
        display: none !important;
      }
      
      .mobile-items {
        display: none !important;
      }
      
      .items-table {
        display: table !important;
        min-width: 100%;
        font-size: 11px;
        width: 100%;
      }
      
      .table-container {
        overflow: visible !important;
        width: 100%;
      }
      
      .items-table th,
      .items-table td {
        padding: 8px 6px;
      }
      
      .status-badge {
        border: 1px solid currentColor;
      }
    }
    
    /* Améliorations tactile pour mobile */
    @media (hover: none) and (pointer: coarse) {
      .info-card, .mobile-item {
        padding: 20px 16px;
      }
      
      .items-table th,
      .items-table td {
        padding: 16px 12px;
      }
      
      .section-title {
        font-size: 18px;
      }
    }
    
    /* Support dark mode */
    @media (prefers-color-scheme: dark) {
      body {
        background: #111827;
        color: #F9FAFB;
      }
      
      .invoice-container {
        background: #111827;
      }
      
      .info-card, .totals-section, .mobile-item {
        background: #1F2937;
      }
      
      .info-value, .item-name {
        color: #F9FAFB;
      }
      
      .info-label {
        color: #D1D5DB;
      }
      
      .section-title {
        color: #F9FAFB;
        border-bottom-color: #374151;
      }
      
      .items-table {
        border-color: #374151;
      }
      
      .items-table td {
        border-bottom-color: #374151;
        color: #F9FAFB;
      }
    }
  </style>
</head>
<body>
  <div class="invoice-container">
    <!-- En-tête responsive -->
    <div class="header">
      <div class="company-info">
        ${logoUri ? `<img src="${logoUri}" alt="Dream Market Logo" class="company-logo" />` : ''}
        <div class="company-text">
          <div class="company-name">DREAM MARKET</div>
          <div class="company-tagline">Vos produits frais, livrés chez vous</div>
          <div class="company-details">
            <div>📍 ${CONTACT_INFO.address}</div>
            <div>📞 ${CONTACT_INFO.phone1Display}</div>
            <div>📱 ${CONTACT_INFO.phone2Display}</div>
            <div>✉️ ${CONTACT_INFO.email}</div>
            <div>🕑 ${CONTACT_INFO.hours}</div>
          </div>
        </div>
      </div>
      <div class="invoice-meta">
        <div class="invoice-title">FACTURE</div>
        <div class="invoice-number">N° ${orderNumber}</div>
        <div class="invoice-date">${formattedDate}</div>
        <div class="status-badge status-${order.status || 'pending'}">
          ${getStatusLabel(order.status || 'pending')}
        </div>
      </div>
    </div>

    <!-- Informations client -->
    <div class="section">
      <div class="section-title">Informations Client</div>
      <div class="customer-section">
        <div class="info-card">
          <div class="info-row">
            <div class="info-label">Nom complet:</div>
            <div class="info-value">${customerName}</div>
          </div>
          ${customerEmail ? `
          <div class="info-row">
            <div class="info-label">Email:</div>
            <div class="info-value">${customerEmail}</div>
          </div>
          ` : ''}
          ${customerPhone ? `
          <div class="info-row">
            <div class="info-label">Téléphone:</div>
            <div class="info-value">${customerPhone}</div>
          </div>
          ` : ''}
        </div>
        <div class="info-card">
          <div class="info-row">
            <div class="info-label">Adresse:</div>
            <div class="info-value">${order.delivery_address || order.deliveryAddress || 'Non spécifiée'}</div>
          </div>
          ${order.delivery_instructions ? `
          <div class="info-row">
            <div class="info-label">Instructions:</div>
            <div class="info-value">${order.delivery_instructions}</div>
          </div>
          ` : ''}
        </div>
      </div>
    </div>

    <!-- Articles - Version Desktop -->
    <div class="section desktop-only" style="display: block;">
      <div class="section-title">Détail des Articles</div>
      <div class="table-container" style="overflow-x: visible;">
        <table class="items-table" style="display: table; width: 100%;">
          <thead>
            <tr>
              <th style="width: 5%;">#</th>
              <th style="width: 10%;">Image</th>
              <th style="width: 30%;">Produit</th>
              <th style="width: 15%;" class="text-center">Ferme</th>
              <th style="width: 10%;" class="text-center">Qté</th>
              <th style="width: 15%;" class="text-right">Prix unit.</th>
              <th style="width: 15%;" class="text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            ${items.map((item, index) => {
              const productImage = item.product_image || item.image || item.product?.image || item.product?.images?.[0];
              return `
              <tr>
                <td>${index + 1}</td>
                <td>
                  ${productImage 
                    ? `<img src="${productImage}" alt="${item.product_name || 'Produit'}" class="product-image" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" />
                       <div class="product-image-placeholder" style="display: none;">📦</div>`
                    : `<div class="product-image-placeholder">📦</div>`
                  }
                </td>
                <td>
                  <div class="product-cell">
                    <div class="product-info">
                      <strong>${item.product_name || 'Produit'}</strong>
                      ${item.product_description ? `<br><small style="color: #6B7280;">${item.product_description}</small>` : ''}
                    </div>
                  </div>
                </td>
                <td class="text-center">${item.farm_name || '-'}</td>
                <td class="text-center">${item.quantity || 0}</td>
                <td class="text-right">${formatPrice(item.product_price || 0, item.product_currency || 'CDF')}</td>
                <td class="text-right"><strong>${formatPrice(item.subtotal || 0, item.product_currency || 'CDF')}</strong></td>
              </tr>
            `;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>

    <!-- Articles - Version Mobile -->
    <div class="section mobile-only">
      <div class="section-title">Articles (${items.length})</div>
      <div class="mobile-items">
        ${items.map((item, index) => {
          const productImage = item.product_image || item.image || item.product?.image || item.product?.images?.[0];
          return `
          <div class="mobile-item">
            ${productImage 
              ? `<img src="${productImage}" alt="${item.product_name || 'Produit'}" class="product-image-mobile" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" />
                 <div class="product-image-placeholder-mobile" style="display: none;">📦</div>`
              : `<div class="product-image-placeholder-mobile">📦</div>`
            }
            <div class="item-header">
              <div class="item-name">${item.product_name || 'Produit'}</div>
              <div class="item-price">${formatPrice(item.subtotal || 0, item.product_currency || 'CDF')}</div>
            </div>
            <div class="item-details">
              <div>
                <small>Ferme: ${item.farm_name || '-'}</small>
              </div>
              <div>
                <small>Quantité: ${item.quantity || 0}</small>
              </div>
              <div>
                <small>Prix unit.: ${formatPrice(item.product_price || 0, item.product_currency || 'CDF')}</small>
              </div>
              <div>
                <small>Total: ${formatPrice(item.subtotal || 0, item.product_currency || 'CDF')}</small>
              </div>
            </div>
            ${item.product_description ? `
            <div style="margin-top: 8px;">
              <small style="color: #6B7280;">${item.product_description}</small>
            </div>
            ` : ''}
          </div>
        `;
        }).join('')}
      </div>
    </div>

    <!-- Totaux -->
    <div class="section">
      <div class="section-title">Récapitulatif</div>
      <div class="totals-section">
        ${Object.entries(subtotals).map(([currency, amount]) => `
          <div class="total-row subtotal">
            <span>Sous-total (${currency})</span>
            <span>${formatPrice(amount, currency)}</span>
          </div>
        `).join('')}
        
        <div class="total-row delivery">
          <span>Frais de livraison</span>
          <span>${deliveryFeeAmount > 0 ? formatPrice(deliveryFeeAmount, deliveryFeeCurrency) : 'Gratuit'}</span>
        </div>
        
        ${Object.entries(totalsWithDelivery).map(([currency, amount]) => `
          <div class="total-row final">
            <span>Total à payer (${currency})</span>
            <span>${formatPrice(amount, currency)}</span>
          </div>
        `).join('')}
      </div>
    </div>

    <!-- Informations complémentaires -->
    <div class="additional-info">
      <div class="info-item">
        <strong>Mode de paiement</strong>
        ${getPaymentMethodLabel(order.payment_method || order.paymentMethod || 'cash')}
      </div>
      
      ${order.estimated_delivery || order.estimatedDelivery ? `
      <div class="info-item">
        <strong>Livraison estimée</strong>
        ${new Date(order.estimated_delivery || order.estimatedDelivery).toLocaleDateString('fr-FR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })}
      </div>
      ` : ''}
      
      ${order.notes ? `
      <div class="info-item">
        <strong>Notes</strong>
        ${order.notes}
      </div>
      ` : ''}
    </div>

    <!-- Pied de page -->
    <div class="footer">
      <p>Merci pour votre confiance !</p>
      <p>Pour toute question, contactez-nous :</p>
      <p>${CONTACT_INFO.phone1Display} | ${CONTACT_INFO.email}</p>
      <div class="legal-mentions">
        Facture générée automatiquement - Dream Market © ${new Date().getFullYear()}
      </div>
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
    card: 'Carte bancaire',
    transfer: 'Virement bancaire'
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