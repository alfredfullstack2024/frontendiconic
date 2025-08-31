import React, { useState, useEffect } from "react";
import { Container, Table, Alert, Spinner } from "react-bootstrap";
import api from "../../api/axios";

const AdminInscripciones = () => {
  const [inscripciones, setInscripciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInscripciones = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Debes iniciar sesión como ADMIN.");
          setLoading(false);
          return;
        }

        const config = { headers: { Authorization: `Bearer ${token}` } };
        const response = await api.get(
          "/api/clases/todas-inscripciones",
          config
        );

        if (response.data && Array.isArray(response.data)) {
          setInscripciones(response.data);
        } else {
          setInscripciones([]);
          setError("No hay inscripciones disponibles.");
        }
        setError(null);
      } catch (err) {
        setError(
          err.response?.data?.message || "Error al cargar las inscripciones."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchInscripciones();
  }, []);

  // Verificar si el usuario es ADMIN (simplificado, ajusta según tu AuthContext)
  const isAdmin = localStorage.getItem("rol") === "admin";

  if (!isAdmin) {
    return (
      <Alert variant="danger">
        Acceso denegado. Solo para administradores.
      </Alert>
    );
  }

  return (
    <Container className="mt-4">
      <h2 className="mb-4">Inscripciones por Clase</h2>
      {loading && (
        <div className="text-center">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2">Cargando inscripciones...</p>
        </div>
      )}
      {error && <Alert variant="danger">{error}</Alert>}
      {!loading && !error && inscripciones.length === 0 && (
        <Alert variant="info">No hay inscripciones registradas.</Alert>
      )}
      {!loading && !error && inscripciones.length > 0 && (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Clase</th>
              <th>Día</th>
              <th>Horario</th>
              <th>Inscritos</th>
            </tr>
          </thead>
          <tbody>
            {inscripciones.map((inscripcion, index) => (
              <tr key={index}>
                <td>{inscripcion.nombreClase}</td>
                <td>{inscripcion.dia}</td>
                <td>{`${inscripcion.horarioInicio} - ${inscripcion.horarioFin}`}</td>
                <td>
                  <ul>
                    {inscripcion.inscritos.map((inscrito, i) => (
                      <li key={i}>
                        {inscrito.nombreCompleto} ({inscrito.correo})
                      </li>
                    ))}
                  </ul>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Container>
  );
};

export default AdminInscripciones;
