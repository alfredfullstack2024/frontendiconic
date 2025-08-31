import React, { useState, useEffect } from "react";
import { Form, Button, Alert, Table } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/axios";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";

const Clases = () => {
  const [clases, setClases] = useState([]);
  const [selectedClase, setSelectedClase] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const numeroIdentificacion = user?.numeroIdentificacion || ""; // Obtener del contexto

  useEffect(() => {
    const fetchClases = async () => {
      setIsLoading(true);
      setError("");
      try {
        const response = await api.get("/clases/consultar/" + numeroIdentificacion); // Usar ruta permitida
        if (response.data && Array.isArray(response.data)) {
          setClases(response.data);
        } else {
          setClases([]);
          setError("No hay clases disponibles o formato inesperado");
        }
      } catch (err) {
        setError("No se pudieron cargar las clases: " + (err.response?.data?.mensaje || err.message));
      } finally {
        setIsLoading(false);
      }
    };

    if (numeroIdentificacion) fetchClases();
  }, [numeroIdentificacion, navigate]);

  const handleInscribirse = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    if (!selectedClase) {
      setError("Por favor, selecciona una clase.");
      setIsLoading(false);
      return;
    }
    try {
      await api.post("/clases/registrar", { claseId: selectedClase, numeroIdentificacion });
      setSelectedClase("");
      const response = await api.get("/clases/consultar/" + numeroIdentificacion);
      if (response.data && Array.isArray(response.data)) {
        setClases(response.data);
      }
      alert("Inscripción exitosa");
    } catch (err) {
      setError("Error al inscribirse: " + (err.response?.data?.mensaje || err.message));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mt-4">
      <h2>Inscribirse en Clases</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      {isLoading && <Alert variant="info">Cargando...</Alert>}
      {!isLoading && !error && clases.length === 0 && (
        <Alert variant="info">No estás inscrito en ninguna clase. Selecciona una para inscribirte.</Alert>
      )}
      <Form onSubmit={handleInscribirse}>
        <Form.Group controlId="clase">
          <Form.Label>Clase Disponible</Form.Label>
          <Form.Control
            as="select"
            value={selectedClase}
            onChange={(e) => setSelectedClase(e.target.value)}
            required
          >
            <option value="">Selecciona una clase</option>
            {clases.map((clase) => (
              <option key={clase._id} value={clase._id}>
                {clase.nombre} - {clase.horario}
              </option>
            ))}
          </Form.Control>
        </Form.Group>
        <Button variant="primary" type="submit" className="mt-3" disabled={isLoading || !selectedClase}>
          Inscribirse
        </Button>
      </Form>
      {!isLoading && !error && clases.length > 0 && (
        <Table striped bordered hover className="mt-3">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Horario</th>
            </tr>
          </thead>
          <tbody>
            {clases.map((clase) => (
              <tr key={clase._id}>
                <td>{clase.nombre}</td>
                <td>{clase.horario}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
};

export default Clases;
