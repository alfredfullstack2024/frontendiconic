// src/context/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // ahora sí usamos loading
  const navigate = useNavigate();

  // Verifica si hay token al cargar la app
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      api
        .get("/auth/me")
        .then((response) => {
          setUser({ ...response.data, token });
        })
        .catch((error) => {
          console.error("Error en /auth/me:", error.message);
          localStorage.removeItem("token");
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

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
      navigate("/dashboard");
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      throw new Error(error.response?.data?.message || "Error al iniciar sesión");
    }
  };

  const register = async (nombre, email, password, rol) => {
    try {
      // 👇 corregido: se envía "rol" igual que en tu base de datos
      const response = await api.post("/auth/register", {
        nombre,
        email,
        password,
        rol,
      });

      console.log("Respuesta de /auth/register:", response.data);

      const token = response.data.token;
      if (!token) throw new Error("No se recibió un token.");

      localStorage.setItem("token", token);
      const userData = response.data.user || {};
      setUser({ ...userData, token });

      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      navigate("/dashboard");
    } catch (error) {
      console.error("Error al registrar usuario:", error);
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
    console.log("Rol del usuario:", user.rol, "Rol requerido:", requiredRole);
    if (user.rol === "admin") return true;
    return user.rol === requiredRole;
  };

  return (
    <AuthContext.Provider
      value={{ user, setUser, loading, login, register, logout, hasPermission }}
    >
      {!loading && children} {/* Renderizamos solo cuando termina de cargar */}
    </AuthContext.Provider>
  );
};

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth debe ser usado dentro de un AuthProvider");
  return context;
};

export { AuthContext, AuthProvider, useAuth };
