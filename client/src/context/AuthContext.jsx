import { createContext, useContext, useState, useCallback } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("stockflow_token"));
  const [organization, setOrganization] = useState(() => {
    const raw = localStorage.getItem("stockflow_org");
    return raw ? JSON.parse(raw) : null;
  });

  const login = useCallback((newToken, org) => {
    localStorage.setItem("stockflow_token", newToken);
    localStorage.setItem("stockflow_org", JSON.stringify(org));
    setToken(newToken);
    setOrganization(org);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("stockflow_token");
    localStorage.removeItem("stockflow_org");
    setToken(null);
    setOrganization(null);
  }, []);

  return (
    <AuthContext.Provider value={{ token, organization, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
