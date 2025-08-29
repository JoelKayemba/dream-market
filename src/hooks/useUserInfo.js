import { useState, useCallback } from 'react';

// État global simple pour les informations utilisateur
let globalUserInfo = {
  firstName: 'Marie',
  lastName: 'Dupont',
  email: 'marie.dupont@email.com',
  phone: '+33 6 12 34 56 78',
  address: '123 Rue des Champs, 14000 Caen'
};

export const useUserInfo = () => {
  const [userInfo, setUserInfo] = useState(globalUserInfo);

  const updateUserInfo = useCallback((newInfo) => {
    globalUserInfo = { ...globalUserInfo, ...newInfo };
    setUserInfo(globalUserInfo);
  }, []);

  const getUserInfo = useCallback(() => {
    return globalUserInfo;
  }, []);

  return {
    userInfo,
    updateUserInfo,
    getUserInfo
  };
};
