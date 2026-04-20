import { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from './jwtDecode';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const now = Date.now() / 1000;
        if (decoded.exp && decoded.exp > now) {
          setUser({
            userId: decoded.userId,
            userName: decoded.sub,
            role: decoded.role,
            profileId: decoded.profileId,
            profileName: localStorage.getItem('profileName') || '',
            token,
          });
        } else {
          localStorage.clear();
        }
      } catch {
        localStorage.clear();
      }
    }
    setLoading(false);
  }, []);

  const loginUser = (loginResponse) => {
    const { token, userId, userName, role, profileId, profileName } = loginResponse;
    localStorage.setItem('token', token);
    localStorage.setItem('profileName', profileName || '');
    setUser({ userId, userName, role, profileId, profileName, token });
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
