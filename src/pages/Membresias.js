import React, { useState, useEffect } from "react";
import { Table, Button, Alert, Spinner } from "react-bootstrap";
import { Link } from "react-router-dom";
import axios from "../api/axios";

const Membresias = () => {
  const [membresias, setMembresias] = useState([]);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const fetchMembresias = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("/membresias", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMembresias(
          Array.isArray(response.data.membresias)
            ? response.data.membresias
            : []
        );
      } catch (err) {
        setError(`❌ Error al cargar las membresías: ${err.message}`);
      } finally {
        setCargando(false);
      }
    };
    fetchMembresias();
  }, []);

  const handleEliminar = async (id) => {
    if (
      window.confirm("¿Estás seguro de que deseas eliminar esta membresía?")
    ) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(`/membresias/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMembresias(membresias.filter((membresia) => membresia._id !== id));
      } catch (err) {
        setError(`❌ Error al eliminar la membresía: ${err.message}`);
      }
    }
  };

  // Función para calcular los días restantes
  const calcularDiasRestantes = (fechafin) => {
    if (!fechafin) return "No especificado";
    const hoy = new Date();
    const fin = new Date(fechafin);
    const diferencia = fin - hoy;
    const diasRestantes = Math.ceil(diferencia / (1000 * 60 * 60 * 24));
    return diasRestantes >= 0 ? diasRestantes : "Vencida";
  };

  if (cargando) {
    return <Spinner animation="border" variant="primary" />;
  }

  return (
    <div>
      <h2>Lista de Membresías</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      <Link to="/membresias/crear">
        <Button variant="primary" className="mb-3">
          Agregar Membresía
        </Button>
      </Link>
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Duración (días)</th>
            <th>Días Restantes</th>
            <th>Sesiones Restantes</th>
            <th>Precio</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {membresias.length > 0 ? (
            membresias.map((membresia) => (
              <tr key={membresia._id}>
                <td>
                  {membresia.cliente
                    ? `${membresia.cliente.nombre} ${
                        membresia.cliente.apellido || ""
                      }`
                    : "Cliente no encontrado"}
                </td>
                <td>{membresia.duracion || "No especificado"}</td>
                <td>{calcularDiasRestantes(membresia.fechafin)}</td>
                <td>{membresia.sesionesRestantes || "No especificado"}</td>
                <td>{membresia.precio || "No especificado"}</td>
                <td>
                  <Link to={`/membresias/editar/${membresia._id}`}>
                    <Button variant="warning" className="me-2">
                      Editar
                    </Button>
                  </Link>
                  <Button
                    variant="danger"
                    onClick={() => handleEliminar(membresia._id)}
                  >
                    Eliminar
                  </Button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="text-center">
                No hay membresías registradas
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </div>
  );
};

export default Membresias;
