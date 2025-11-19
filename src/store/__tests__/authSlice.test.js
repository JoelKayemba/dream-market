import authReducer, {
  clearError,
  clearPasswordReset,
  clearEmailConfirmation,
} from '../authSlice';

describe('authSlice', () => {
  const initialState = {
    user: null,
    token: null,
    refreshToken: null,
    isLoading: false,
    error: null,
    isAuthenticated: false,
    resetCode: null,
    isPasswordReset: false,
    needsEmailConfirmation: false,
  };

  const mockUser = {
    id: 'user123',
    email: 'test@example.com',
    role: 'customer',
    firstName: 'Jean',
    lastName: 'Dupont',
    phone: '+243900000000',
    address: '123 Main St',
    avatarUrl: 'https://example.com/avatar.jpg',
  };

  describe('clearError', () => {
    it('should clear error message', () => {
      const stateWithError = {
        ...initialState,
        error: 'Une erreur est survenue',
      };

      const action = clearError();
      const state = authReducer(stateWithError, action);

      expect(state.error).toBeNull();
    });
  });

  describe('clearPasswordReset', () => {
    it('should clear password reset state', () => {
      const stateWithReset = {
        ...initialState,
        resetCode: 'sent',
        isPasswordReset: true,
      };

      const action = clearPasswordReset();
      const state = authReducer(stateWithReset, action);

      expect(state.resetCode).toBeNull();
      expect(state.isPasswordReset).toBe(false);
    });
  });

  describe('clearEmailConfirmation', () => {
    it('should clear email confirmation flag', () => {
      const stateWithConfirmation = {
        ...initialState,
        needsEmailConfirmation: true,
      };

      const action = clearEmailConfirmation();
      const state = authReducer(stateWithConfirmation, action);

      expect(state.needsEmailConfirmation).toBe(false);
    });
  });

  describe('clearError', () => {
    it('should clear error message', () => {
      const stateWithError = {
        ...initialState,
        error: 'Une erreur est survenue',
      };

      const action = clearError();
      const state = authReducer(stateWithError, action);

      expect(state.error).toBeNull();
    });
  });

  describe('loginUser async actions', () => {
    it('should set isLoading to true when loginUser is pending', () => {
      const action = { type: 'auth/loginUser/pending' };
      const state = authReducer(initialState, action);

      expect(state.isLoading).toBe(true);
      expect(state.error).toBeNull();
    });

    it('should set user and token when loginUser is fulfilled', () => {
      const action = {
        type: 'auth/loginUser/fulfilled',
        payload: {
          user: mockUser,
          token: 'token123',
          refreshToken: 'refresh123',
        },
      };
      const state = authReducer(initialState, action);

      expect(state.user).toEqual(mockUser);
      expect(state.token).toBe('token123');
      expect(state.refreshToken).toBe('refresh123');
      expect(state.isAuthenticated).toBe(true);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should set error when loginUser is rejected', () => {
      const action = {
        type: 'auth/loginUser/rejected',
        payload: 'Email ou mot de passe incorrect',
      };
      const state = authReducer(initialState, action);

      expect(state.error).toBe('Email ou mot de passe incorrect');
      expect(state.isLoading).toBe(false);
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
    });
  });

  describe('registerUser async actions', () => {
    it('should set isLoading to true when registerUser is pending', () => {
      const action = { type: 'auth/registerUser/pending' };
      const state = authReducer(initialState, action);

      expect(state.isLoading).toBe(true);
    });

    it('should set user when registerUser is fulfilled', () => {
      const action = {
        type: 'auth/registerUser/fulfilled',
        payload: {
          user: mockUser,
          token: 'token123',
          refreshToken: 'refresh123',
        },
      };
      const state = authReducer(initialState, action);

      expect(state.user).toEqual(mockUser);
      expect(state.isAuthenticated).toBe(true);
      expect(state.isLoading).toBe(false);
    });

    it('should set error when registerUser is rejected', () => {
      const action = {
        type: 'auth/registerUser/rejected',
        payload: 'Cet email est déjà utilisé',
      };
      const state = authReducer(initialState, action);

      expect(state.error).toBe('Cet email est déjà utilisé');
      expect(state.isLoading).toBe(false);
    });
  });

  describe('logout async actions', () => {
    it('should clear user data when logout is fulfilled', () => {
      const stateWithUser = {
        ...initialState,
        user: mockUser,
        token: 'token123',
        isAuthenticated: true,
      };

      const action = { type: 'auth/logout/fulfilled' };
      const state = authReducer(stateWithUser, action);

      expect(state.user).toBeNull();
      expect(state.token).toBeNull();
      expect(state.isAuthenticated).toBe(false);
    });
  });

  describe('updateUserInfo async actions', () => {
    it('should update user info when fulfilled', () => {
      const stateWithUser = {
        ...initialState,
        user: mockUser,
        isAuthenticated: true,
      };

      const action = {
        type: 'auth/updateUserInfo/fulfilled',
        payload: {
          firstName: 'Nouveau',
          lastName: 'Nom',
          phone: '+243999999999',
          address: 'Nouvelle adresse',
        },
      };
      const state = authReducer(stateWithUser, action);

      expect(state.user.firstName).toBe('Nouveau');
      expect(state.user.lastName).toBe('Nom');
      expect(state.user.phone).toBe('+243999999999');
      expect(state.user.address).toBe('Nouvelle adresse');
      expect(state.isLoading).toBe(false);
    });
  });

  describe('loadStoredAuth async actions', () => {
    it('should load user when fulfilled with payload', () => {
      const action = {
        type: 'auth/loadStoredAuth/fulfilled',
        payload: {
          user: mockUser,
          token: 'token123',
          refreshToken: 'refresh123',
        },
      };
      const state = authReducer(initialState, action);

      expect(state.user).toEqual(mockUser);
      expect(state.token).toBe('token123');
      expect(state.isAuthenticated).toBe(true);
      expect(state.isLoading).toBe(false);
    });

    it('should clear user when fulfilled with null', () => {
      const stateWithUser = {
        ...initialState,
        user: mockUser,
        isAuthenticated: true,
      };

      const action = {
        type: 'auth/loadStoredAuth/fulfilled',
        payload: null,
      };
      const state = authReducer(stateWithUser, action);

      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.isLoading).toBe(false);
    });
  });
});

