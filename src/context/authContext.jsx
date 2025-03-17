import { createContext, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";

import { ROUTES } from "../routes/paths";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
    navigate(ROUTES.HOME);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    navigate(ROUTES.SIGN_IN);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
