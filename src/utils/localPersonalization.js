import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY_BASE = '@dream_market_local_personalization';
const MAX_EVENTS = 300;

const INTERACTION_WEIGHTS = {
  view: 4,
  farm_view: 6,
  search: 3,
  favorite: 22,
  cart_add: 16,
  purchase: 32,
};

const getStorageKey = (userId) => `${STORAGE_KEY_BASE}_${userId || 'guest'}`;

const nowIso = () => new Date().toISOString();

const normalizeId = (value) => {
  if (value == null || value === '') return null;
  return String(value);
};

const daysSince = (dateValue) => {
  const time = new Date(dateValue || 0).getTime();
  if (!Number.isFinite(time) || time <= 0) return 365;
  return Math.max(0, (Date.now() - time) / (1000 * 60 * 60 * 24));
};

const recencyMultiplier = (dateValue) => {
  const age = daysSince(dateValue);
  if (age <= 1) return 1;
  if (age <= 7) return 0.85;
  if (age <= 30) return 0.6;
  if (age <= 90) return 0.35;
  return 0.15;
};

const incrementBucket = (bucket, key, amount, at = nowIso()) => {
  if (!key) return;
  const id = normalizeId(key);
  const current = bucket[id] || { score: 0, count: 0, lastAt: at };
  bucket[id] = {
    score: Math.max(0, current.score + amount),
    count: current.count + 1,
    lastAt: at,
  };
};

const createEmptyProfile = () => ({
  version: 1,
  updatedAt: nowIso(),
  events: [],
  products: {},
  farms: {},
  categories: {},
  searches: {},
  displayedProducts: {},
  displayedFarms: {},
  displaySession: 0,
});

const sanitizeProfile = (profile) => ({
  ...createEmptyProfile(),
  ...(profile || {}),
  events: Array.isArray(profile?.events) ? profile.events.slice(-MAX_EVENTS) : [],
  products: profile?.products || {},
  farms: profile?.farms || {},
  categories: profile?.categories || {},
  searches: profile?.searches || {},
  displayedProducts: profile?.displayedProducts || {},
  displayedFarms: profile?.displayedFarms || {},
  displaySession: Number(profile?.displaySession) || 0,
});

const readProfile = async (userId) => {
  try {
    const raw = await AsyncStorage.getItem(getStorageKey(userId));
    return sanitizeProfile(raw ? JSON.parse(raw) : null);
  } catch (error) {
    console.warn('[localPersonalization] Lecture impossible:', error);
    return createEmptyProfile();
  }
};

const writeProfile = async (userId, profile) => {
  try {
    await AsyncStorage.setItem(getStorageKey(userId), JSON.stringify(sanitizeProfile(profile)));
  } catch (error) {
    console.warn('[localPersonalization] Sauvegarde impossible:', error);
  }
};

const stableRandom = (seed) => {
  let hash = 2166136261;
  const input = String(seed);
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  return (hash >>> 0) / 4294967295;
};

const bucketScore = (bucket, key) => {
  const row = bucket?.[normalizeId(key)];
  if (!row) return 0;
  return row.score * recencyMultiplier(row.lastAt);
};

const exposurePenalty = (bucket, key) => {
  const row = bucket?.[normalizeId(key)];
  if (!row) return 0;
  const recency = recencyMultiplier(row.lastAt);
  return Math.min(28, (row.count * 5 + row.score * 0.35) * recency);
};

const getCategoryId = (item) => normalizeId(item?.category_id || item?.categories?.id);
const getFarmIdFromProduct = (item) => normalizeId(item?.farm_id || item?.farms?.id);
const getItemId = (item) => normalizeId(item?.id);

const defaultProductSignal = (product) => {
  let score = 0;
  if (product?.is_popular) score += 8;
  if (product?.is_new) score += 7;
  if (product?.old_price && product.old_price > 0) score += 5;
  if ((Number(product?.stock) || 0) > 0) score += 4;
  if (product?.created_at) score += Math.max(0, 6 - daysSince(product.created_at) / 7);
  return score;
};

const defaultFarmSignal = (farm) => {
  let score = 0;
  if (farm?.verified) score += 10;
  if (Array.isArray(farm?.products)) score += Math.min(farm.products.length, 12);
  if (typeof farm?.productCount === 'number') score += Math.min(farm.productCount, 12);
  if (farm?.created_at) score += Math.max(0, 6 - daysSince(farm.created_at) / 7);
  return score;
};

export const localPersonalization = {
  async getProfile(userId) {
    return readProfile(userId);
  },

  async clearProfile(userId) {
    await AsyncStorage.removeItem(getStorageKey(userId));
  },

  async track(userId, interaction = {}) {
    const at = nowIso();
    const profile = await readProfile(userId);
    const type = interaction.type || interaction.interactionType || 'view';
    const itemType = interaction.itemType || (interaction.farmId ? 'farm' : 'product');
    const weight = INTERACTION_WEIGHTS[type] || 3;

    const productId = normalizeId(interaction.productId);
    const farmId = normalizeId(interaction.farmId);
    const categoryId = normalizeId(interaction.categoryId);
    const searchQuery = interaction.searchQuery?.trim?.();

    if (itemType === 'product' && productId) {
      incrementBucket(profile.products, productId, weight, at);
    }
    if (itemType === 'farm' && farmId) {
      incrementBucket(profile.farms, farmId, weight, at);
    }
    if (interaction.relatedFarmId) {
      incrementBucket(profile.farms, interaction.relatedFarmId, Math.max(1, weight * 0.35), at);
    }
    if (categoryId) {
      incrementBucket(profile.categories, categoryId, Math.max(1, weight * 0.55), at);
    }
    if (searchQuery) {
      incrementBucket(profile.searches, searchQuery.toLowerCase(), weight, at);
    }

    profile.events.push({
      type,
      itemType,
      productId,
      farmId,
      categoryId,
      searchQuery,
      at,
    });
    profile.events = profile.events.slice(-MAX_EVENTS);
    profile.updatedAt = at;

    await writeProfile(userId, profile);
    return profile;
  },

  async markDisplayed(userId, itemType, itemIds = []) {
    const ids = [...new Set(itemIds.map(normalizeId).filter(Boolean))];
    if (!ids.length) return null;

    const at = nowIso();
    const profile = await readProfile(userId);
    const bucket = itemType === 'farm' ? profile.displayedFarms : profile.displayedProducts;

    ids.forEach((id) => {
      incrementBucket(bucket, id, 1, at);
    });

    profile.displaySession = (Number(profile.displaySession) || 0) + 1;
    profile.updatedAt = at;
    await writeProfile(userId, profile);
    return profile;
  },

  rankProducts(products = [], profile, options = {}) {
    const safeProfile = sanitizeProfile(profile);
    const exploration = options.exploration ?? 0.12;
    const seed = `${safeProfile.displaySession || 0}:${safeProfile.updatedAt || 'default'}`;

    return [...products]
      .map((product) => {
        const productId = getItemId(product);
        const categoryId = getCategoryId(product);
        const farmId = getFarmIdFromProduct(product);
        const preferenceScore =
          bucketScore(safeProfile.products, productId) +
          bucketScore(safeProfile.categories, categoryId) +
          bucketScore(safeProfile.farms, farmId) * 0.35;
        const globalScore = defaultProductSignal(product);
        const farm = product?.farms;
        const farmName = String(farm?.name || '').trim().toLowerCase();
        const ownerBoost =
          farm?.is_priority || farm?.priority_boost ? 24 :
            farmName === 'dream market' || (!product?.farm_id && !farm?.id) ? 30 :
              0;
        const displayPenalty = exposurePenalty(safeProfile.displayedProducts, productId);
        const randomScore = stableRandom(`product:${productId}:${seed}`) * 20 * exploration;

        return {
          ...product,
          personalizationScore: preferenceScore + globalScore + ownerBoost + randomScore - displayPenalty,
        };
      })
      .sort((a, b) => {
        if (b.personalizationScore !== a.personalizationScore) {
          return b.personalizationScore - a.personalizationScore;
        }
        return new Date(b.created_at || 0) - new Date(a.created_at || 0);
      });
  },

  rankFarms(farms = [], profile, options = {}) {
    const safeProfile = sanitizeProfile(profile);
    const exploration = options.exploration ?? 0.15;
    const seed = `${safeProfile.displaySession || 0}:${safeProfile.updatedAt || 'default'}`;

    return [...farms]
      .map((farm) => {
        const farmId = getItemId(farm);
        const specialty = normalizeId(farm?.specialty);
        const preferenceScore =
          bucketScore(safeProfile.farms, farmId) +
          bucketScore(safeProfile.searches, specialty) * 0.4;
        const globalScore = defaultFarmSignal(farm);
        const priorityBoost = farm?.is_priority || farm?.priority_boost ? 22 : 0;
        const displayPenalty = exposurePenalty(safeProfile.displayedFarms, farmId);
        const randomScore = stableRandom(`farm:${farmId}:${seed}`) * 18 * exploration;

        return {
          ...farm,
          personalizationScore: preferenceScore + globalScore + priorityBoost + randomScore - displayPenalty,
        };
      })
      .sort((a, b) => {
        if (b.personalizationScore !== a.personalizationScore) {
          return b.personalizationScore - a.personalizationScore;
        }
        return new Date(b.created_at || 0) - new Date(a.created_at || 0);
      });
  },
};
