import React, { useState } from "react";
import {
  Container,
  Form,
  Button,
  Table,
  Alert,
  Row,
  Col,
  Spinner,
} from "react-bootstrap";
import {
  consultarRutinaPorNumeroIdentificacion,
  consultarPagosPorCedula,
  consultarClientePorCedula,
} from "../api/axios";

const ConsultaUsuario = () => {
  const [numeroCedula, setNumeroCedula] = useState("");
  const [rutinas, setRutinas] = useState([]);
  const [pagos, setPagos] = useState([]);
  const [clienteNombre, setClienteNombre] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleConsultar = async () => {
    if (!numeroCedula.trim()) {
      setError("Por favor, ingresa un número de cédula válido.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setRutinas([]);
      setPagos([]);
      setClienteNombre("");

      const [clienteResponse, rutinasResponse, pagosResponse] =
        await Promise.all([
          consultarClientePorCedula(numeroCedula),
          consultarRutinaPorNumeroIdentificacion(numeroCedula),
          consultarPagosPorCedula(numeroCedula),
        ]);

      // Nombre del cliente
      const clienteData = clienteResponse.data;
      setClienteNombre(clienteData.nombre || "Usuario");

      // Rutinas
      const rutinasData = Array.isArray(rutinasResponse.data)
        ? rutinasResponse.data
        : [rutinasResponse.data];
      setRutinas(rutinasData);

      // Pagos
      const pagosData = Array.isArray(pagosResponse.data)
        ? pagosResponse.data
        : [pagosResponse.data];
      setPagos(pagosData);
    } catch (err) {
      console.error("Error al consultar datos:", err);
      setError(
        "Error al consultar datos: " +
          (err.response?.data?.mensaje || err.message)
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="mt-4">
      <h2>Consulta de Usuario</h2>
      <p>
        Ingresa tu número de cédula para consultar tus rutinas asignadas y
        pagos.
      </p>

      {/* Mensaje de bienvenida */}
      {clienteNombre && !loading && !error && (
        <Alert variant="success" className="mb-4">
          Bienvenida(o) {clienteNombre} a nuestra APP de administracion de tu
          GYM.
        </Alert>
      )}

      {error && <Alert variant="danger">{error}</Alert>}
      {loading && (
        <div className="text-center">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Cargando...</span>
          </Spinner>
        </div>
      )}

      {/* Formulario para ingresar número de cédula */}
      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Número de Cédula</Form.Label>
            <Form.Control
              type="text"
              value={numeroCedula}
              onChange={(e) => setNumeroCedula(e.target.value)}
              placeholder="Ingresa tu número de cédula"
              disabled={loading}
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Button
            variant="primary"
            onClick={handleConsultar}
            className="mt-2"
            disabled={loading}
          >
            Consultar
          </Button>
        </Col>
      </Row>

      {/* Sección de Rutinas Asignadas */}
      {rutinas.length > 0 && (
        <div className="mt-5">
          <h3>Rutinas Asignadas</h3>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Rutina</th>
                <th>Días de Entrenamiento</th>
                <th>Días de Descanso</th>
              </tr>
            </thead>
            <tbody>
              {rutinas.map((rutina) => (
                <tr key={rutina._id}>
                  <td>
                    {rutina.rutinaId
                      ? `${rutina.rutinaId.nombreEjercicio} (${rutina.rutinaId.grupoMuscular})`
                      : "Desconocido"}
                  </td>
                  <td>{rutina.diasEntrenamiento?.join(", ") || "N/A"}</td>
                  <td>{rutina.diasDescanso?.join(", ") || "N/A"}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}

      {/* Sección de Pagos Realizados */}
      {pagos.length > 0 && (
        <div className="mt-5">
          <h3>Pagos Realizados</h3>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Monto</th>
                <th>Método de Pago</th>
                <th>Producto</th>
              </tr>
            </thead>
            <tbody>
              {pagos.map((pago) => (
                <tr key={pago._id}>
                  <td>{new Date(pago.fecha).toLocaleDateString()}</td>
                  <td>${pago.monto?.toFixed(2) || "N/A"}</td>
                  <td>{pago.metodoPago || "N/A"}</td>
                  <td>{pago.producto?.nombre || "N/A"}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}

      {/* Mensaje si no hay datos */}
      {!loading &&
        rutinas.length === 0 &&
        pagos.length === 0 &&
        numeroCedula &&
        !error && (
          <Alert variant="info" className="mt-3">
            No se encontraron rutinas ni pagos para el número de cédula
            ingresado.
          </Alert>
        )}
    </Container>
  );
};

export default ConsultaUsuario;
