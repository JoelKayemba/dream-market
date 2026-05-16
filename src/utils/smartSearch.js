/**
 * Recherche locale tolérante aux fautes de frappe (normalisation FR, sous-chaînes, Levenshtein, coefficient de Sørensen–Dice).
 */

const MIN_SCORE_SUGGESTION = 28;
const MIN_SCORE_RESULT = 18;

/** Texte comparable : minuscules + suppression des accents */
export function normalizeSearchText(str) {
  if (str == null || str === '') return '';
  return String(str)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function diceCoefficientBigrams(a, b) {
  if (!a.length || !b.length) return 0;
  if (a.length === 1 && b.length === 1) return a === b ? 1 : 0;
  const bigrams = new Map();
  for (let i = 0; i < a.length - 1; i++) {
    const bg = a.slice(i, i + 2);
    bigrams.set(bg, (bigrams.get(bg) || 0) + 1);
  }
  let matches = 0;
  for (let i = 0; i < b.length - 1; i++) {
    const bg = b.slice(i, i + 2);
    const count = bigrams.get(bg) || 0;
    if (count > 0) {
      matches++;
      bigrams.set(bg, count - 1);
    }
  }
  return (2 * matches) / (a.length + b.length - 2 + 1e-6);
}

function levenshteinDistance(a, b) {
  const m = Math.min(a.length, 48);
  const n = Math.min(b.length, 48);
  const aa = a.slice(0, m);
  const bb = b.slice(0, n);
  const dp = Array.from({ length: aa.length + 1 }, () => new Array(bb.length + 1).fill(0));
  for (let i = 0; i <= aa.length; i++) dp[i][0] = i;
  for (let j = 0; j <= bb.length; j++) dp[0][j] = j;
  for (let i = 1; i <= aa.length; i++) {
    for (let j = 1; j <= bb.length; j++) {
      const cost = aa[i - 1] === bb[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
    }
  }
  return dp[aa.length][bb.length];
}

/**
 * Score d'un token normalisé contre une phrase normalisée (0–120).
 */
export function scoreTokenAgainstHaystack(token, haystackNorm) {
  if (!token || !haystackNorm) return 0;
  if (haystackNorm.includes(token)) return 118;

  const words = haystackNorm.split(/[\s,.;:_'"|/\\-]+/).filter((w) => w.length > 0);
  let best = 0;

  for (const word of words) {
    if (word.includes(token)) {
      best = Math.max(best, 96);
      continue;
    }
    if (token.length >= 2 && word.startsWith(token.slice(0, Math.min(4, token.length)))) {
      best = Math.max(best, 82);
      continue;
    }

    const maxLen = Math.max(word.length, token.length);
    if (maxLen === 0) continue;

    const maxTypos =
      token.length <= 4 ? 2 : token.length <= 9 ? 3 : Math.min(4, Math.floor(token.length / 3));
    const dist = levenshteinDistance(token, word);
    if (dist <= maxTypos) {
      const sim = 1 - dist / maxLen;
      best = Math.max(best, 42 + sim * 52);
    }

    const dice = diceCoefficientBigrams(token, word);
    if (dice >= 0.55 && Math.abs(word.length - token.length) <= 4) {
      best = Math.max(best, 32 + dice * 58);
    }
  }

  return best;
}

function aggregateTokenScores(queryNorm, haystackNorm) {
  const tokens = queryNorm.split(/\s+/).filter((t) => t.length > 0);
  if (!tokens.length || !haystackNorm) return 0;
  let sum = 0;
  for (const token of tokens) {
    sum += scoreTokenAgainstHaystack(token, haystackNorm);
  }
  return sum / tokens.length;
}

function scoreWeightedFields(queryRaw, fieldDefs) {
  const q = normalizeSearchText(queryRaw);
  if (!q) return 0;
  let best = 0;
  for (const { text, weight } of fieldDefs) {
    const blob = normalizeSearchText(text || '');
    if (!blob) continue;
    const raw = aggregateTokenScores(q, blob);
    if (!raw) continue;
    best = Math.max(best, raw * weight);
  }
  return best;
}

export function scoreProductMatch(queryRaw, product) {
  const fields = [
    { text: product.name, weight: 1 },
    { text: product.categories?.name, weight: 0.62 },
    { text: product.farms?.name, weight: 0.55 },
    { text: product.short_description || product.description?.slice?.(0, 400), weight: 0.38 },
  ];
  if (Array.isArray(product.tags) && product.tags.length) {
    fields.push({ text: product.tags.join(' '), weight: 0.48 });
  }
  return scoreWeightedFields(queryRaw, fields);
}

export function scoreFarmMatch(queryRaw, farm) {
  const fields = [
    { text: farm.name, weight: 1 },
    { text: farm.specialty, weight: 0.55 },
    { text: farm.description?.slice?.(0, 400), weight: 0.4 },
    { text: farm.location || farm.city || farm.region, weight: 0.45 },
    { text: farm.story?.slice?.(0, 300), weight: 0.28 },
  ];
  if (Array.isArray(farm.certifications) && farm.certifications.length) {
    fields.push({ text: farm.certifications.join(' '), weight: 0.35 });
  }
  if (Array.isArray(farm.sustainable_practices) && farm.sustainable_practices.length) {
    fields.push({ text: farm.sustainable_practices.join(' '), weight: 0.28 });
  }
  return scoreWeightedFields(queryRaw, fields);
}

export function scoreServiceMatch(queryRaw, service) {
  const fields = [
    { text: service.name, weight: 1 },
    { text: service.category, weight: 0.58 },
    { text: service.short_description || service.description?.slice?.(0, 400), weight: 0.4 },
    { text: service.coverage, weight: 0.38 },
  ];
  if (Array.isArray(service.features) && service.features.length) {
    fields.push({ text: service.features.join(' '), weight: 0.42 });
  }
  return scoreWeightedFields(queryRaw, fields);
}

export function rankProductsForSearch(products, queryRaw, minScore = MIN_SCORE_RESULT) {
  const q = normalizeSearchText(queryRaw);
  if (!q || !products?.length) return [];
  return products
    .map((item) => ({ item, score: scoreProductMatch(queryRaw, item) }))
    .filter((x) => x.score >= minScore)
    .sort((a, b) => b.score - a.score)
    .map((x) => x.item);
}

export function rankFarmsForSearch(farms, queryRaw, minScore = MIN_SCORE_RESULT) {
  const q = normalizeSearchText(queryRaw);
  if (!q || !farms?.length) return [];
  return farms
    .map((item) => ({ item, score: scoreFarmMatch(queryRaw, item) }))
    .filter((x) => x.score >= minScore)
    .sort((a, b) => b.score - a.score)
    .map((x) => x.item);
}

export function rankServicesForSearch(services, queryRaw, minScore = MIN_SCORE_RESULT) {
  const q = normalizeSearchText(queryRaw);
  if (!q || !services?.length) return [];
  return services
    .map((item) => ({ item, score: scoreServiceMatch(queryRaw, item) }))
    .filter((x) => x.score >= minScore)
    .sort((a, b) => b.score - a.score)
    .map((x) => x.item);
}

/**
 * Suggestions fusionnées (produit prioritaire visuellement), limitées et triées par pertinence.
 */
export function buildRichSuggestions(queryRaw, products, farms, services, limit = 14) {
  const q = normalizeSearchText(queryRaw);
  if (!q || q.length < 1) return [];

  const scoredProducts = (products || [])
    .map((item) => ({ type: 'product', item, score: scoreProductMatch(queryRaw, item) }))
    .filter((x) => x.score >= MIN_SCORE_SUGGESTION);

  const scoredFarms = (farms || [])
    .map((item) => ({ type: 'farm', item, score: scoreFarmMatch(queryRaw, item) }))
    .filter((x) => x.score >= MIN_SCORE_SUGGESTION);

  const scoredServices = (services || [])
    .map((item) => ({ type: 'service', item, score: scoreServiceMatch(queryRaw, item) }))
    .filter((x) => x.score >= MIN_SCORE_SUGGESTION);

  const merged = [...scoredProducts, ...scoredFarms, ...scoredServices].sort((a, b) => b.score - a.score);

  const seen = new Set();
  const unique = [];
  for (const row of merged) {
    const key =
      row.type === 'product'
        ? `p-${row.item.id}`
        : row.type === 'farm'
          ? `f-${row.item.id}`
          : `s-${row.item.id}`;
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(row);
    if (unique.length >= limit) break;
  }

  return unique.map(({ type, item, score }) => {
    if (type === 'product') {
      return {
        id: `product-${item.id}`,
        type: 'product',
        text: item.name,
        data: item,
        score,
        subtitle: [item.categories?.name, item.farms?.name].filter(Boolean).join(' · '),
        imageUri: item.images?.[0] || item.image || null,
        price: item.price,
        oldPrice: item.old_price,
        currency: item.currency || 'CDF',
      };
    }
    if (type === 'farm') {
      return {
        id: `farm-${item.id}`,
        type: 'farm',
        text: item.name,
        data: item,
        score,
        subtitle: item.specialty || item.location || item.city || '',
        imageUri: item.main_image || item.image || null,
      };
    }
    return {
      id: `service-${item.id}`,
      type: 'service',
      text: item.name,
      data: item,
      score,
      subtitle: item.category || item.coverage || '',
      imageUri: item.image || null,
      price: item.price,
      currency: item.currency || 'CDF',
    };
  });
}
