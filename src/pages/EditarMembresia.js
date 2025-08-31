import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "../api/axios";
import { Form, Button, Alert, Row, Spinner } from "react-bootstrap";

const EditarMembresia = () => {
  const { id } = useParams();
  const [membresia, setMembresia] = useState({
    tipo: "",
    duracion: "",
    precio: "",
    sesionesRestantes: "",
    cliente: "",
  });
  const [clientes, setClientes] = useState([]);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMembresiaYClientes = async () => {
      try {
        const token = localStorage.getItem("token");

        // Cargar clientes
        const clientesResponse = await axios.get("/clientes", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const clientesData = Array.isArray(clientesResponse.data)
          ? clientesResponse.data
          : Array.isArray(clientesResponse.data.clientes)
          ? clientesResponse.data.clientes
          : [];
        setClientes(clientesData);

        // Cargar membresía
        const response = await axios.get(`/membresias/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMembresia({
          tipo: response.data.tipo || "",
          duracion: response.data.duracion || "",
          precio: response.data.precio || "",
          sesionesRestantes: response.data.sesionesRestantes || "",
          cliente: response.data.cliente?._id || "",
        });
      } catch (err) {
        setError(`❌ Error al cargar los datos: ${err.message}`);
      } finally {
        setCargando(false);
      }
    };
    fetchMembresiaYClientes();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMensaje("");

    try {
      setEnviando(true);
      const token = localStorage.getItem("token");
      await axios.put(`/membresias/${id}`, membresia, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMensaje("✅ Membresía actualizada exitosamente");
      setTimeout(() => navigate("/membresias"), 2000);
    } catch (err) {
      setError(
        `❌ Error al actualizar la membresía: ${
          err.response?.data?.error || err.message
        }`
      );
    } finally {
      setEnviando(false);
    }
  };

  if (cargando) {
    return <Spinner animation="border" variant="primary" />;
  }

  return (
    <div>
      <h2 className="text-primary mb-4" style={{ fontWeight: "bold" }}>
        📝 Editar Membresía
      </h2>

      {mensaje && <Alert variant="success">{mensaje}</Alert>}
      {error && <Alert variant="danger">{error}</Alert>}

      <Form onSubmit={handleSubmit}>
        <Row>
          <Form.Group className="col-md-6 mb-3">
            <Form.Label>Cliente</Form.Label>
            <Form.Select
              value={membresia.cliente}
              onChange={(e) =>
                setMembresia({ ...membresia, cliente: e.target.value })
              }
              required
            >
              <option value="">Selecciona un cliente</option>
              {clientes.length > 0 ? (
                clientes.map((cliente) => (
                  <option key={cliente._id} value={cliente._id}>
                    {`${cliente.nombre} ${cliente.apellido || ""}`}
                  </option>
                ))
              ) : (
                <option disabled>No hay clientes disponibles</option>
              )}
            </Form.Select>
          </Form.Group>

          <Form.Group className="col-md-6 mb-3">
            <Form.Label>Tipo</Form.Label>
            <Form.Control
              type="text"
              value={membresia.tipo}
              onChange={(e) =>
                setMembresia({ ...membresia, tipo: e.target.value })
              }
              required
            />
          </Form.Group>

          <Form.Group className="col-md-6 mb-3">
            <Form.Label>Duración (días)</Form.Label>
            <Form.Control
              type="number"
              value={membresia.duracion}
              onChange={(e) =>
                setMembresia({ ...membresia, duracion: e.target.value })
              }
              required
              min="1"
            />
          </Form.Group>

          <Form.Group className="col-md-6 mb-3">
            <Form.Label>Precio</Form.Label>
            <Form.Control
              type="number"
              value={membresia.precio}
              onChange={(e) =>
                setMembresia({ ...membresia, precio: e.target.value })
              }
              required
              min="0"
              step="0.01"
            />
          </Form.Group>

          <Form.Group className="col-md-6 mb-3">
            <Form.Label>Sesiones Restantes</Form.Label>
            <Form.Control
              type="number"
              value={membresia.sesionesRestantes}
              onChange={(e) =>
                setMembresia({
                  ...membresia,
                  sesionesRestantes: e.target.value,
                })
              }
              required
              min="0"
            />
          </Form.Group>
        </Row>

        <Button
          type="submit"
          variant="danger"
          disabled={enviando}
          className="mt-3 w-100"
        >
          {enviando ? "Actualizando..." : "Actualizar Membresía"}
        </Button>
      </Form>
    </div>
  );
};

export default EditarMembresia;
