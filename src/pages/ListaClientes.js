// src/components/clientes/ListaClientes.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import moment from "moment";

const ListaClientes = () => {
  const [clientes, setClientes] = useState([]);
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    const fetchClientes = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/clientes`
        );
        setClientes(response.data);
      } catch (error) {
        console.error("Error al obtener los clientes:", error);
      }
    };

    fetchClientes();
  }, []);

  // Filtro por nombre
  const clientesFiltrados = clientes.filter((cliente) =>
    cliente.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="container mt-4">
      <h2 className="mb-3">Lista de Clientes</h2>

      {/* Buscador */}
      <input
        type="text"
        className="form-control mb-3"
        placeholder="Buscar por nombre..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
      />

      {/* Tabla de clientes */}
      <table className="table table-striped table-hover">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Email</th>
            <th>Teléfono</th>
            <th>Fecha de Nacimiento</th>
          </tr>
        </thead>
        <tbody>
          {clientesFiltrados.length > 0 ? (
            clientesFiltrados.map((cliente) => (
              <tr key={cliente._id}>
                <td>{cliente.nombre}</td>
                <td>{cliente.email}</td>
                <td>{cliente.telefono || "No especificado"}</td>
                <td>
                  {cliente.fechaNacimiento
                    ? moment(cliente.fechaNacimiento).format("DD/MM/YYYY")
                    : "No especificado"}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className="text-center">
                No se encontraron clientes
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ListaClientes;


