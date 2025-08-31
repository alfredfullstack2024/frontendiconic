import React, { useState, useEffect, useContext } from "react";
import { Container, Row, Col, Card } from "react-bootstrap";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContext"; // Si está en src/pages

const Indicadores = () => {
  const [indicadores, setIndicadores] = useState({
    clientesActivos: 0,
    clientesInactivos: 0,
    totalProductos: 0,
    existenciasTotales: 0,
    entrenadores: 0,
    clasesActivas: 0,
    membresiasActivas: 0,
    membresiasPorVencer: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchIndicadores = async () => {
      if (!user || !user.token) {
        setError("Debes iniciar sesión para ver los indicadores.");
        setLoading(false);
        return;
      }
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const response = await api.get("/indicadores", config);
        console.log("Datos de indicadores recibidos:", response.data);
        setIndicadores(response.data);
        setLoading(false);
      } catch (err) {
        console.error(
          "Error al cargar los indicadores:",
          err.response ? err.response.data : err
        );
        setError(
          "Error al cargar los indicadores: " +
            (err.response?.data?.message || "Recurso no encontrado.")
        );
        setLoading(false);
      }
    };

    fetchIndicadores();
  }, [user]);

  if (loading) return <Container>Cargando...</Container>;
  if (error) return <Container className="text-danger">{error}</Container>;

  return (
    <Container className="mt-4">
      <h2 className="text-center text-primary mb-4">Indicadores del Gimnasio</h2>
      <Row>
        <Col md={4} className="mb-4">
          <Card
            style={{
              background: "linear-gradient(135deg, #28a745, #218838)",
              borderRadius: "15px",
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
              transition: "transform 0.3s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            <Card.Body className="text-white text-center">
              <Card.Title>Clientes Activos</Card.Title>
              <Card.Text className="display-4">{indicadores.clientesActivos}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} className="mb-4">
          <Card
            style={{
              background: "linear-gradient(135deg, #007bff, #0056b3)",
              borderRadius: "15px",
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
              transition: "transform 0.3s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            <Card.Body className="text-white text-center">
              <Card.Title>Entrenadores</Card.Title>
              <Card.Text className="display-4">{indicadores.entrenadores}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} className="mb-4">
          <Card
            style={{
              background: "linear-gradient(135deg, #ffc107, #e0a800)",
              borderRadius: "15px",
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
              transition: "transform 0.3s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            <Card.Body className="text-white text-center">
              <Card.Title>Total de Productos</Card.Title>
              <Card.Text className="display-4">{indicadores.totalProductos}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} className="mb-4">
          <Card
            style={{
              background: "linear-gradient(135deg, #dc3545, #c82333)",
              borderRadius: "15px",
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
              transition: "transform 0.3s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            <Card.Body className="text-white text-center">
              <Card.Title>Membresías Activas</Card.Title>
              <Card.Text className="display-4">{indicadores.membresiasActivas}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} className="mb-4">
          <Card
            style={{
              background: "linear-gradient(135deg, #17a2b8, #138496)",
              borderRadius: "15px",
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
              transition: "transform 0.3s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            <Card.Body className="text-white text-center">
              <Card.Title>Membresías por Vencer (5 días)</Card.Title>
              <Card.Text className="display-4">{indicadores.membresiasPorVencer}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Indicadores;
