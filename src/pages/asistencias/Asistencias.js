import React, { useState, useEffect } from "react";
import { Container, Table, Button } from "react-bootstrap";
import api from "../../api/axios";
import { useNavigate } from "react-router-dom";

const Asistencias = () => {
  const [asistencias, setAsistencias] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAsistencias = async () => {
      try {
        const response = await api.get("/asistencias");
        setAsistencias(response.data);
        setError("");
      } catch (err) {
        setError(
          "Error al cargar las asistencias. Verifica la ruta '/api/asistencias'. Detalle: " +
            (err.response?.data?.mensaje || err.message)
        );
      }
    };
    fetchAsistencias();
  }, []);

  return (
    <Container className="mt-4">
      <h2>Asistencias</h2>
      <Button
        variant="primary"
        className="mb-3"
        onClick={() => navigate("/asistencias/registrar")}
      >
        Registrar Nueva Asistencia
      </Button>

      {error && <p className="text-danger">{error}</p>}

      {asistencias.length > 0 ? (
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Clase</th>
              <th>Fecha</th>
            </tr>
          </thead>
          <tbody>
            {asistencias.map((asistencia) => (
              <tr key={asistencia._id}>
                <td>
                  {asistencia.clienteId?.nombre || "Cliente no encontrado"}
                </td>
                <td>{asistencia.claseId?.nombre || "Clase no encontrada"}</td>
                <td>{new Date(asistencia.fecha).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      ) : (
        <p>No hay asistencias registradas.</p>
      )}
    </Container>
  );
};

export default Asistencias;
