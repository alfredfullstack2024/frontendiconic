import React, { useState, useEffect } from "react";
import { Container, Form, Button, Table, Alert } from "react-bootstrap";
import {
  consultarRutinaPorNumeroIdentificacion,
  consultarPagosPorCedula,
  consultarClasesPorNumeroIdentificacion,
} from "../api/axios";
import { useNavigate } from "react-router-dom";

const ConsultarRutina = () => {
  const [numeroIdentificacion, setNumeroIdentificacion] = useState("");
  const [rutinas, setRutinas] = useState([]);
  const [pagos, setPagos] = useState([]);
  const [clases, setClases] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Limpiar mensajes de error/éxito después de 5 segundos
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError(null);
        setSuccess(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  const handleConsultar = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setRutinas([]);
    setPagos([]);
    setClases([]);
    setLoading(true);

    if (!numeroIdentificacion) {
      setError("Por favor, ingrese un número de identificación.");
      setLoading(false);
      return;
    }

    const cleanNumeroIdentificacion = numeroIdentificacion.replace(
      /[^0-9]/g,
      ""
    );
    console.log(
      "Consultando con numeroIdentificacion:",
      cleanNumeroIdentificacion
    );

    try {
      // Consultar rutinas (sin token, asumiendo que la API lo permite públicamente)
      const rutinasResponse = await consultarRutinaPorNumeroIdentificacion(
        cleanNumeroIdentificacion
      );
      console.log("Rutinas obtenidas:", rutinasResponse.data);
      const rutinasData = Array.isArray(rutinasResponse.data)
        ? rutinasResponse.data
        : [];
      setRutinas(rutinasData);

      // Consultar pagos
      const pagosResponse = await consultarPagosPorCedula(
        cleanNumeroIdentificacion
      );
      console.log("Pagos obtenidos:", pagosResponse.data);
      const pagosData = Array.isArray(pagosResponse.data)
        ? pagosResponse.data
        : [];
      setPagos(pagosData);

      // Consultar clases registradas
      const clasesResponse = await consultarClasesPorNumeroIdentificacion(
        cleanNumeroIdentificacion
      );
      console.log("Clases obtenidas:", clasesResponse.data);
      const clasesData = Array.isArray(clasesResponse.data)
        ? clasesResponse.data
        : [];
      setClases(clasesData);

      if (
        rutinasData.length === 0 &&
        pagosData.length === 0 &&
        clasesData.length === 0
      ) {
        setError("No se encontraron datos para este número de identificación.");
      } else {
        setSuccess("Datos cargados exitosamente.");
      }
    } catch (err) {
      console.error(
        "Error al consultar datos:",
        err.response ? err.response.data : err.message
      );
      setError(
        err.response?.data?.mensaje ||
          err.message ||
          "Error al consultar los datos. Asegúrate de que la API permita acceso público."
      );
    } finally {
      setLoading(false);
    }
  };

  // Formatear fecha
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Container className="mt-4">
      <h2 className="mb-4">Consultar Rutina y Más</h2>

      <Form onSubmit={handleConsultar}>
        <Form.Group className="mb-3">
          <Form.Label>Número de Identificación</Form.Label>
          <Form.Control
            type="text"
            value={numeroIdentificacion}
            onChange={(e) => setNumeroIdentificacion(e.target.value)}
            placeholder="Ingrese su número de identificación"
            required
            disabled={loading}
          />
        </Form.Group>
        <Button variant="primary" type="submit" disabled={loading}>
          Consultar
        </Button>
      </Form>

      {error && (
        <Alert variant="danger" className="mt-3">
          {error}
        </Alert>
      )}
      {success && (
        <Alert variant="success" className="mt-3">
          {success}
        </Alert>
      )}

      {/* Sección de Rutinas */}
      {rutinas.length > 0 ? (
        <>
          <h3 className="mt-4">Rutinas Asignadas</h3>
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>Rutina</th>
                <th>Grupo Muscular</th>
                <th>Series</th>
                <th>Repeticiones</th>
                <th>Descripción</th>
                <th>Días de Entrenamiento</th>
                <th>Días de Descanso</th>
                <th>Fecha de Asignación</th>
                <th>Asignada Por</th>
              </tr>
            </thead>
            <tbody>
              {rutinas.map((rutina, index) => (
                <tr key={rutina._id || index}>
                  <td>{rutina.rutinaId?.nombreEjercicio || "Desconocido"}</td>
                  <td>{rutina.rutinaId?.grupoMuscular || "N/A"}</td>
                  <td>{rutina.rutinaId?.series || "N/A"}</td>
                  <td>{rutina.rutinaId?.repeticiones || "N/A"}</td>
                  <td>{rutina.rutinaId?.descripcion || "N/A"}</td>
                  <td>
                    {Array.isArray(rutina.diasEntrenamiento)
                      ? rutina.diasEntrenamiento.join(", ")
                      : "N/A"}
                  </td>
                  <td>
                    {Array.isArray(rutina.diasDescanso)
                      ? rutina.diasDescanso.join(", ")
                      : "N/A"}
                  </td>
                  <td>{formatDate(rutina.createdAt)}</td>
                  <td>{rutina.asignadaPor?.nombre || "N/A"}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </>
      ) : (
        <Alert variant="info" className="mt-3">
          No se encontraron rutinas asignadas.
        </Alert>
      )}

      {/* Sección de Pagos */}
      {pagos.length > 0 ? (
        <>
          <h3 className="mt-4">Pagos Realizados</h3>
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>Monto</th>
                <th>Fecha de Pago</th>
                <th>Método de Pago</th>
                <th>Concepto</th>
              </tr>
            </thead>
            <tbody>
              {pagos.map((pago, index) => (
                <tr key={pago._id || index}>
                  <td>{pago.monto}</td>
                  <td>{formatDate(pago.fechaPago)}</td>
                  <td>{pago.metodoPago}</td>
                  <td>{pago.concepto}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </>
      ) : (
        <Alert variant="info" className="mt-3">
          No se encontraron pagos realizados.
        </Alert>
      )}

      {/* Sección de Clases Inscritas */}
      {clases.length > 0 ? (
        <>
          <h3 className="mt-4">Clases Inscritas</h3>
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>Nombre Completo</th>
                <th>Entrenador</th>
                <th>Clase</th>
                <th>Día</th>
                <th>Horario</th>
              </tr>
            </thead>
            <tbody>
              {clases.map((clase, index) => (
                <tr key={clase._id || index}>
                  <td>{clase.nombreCompleto}</td>
                  <td>{clase.entrenadorNombre}</td>
                  <td>{clase.nombreClase}</td>
                  <td>{clase.dia}</td>
                  <td>
                    {clase.horarioInicio} - {clase.horarioFin}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </>
      ) : (
        <Alert variant="info" className="mt-3">
          No se encontraron clases inscritas.
        </Alert>
      )}
    </Container>
  );
};

export default ConsultarRutina;
