// src/context/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false); // Iniciamos sin loading
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
  }, [user]);

  // Desactivamos temporalmente la llamada a /auth/me
  // useEffect(() => {
  //   const token = localStorage.getItem("token");
  //   console.log("Token en localStorage al iniciar:", token);
  //   if (token) {
  //     api.get("/auth/me").then((response) => {
  //       console.log("Datos de /auth/me:", response.data);
  //       setUser({ ...response.data, token });
  //     }).catch((error) => {
  //       console.error("Error en /auth/me:", error.message);
  //       localStorage.removeItem("token");
  //       setUser(null);
  //     });
  //   }
  // }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post("/auth/login", { email, password });
      console.log("Respuesta de /auth/login:", response.data);
      const token = response.data.token;
      if (!token) throw new Error("No se recibió un token.");
      localStorage.setItem("token", token);
      const userData = response.data.user || {};
      setUser({ ...userData, token });
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      setTimeout(() => navigate("/dashboard"), 0);
    } catch (error) {
      console.error("Error al iniciar sesión:", error.message);
      throw new Error(error.response?.data?.message || "Error al iniciar sesión");
    }
  };

  const register = async (nombre, email, password, rol) => {
    try {
      const response = await api.post("/auth/register", { nombre, email, password, role: rol });
      console.log("Respuesta de /auth/register:", response.data);
      const token = response.data.token;
      if (!token) throw new Error("No se recibió un token.");
      localStorage.setItem("token", token);
      const userData = response.data.user || {};
      setUser({ ...userData, token });
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      setTimeout(() => navigate("/dashboard"), 0);
    } catch (error) {
      console.error("Error al registrar usuario:", error.message);
      throw new Error(error.response?.data?.message || "Error al registrar usuario");
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
    console.log("Rol del usuario:", user.role, "Rol requerido:", requiredRole);
    if (user.role === "admin") return true;
    return user.role === requiredRole;
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, register, logout, hasPermission }}>
      {children} {/* Renderizamos siempre por ahora */}
    </AuthContext.Provider>
  );
};

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth debe ser usado dentro de un AuthProvider");
  return context;
};

export { AuthContext, AuthProvider, useAuth };
