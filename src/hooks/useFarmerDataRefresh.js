import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useDispatch } from 'react-redux';

/**
 * Recharge les données fermier au focus sans bloquer l'UI.
 * Le pull-to-refresh utilise un état local (pas le loading Redux global).
 */
export function useFarmerDataRefresh(fetchAction) {
  const dispatch = useDispatch();
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      dispatch(fetchAction());
    }, [dispatch, fetchAction])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await dispatch(fetchAction()).unwrap();
    } catch {
      // erreur gérée dans le slice
    } finally {
      setRefreshing(false);
    }
  }, [dispatch, fetchAction]);

  return { refreshing, onRefresh };
}
