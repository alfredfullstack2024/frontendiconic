import React, { useState, useEffect } from "react";
import {
  Container,
  Table,
  Button,
  Form,
  Alert,
  Spinner,
} from "react-bootstrap";
import {
  obtenerClasesDisponibles,
  registrarClienteEnClase,
} from "../../api/axios";

const ListaClases = () => {
  const [clases, setClases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [numeroIdentificacion, setNumeroIdentificacion] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");

        if (!token) {
          setError("Debes iniciar sesión para ver las clases.");
          setLoading(false);
          return;
        }

        const config = { headers: { Authorization: `Bearer ${token}` } };

        const clasesResponse = await obtenerClasesDisponibles(config);
        setClases(clasesResponse.data || []);
        setError(null);
      } catch (err) {
        setError(
          err.response?.data?.message || "No se pudieron cargar las clases."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleRegistrar = async (clase) => {
    if (!numeroIdentificacion) {
      setError("Por favor, ingrese un número de identificación.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };

      await registrarClienteEnClase(
        {
          numeroIdentificacion,
          entrenadorId: clase.entrenadorId,
          nombreClase: clase.nombreClase,
          dia: clase.dia,
          horarioInicio: clase.horarioInicio,
          horarioFin: clase.horarioFin,
        },
        config
      );

      setSuccess("Cliente registrado exitosamente en la clase.");
      setError(null);

      setClases((prev) =>
        prev.map((c) =>
          c.entrenadorId === clase.entrenadorId &&
          c.nombreClase === clase.nombreClase &&
          c.dia === clase.dia &&
          c.horarioInicio === clase.horarioInicio &&
          c.horarioFin === clase.horarioFin
            ? { ...c, capacidadMaxima: c.capacidadMaxima - 1 }
            : c
        )
      );
      setNumeroIdentificacion(""); // Limpiar el campo después de registrar
    } catch (err) {
      setError(err.response?.data?.message || "Error al registrar el cliente.");
      setSuccess(null);
    }
  };

  return (
    <Container className="mt-4">
      <h2 className="mb-4">Lista de Clases Disponibles</h2>

      {loading && (
        <div className="text-center">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2">Cargando clases...</p>
        </div>
      )}

      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      {!loading && (
        <>
          <Form.Group className="mb-3">
            <Form.Label>Número de Identificación</Form.Label>
            <Form.Control
              type="text"
              value={numeroIdentificacion}
              onChange={(e) => setNumeroIdentificacion(e.target.value)}
              placeholder="Ingrese el número de identificación"
              required
            />
          </Form.Group>

          {clases.length === 0 ? (
            <p>No hay clases disponibles.</p>
          ) : (
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>Entrenador</th>
                  <th>Especialidad</th>
                  <th>Clase</th>
                  <th>Día</th>
                  <th>Horario</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {clases.map((clase, index) => (
                  <tr key={index}>
                    <td>{clase.entrenadorNombre}</td>
                    <td>{clase.especialidad}</td>
                    <td>{clase.nombreClase}</td>
                    <td>{clase.dia}</td>
                    <td>
                      {clase.horarioInicio} - {clase.horarioFin}
                    </td>
                    <td>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleRegistrar(clase)}
                        disabled={
                          clase.capacidadMaxima <= 0 || !numeroIdentificacion
                        }
                      >
                        Registrarse
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </>
      )}
    </Container>
  );
};

export default ListaClases;
