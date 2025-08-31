import React, { useState, useEffect } from "react";
import { Form, Button, Alert, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";

const CrearMembresia = () => {
  const [formData, setFormData] = useState({
    cliente: "",
    tipo: "",
    duracion: "",
    precio: "",
    sesionesRestantes: "",
    fechainicio: new Date().toISOString().split("T")[0], // Fecha actual por defecto
  });
  const [clientes, setClientes] = useState([]);
  const [productos, setProductos] = useState([]);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");

        // Obtener clientes
        const clientesResponse = await axios.get("/clientes", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setClientes(
          Array.isArray(clientesResponse.data) ? clientesResponse.data : []
        );

        // Obtener productos (Mensualidad y Clase)
        const productosResponse = await axios.get("/productos", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const productosFiltrados = productosResponse.data.filter(
          (producto) =>
            producto.nombre === "Mensualidad" || producto.nombre === "Clase"
        );
        setProductos(productosFiltrados);
      } catch (err) {
        setError(`❌ Error al cargar los datos: ${err.message}`);
      } finally {
        setCargando(false);
      }
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.post("/membresias", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      navigate("/membresias");
    } catch (err) {
      setError(`❌ Error al crear la membresía: ${err.message}`);
    }
  };

  if (cargando) {
    return <Spinner animation="border" variant="primary" />;
  }

  return (
    <div>
      <h2>Crear Membresía</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3" controlId="cliente">
          <Form.Label>Cliente</Form.Label>
          <Form.Control
            as="select"
            name="cliente"
            value={formData.cliente}
            onChange={handleChange}
            required
          >
            <option value="">Selecciona un cliente</option>
            {clientes.map((cliente) => (
              <option key={cliente._id} value={cliente._id}>
                {cliente.nombre} {cliente.apellido || ""}
              </option>
            ))}
          </Form.Control>
        </Form.Group>

        <Form.Group className="mb-3" controlId="tipo">
          <Form.Label>Descripción</Form.Label>
          <Form.Control
            as="select"
            name="tipo"
            value={formData.tipo}
            onChange={handleChange}
            required
          >
            <option value="">Selecciona un tipo</option>
            <option value="Mensualidad">Mensualidad</option>
            <option value="Clase">Clase</option>
          </Form.Control>
        </Form.Group>

        <Form.Group className="mb-3" controlId="precio">
          <Form.Label>Precio</Form.Label>
          <Form.Control
            as="select"
            name="precio"
            value={formData.precio}
            onChange={handleChange}
            required
          >
            <option value="">Selecciona un precio</option>
            {productos.map((producto) => (
              <option key={producto._id} value={producto.precio}>
                {producto.nombre} - ${producto.precio}
              </option>
            ))}
          </Form.Control>
        </Form.Group>

        <Form.Group className="mb-3" controlId="duracion">
          <Form.Label>Duración (días)</Form.Label>
          <Form.Control
            type="number"
            name="duracion"
            value={formData.duracion}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="sesionesRestantes">
          <Form.Label>Sesiones Restantes</Form.Label>
          <Form.Control
            type="number"
            name="sesionesRestantes"
            value={formData.sesionesRestantes}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="fechainicio">
          <Form.Label>Fecha de Inicio</Form.Label>
          <Form.Control
            type="date"
            name="fechainicio"
            value={formData.fechainicio}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Button variant="primary" type="submit">
          Crear Membresía
        </Button>
      </Form>
    </div>
  );
};

export default CrearMembresia;
