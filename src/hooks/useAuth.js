import { useSelector, useDispatch } from 'react-redux';
import { 
  loginUser, 
  registerUser, 
  forgotPassword, 
  resetPassword, 
  logout, 
  clearError, 
  clearPasswordReset,
  updateUserInfo 
} from '../store/authSlice';

export const useAuth = () => {
  const dispatch = useDispatch();
  const auth = useSelector((state) => state.auth);

  return {
    // État
    user: auth.user,
    token: auth.token,
    isAuthenticated: auth.isAuthenticated,
    isLoading: auth.isLoading,
    error: auth.error,
    resetCode: auth.resetCode,
    isPasswordReset: auth.isPasswordReset,
    
    // Actions
    login: (email, password) => dispatch(loginUser({ email, password })),
    register: (userData) => dispatch(registerUser(userData)),
    forgotPassword: (email) => dispatch(forgotPassword({ email })),
    resetPassword: (email, code, newPassword) => 
      dispatch(resetPassword({ email, code, newPassword })),
    logout: () => dispatch(logout()),
    clearError: () => dispatch(clearError()),
    clearPasswordReset: () => dispatch(clearPasswordReset()),
    updateUserInfo: (userData) => dispatch(updateUserInfo(userData)),
    
    // Getters
    isAdmin: () => auth.user?.role === 'admin',
    isUser: () => auth.user?.role === 'user',
    hasRole: (role) => auth.user?.role === role,
  };
};
