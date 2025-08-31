import React, { useState, useEffect } from "react";
import { Table, Alert } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { obtenerEntrenadores } from "../api/axios";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const Entrenadores = () => {
  const [entrenadores, setEntrenadores] = useState([]);
  const [error, setError] = useState("");
  const context = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEntrenadores = async () => {
      try {
        const response = await obtenerEntrenadores();
        setEntrenadores(response.data);
      } catch (err) {
        setError("Error al cargar los entrenadores: " + (err.message || "Sin detalles"));
        console.error(err);
      }
    };
    fetchEntrenadores();
  }, []);

  return (
    <div className="container mt-4">
      <h2>Lista de Entrenadores</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      <Link to="/entrenadores/crear" className="btn btn-primary mb-3">
        Crear Entrenador
      </Link>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Apellido</th>
            <th>Email</th>
            <th>Especialidad</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {entrenadores.map((entrenador) => (
            <tr key={entrenador._id}>
              <td>{entrenador.nombre}</td>
              <td>{entrenador.apellido}</td>
              <td>{entrenador.correo}</td>
              <td>{entrenador.especialidad}</td>
              <td>
                <Link
                  to={`/entrenadores/editar/${entrenador._id}`}
                  className="btn btn-warning btn-sm me-2"
                >
                  Editar
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default Entrenadores;
