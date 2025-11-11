import { useCallback, useEffect, useState } from 'react';
import { deliveryFeeService, DEFAULT_DELIVERY_FEE } from '../backend/services/deliveryFeeService';

export const useDeliveryFee = ({ autoRefresh = true } = {}) => {
  const [fee, setFee] = useState(DEFAULT_DELIVERY_FEE);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadFee = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const currentFee = await deliveryFeeService.getDeliveryFee();
      setFee(currentFee);
    } catch (err) {
      console.error('❌ [useDeliveryFee] loadFee error:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateFee = useCallback(async (amount, currency) => {
    try {
      setLoading(true);
      setError(null);
      const updated = await deliveryFeeService.setDeliveryFee(amount, currency);
      setFee(updated);
      return updated;
    } catch (err) {
      console.error('❌ [useDeliveryFee] updateFee error:', err);
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFee();

    if (!autoRefresh) {
      return undefined;
    }

    const unsubscribe = deliveryFeeService.subscribeToDeliveryFee((newFee) => {
      setFee(newFee);
    });

    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [autoRefresh, loadFee]);

  return {
    fee,
    loading,
    error,
    refresh: loadFee,
    updateFee
  };
};
