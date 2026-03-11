// src/context/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Al iniciar la app, leer token y (opcional) obtener /auth/me
 useEffect(() => {
  const token = localStorage.getItem("token");
  const storedUser = localStorage.getItem("user");

  if (token && storedUser) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

    const userData = JSON.parse(storedUser);
    const rol = userData.rol || userData.role || "user";

    setUser({ ...userData, rol });
  } else {
    delete api.defaults.headers.common["Authorization"];
    setUser(null);
  }
}, []);

  const login = async (email, password) => {
    try {
      setLoading(true);
      const response = await api.post("/auth/login", { email, password });
      const token = response.data.token;
      if (!token) throw new Error("No se recibió token del servidor.");
      localStorage.setItem("token", token);
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

     const userData = response.data.user || {};
const rol = userData.rol || userData.role || "user";

localStorage.setItem("user", JSON.stringify(userData));

setUser({ ...userData, rol, token });
      // Navegar al dashboard
      navigate("/dashboard");
      return { success: true };
    } catch (error) {
      console.error("Error al iniciar sesión:", error.response?.data || error.message);
      return { success: false, message: error.response?.data?.message || error.message || "Error al iniciar sesión" };
    } finally {
      setLoading(false);
    }
  };

  const register = async (nombre, email, password, rolParam = "user") => {
    try {
      setLoading(true);
      const response = await api.post("/auth/register", { nombre, email, password, rol: rolParam });
      const token = response.data.token;
      if (!token) throw new Error("No se recibió token del servidor.");
      localStorage.setItem("token", token);
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      const userData = response.data.user || {};
      const rol = userData.rol || userData.role || rolParam || "user";
      setUser({ ...userData, rol, token });
      return { success: true };
    } catch (error) {
      console.error("Error al registrar usuario:", error.response?.data || error.message);
      return { success: false, message: error.response?.data?.message || error.message || "Error al registrar usuario" };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  delete api.defaults.headers.common["Authorization"];
  setUser(null);
  navigate("/login");
};

  const hasPermission = (requiredRole) => {
    if (!user) return false;
    if (user.rol === "admin") return true;
    return user.rol === requiredRole;
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, register, logout, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth debe ser usado dentro de un AuthProvider");
  return context;
};

export { AuthContext, AuthProvider, useAuth };

