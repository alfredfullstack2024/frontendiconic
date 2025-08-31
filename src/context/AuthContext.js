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
  }, [user]);

  const login = async (email, password) => {
    try {
      const response = await api.post("/auth/login", { email, password });
      console.log("Respuesta de /auth/login:", response.data);
      const token = response.data.token;
      if (!token) throw new Error("No se recibió un token.");
      localStorage.setItem("token", token);
      const userData = response.data.user || {};
      // Usar 'rol' como clave principal, fallback a 'role' si existe
      const rol = userData.rol || userData.role || "user"; // Cambiado de 'role' a 'rol'
      setUser({ ...userData, rol, token }); // Cambiado de 'role' a 'rol'
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
      const rol = userData.rol || userData.role || rol || "user"; // Cambiado de 'role' a 'rol'
      setUser({ ...userData, rol, token }); // Cambiado de 'role' a 'rol'
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
    console.log("Rol del usuario:", user.rol, "Rol requerido:", requiredRole); // Cambiado de user.role a user.rol
    if (user.rol === "admin") return true; // Cambiado de user.role a user.rol
    return user.rol === requiredRole; // Cambiado de user.role a user.rol
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
