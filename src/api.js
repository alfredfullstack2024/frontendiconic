import axios from "axios";

const API_URL = "http://localhost:5000/api"; // Ruta base del backend

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Agregar token JWT automáticamente
export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common["Authorization"];
  }
};

///// 🛒 FUNCIONES PARA PRODUCTOS //////

export const obtenerProductos = async () => {
  const respuesta = await api.get("/productos");
  return respuesta.data;
};

export const crearProducto = async (datos) => {
  const respuesta = await api.post("/productos", datos);
  return respuesta.data;
};

export const editarProducto = async (id, datos) => {
  const respuesta = await api.put(`/productos/${id}`, datos);
  return respuesta.data;
};

export const eliminarProducto = async (id) => {
  const respuesta = await api.delete(`/productos/${id}`);
  return respuesta.data;
};

export const obtenerProductoPorId = async (id) => {
  const respuesta = await api.get(`/productos/${id}`);
  return respuesta.data;
};

///// 👥 FUNCIONES PARA CLIENTES //////

export const obtenerClientes = async () => {
  const respuesta = await api.get("/clientes");
  return respuesta.data;
};

export const crearCliente = async (datos) => {
  const respuesta = await api.post("/clientes", datos);
  return respuesta.data;
};

export const editarCliente = async (id, datos) => {
  const respuesta = await api.put(`/clientes/${id}`, datos);
  return respuesta.data;
};

export const eliminarCliente = async (id) => {
  const respuesta = await api.delete(`/clientes/${id}`);
  return respuesta.data;
};

export const obtenerClientePorId = async (id) => {
  const respuesta = await api.get(`/clientes/${id}`);
  return respuesta.data;
};
