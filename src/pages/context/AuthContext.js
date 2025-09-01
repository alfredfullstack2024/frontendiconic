// src/context/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      console.log("Token configurado en headers:", token);
    } else {
      delete api.defaults.headers.common["Authorization"];
      console.log("No hay token para configurar en headers");
    }
  }, []);

  const login = async (email, password) => {
    try {
      setLoading(true);
      const response = await api.post("/auth/login", { email, password });
      const token = response.data.token;
      if (!token) throw new Error("No se recibió token desde el servidor");
      localStorage.setItem("token", token);
      const userData = response.data.user || {};
      const rol = userData.rol || userData.role || "user";
      const finalUser = { ...userData, rol, token };
      setUser(finalUser);
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      setLoading(false);
      navigate("/dashboard");
    } catch (err) {
      setLoading(false);
      console.error("Error al iniciar sesión:", err);
      // intenta obtener mensaje del servidor, si no mostrar genérico
      const msg = err.response?.data?.message || err.response?.data?.mensaje || err.message || "Error al iniciar sesión";
      throw new Error(msg);
    }
  };

  const register = async (nombre, email, password, rolParam) => {
    try {
      setLoading(true);
      const response = await api.post("/users/register", { nombre, email, password, rol: rolParam });
      const token = response.data.token;
      if (!token) throw new Error("No se recibió token desde el servidor");
      localStorage.setItem("token", token);
      const userData = response.data.user || {};
      const rol = userData.rol || userData.role || rolParam || "user";
      setUser({ ...userData, rol, token });
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      setLoading(false);
      navigate("/dashboard");
    } catch (err) {
      setLoading(false);
      console.error("Error al registrar:", err);
      const msg = err.response?.data?.message || err.response?.data?.mensaje || err.message || "Error al registrar";
      throw new Error(msg);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    delete api.defaults.headers.common["Authorization"];
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
  if (!context) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return context;
};

export { AuthContext, AuthProvider, useAuth };
