export const resolvePostLoginRoute = (role) => {
  if (role === 'admin') return 'AdminDashboard';
  if (role === 'farmer') return 'FarmerApp';
  return 'MainApp';
};
