import { supabase } from '../config/supabase';

const TABLE = 'app_settings';
const DELIVERY_FEE_KEY = 'delivery_fee';

export const DEFAULT_DELIVERY_FEE = {
  amount: 0,
  currency: 'CDF'
};

const parseDeliveryFee = (value) => {
  if (!value || typeof value !== 'object') {
    return { ...DEFAULT_DELIVERY_FEE };
  }

  const rawAmount = Number(value.amount);
  const amount = Number.isFinite(rawAmount) ? rawAmount : DEFAULT_DELIVERY_FEE.amount;
  const currency = typeof value.currency === 'string' && value.currency.trim().length > 0
    ? value.currency.trim().toUpperCase()
    : DEFAULT_DELIVERY_FEE.currency;

  return { amount, currency };
};

export const deliveryFeeService = {
  async getDeliveryFee() {
    try {
      const { data, error } = await supabase
        .from(TABLE)
        .select('value')
        .eq('key', DELIVERY_FEE_KEY)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return { ...DEFAULT_DELIVERY_FEE };
        }
        throw error;
      }

      return parseDeliveryFee(data?.value);
    } catch (error) {
      console.error('❌ [deliveryFeeService] getDeliveryFee error:', error);
      return { ...DEFAULT_DELIVERY_FEE };
    }
  },

  async setDeliveryFee(amount, currency) {
    try {
      const parsedAmount = Number(amount);
      if (!Number.isFinite(parsedAmount) || parsedAmount < 0) {
        throw new Error('Le montant doit être un nombre positif.');
      }

      const normalizedCurrency = (currency || DEFAULT_DELIVERY_FEE.currency)
        .toString()
        .trim()
        .toUpperCase();

      const { error } = await supabase
        .from(TABLE)
        .upsert({
          key: DELIVERY_FEE_KEY,
          value: {
            amount: parsedAmount,
            currency: normalizedCurrency
          },
          updated_at: new Date().toISOString()
        }, { onConflict: 'key' });

      if (error) throw error;

      return { amount: parsedAmount, currency: normalizedCurrency };
    } catch (error) {
      console.error('❌ [deliveryFeeService] setDeliveryFee error:', error);
      throw error;
    }
  },

  subscribeToDeliveryFee(callback) {
    try {
      const channel = supabase
        .channel('delivery_fee_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: TABLE,
            filter: `key=eq.${DELIVERY_FEE_KEY}`
          },
          (payload) => {
            const newValue = payload?.new?.value ?? payload?.old?.value;
            callback(parseDeliveryFee(newValue));
          }
        )
        .subscribe();

      return () => {
        try {
          supabase.removeChannel(channel);
        } catch (error) {
          console.error('❌ [deliveryFeeService] unsubscribe error:', error);
        }
      };
    } catch (error) {
      console.error('❌ [deliveryFeeService] subscribe error:', error);
      return () => {};
    }
  }
};
