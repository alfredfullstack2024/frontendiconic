import React, { createContext, useState, useEffect } from "react";
import axios from "../utils/axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || null);

  // Configurar token en headers cada vez que cambie
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common["Authorization"];
    }
  }, [token]);

  const login = async (email, password) => {
    try {
      const response = await axios.post("/auth/login", { email, password });
      const { token: receivedToken, user: userData } = response.data;

      localStorage.setItem("token", receivedToken);
      setToken(receivedToken);
      setUser(userData);

      return { success: true };
    } catch (error) {
      console.error("Error al iniciar sesión:", error.response?.data || error.message);
      return { success: false, message: error.response?.data?.message || "Credenciales inválidas" };
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
