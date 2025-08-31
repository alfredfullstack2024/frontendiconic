import React, { useState, useEffect } from "react";
import { Container, Form, Button } from "react-bootstrap";
import api from "../../api/axios";
import { useNavigate } from "react-router-dom";

const RegistrarAsistencia = () => {
  const [clientes, setClientes] = useState([]);
  const [clases, setClases] = useState([]);
  const [asistencia, setAsistencia] = useState({
    clienteId: "",
    claseId: "",
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchClientes = async () => {
      try {
        const response = await api.get("/clientes");
        setClientes(response.data);
      } catch (err) {
        console.error("Error al cargar clientes:", err);
      }
    };

    const fetchClases = async () => {
      try {
        const response = await api.get("/clases/disponibles"); // Cambiado a /disponibles
        setClases(response.data);
      } catch (err) {
        console.error("Error al cargar clases:", err);
      }
    };

    fetchClientes();
    fetchClases();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAsistencia({ ...asistencia, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/asistencias", asistencia);
      alert("Asistencia registrada exitosamente");
      navigate("/asistencias");
    } catch (err) {
      console.error("Error al registrar asistencia:", err);
      alert(
        "Error al registrar asistencia: " +
          (err.response?.data?.mensaje || err.message)
      );
    }
  };

  return (
    <Container className="mt-4">
      <h2>Registrar Asistencia</h2>
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Cliente</Form.Label>
          <Form.Select
            name="clienteId"
            value={asistencia.clienteId}
            onChange={handleChange}
            required
          >
            <option value="">Selecciona un cliente</option>
            {clientes.map((cliente) => (
              <option key={cliente._id} value={cliente._id}>
                {cliente.nombre}
              </option>
            ))}
          </Form.Select>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Clase</Form.Label>
          <Form.Select
            name="claseId"
            value={asistencia.claseId}
            onChange={handleChange}
            required
          >
            <option value="">Selecciona una clase</option>
            {clases.map((clase) => (
              <option
                key={clase._id || clase.nombreClase}
                value={clase._id || clase.nombreClase}
              >
                {clase.nombreClase} - {clase.dia} ({clase.horarioInicio} -{" "}
                {clase.horarioFin})
              </option>
            ))}
          </Form.Select>
        </Form.Group>

        <Button variant="primary" type="submit">
          Registrar Asistencia
        </Button>
        <Button
          variant="secondary"
          className="ms-2"
          onClick={() => navigate("/asistencias")}
        >
          Cancelar
        </Button>
      </Form>
    </Container>
  );
};

export default RegistrarAsistencia;
