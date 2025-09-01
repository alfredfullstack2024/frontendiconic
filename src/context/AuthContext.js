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
    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      // Intentamos obtener datos del usuario de /auth/me (si existe endpoint)
      (async () => {
        try {
          setLoading(true);
          const res = await api.get("/auth/me");
          const userData = res.data;
          // Normalizar rol
          const rol = userData.rol || userData.role || "user";
          setUser({ ...userData, rol });
        } catch (err) {
          console.warn("No se pudo obtener /auth/me o token inválido:", err.message);
          localStorage.removeItem("token");
          delete api.defaults.headers.common["Authorization"];
          setUser(null);
        } finally {
          setLoading(false);
        }
      })();
    } else {
      delete api.defaults.headers.common["Authorization"];
      setUser(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
