import React, { useState, useEffect } from "react";
import { Table, Button, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

const Usuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Cargar usuarios al montar el componente
  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        const response = await api.get("/users");
        setUsuarios(response.data || []);
        setError("");
      } catch (err) {
        setError("Error al cargar los usuarios: " + err.message);
      }
    };
    fetchUsuarios();
  }, []);

  // Función para eliminar un usuario
  const handleEliminar = async (id) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este usuario?")) {
      try {
        await api.delete(`/users/${id}`);
        setUsuarios(usuarios.filter((usuario) => usuario._id !== id));
      } catch (err) {
        setError("Error al eliminar el usuario: " + err.message);
      }
    }
  };

  return (
    <div className="container mt-4">
      <h2>Usuarios</h2>

      {/* Mostrar error si existe */}
      {error && <Alert variant="danger">{error}</Alert>}

      {/* Botón para crear un nuevo usuario */}
      <Button
        variant="primary"
        className="mb-3"
        onClick={() => navigate("/usuarios/crear")}
      >
        Crear Usuario
      </Button>

      {/* Tabla de usuarios */}
      {usuarios.length === 0 ? (
        <Alert variant="info">No hay usuarios para mostrar.</Alert>
      ) : (
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Email</th>
              <th>Rol</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((usuario) => (
              <tr key={usuario._id}>
                <td>{usuario.nombre}</td>
                <td>{usuario.email}</td>
                <td>{usuario.rol}</td>
                <td>
                  <Button
                    variant="warning"
                    size="sm"
                    className="me-2"
                    onClick={() => navigate(`/usuarios/editar/${usuario._id}`)}
                  >
                    Editar
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleEliminar(usuario._id)}
                  >
                    Eliminar
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
};

export default Usuarios;
