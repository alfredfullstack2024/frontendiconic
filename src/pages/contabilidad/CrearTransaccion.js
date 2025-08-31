import React, { useState } from "react";
import { Form, Button, Alert, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

const CrearTransaccion = () => {
  const [formData, setFormData] = useState({
    tipo: "ingreso", // Puede ser "ingreso" o "egreso"
    descripcion: "", // Cambiado de "concepto" a "descripcion"
    monto: "",
    fecha: "",
    metodoPago: "efectivo",
    cuentaDebito: "Caja", // Añadido para coincidir con el modelo
    cuentaCredito: "Ingresos", // Añadido para coincidir con el modelo
    referencia: "manual", // Añadido para coincidir con el modelo
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      console.log("Datos enviados para crear transacción:", formData); // Depuración
      const response = await api.post("/contabilidad/", formData); // Cambiado a "/contabilidad/"
      console.log("Respuesta del backend:", response.data); // Depuración
      navigate("/contabilidad"); // Redirige al listado de transacciones
    } catch (err) {
      const errorMessage = err.response?.data?.mensaje || err.message;
      setError("Error al crear la transacción: " + errorMessage);
      console.error("Detalles del error:", err.response?.data); // Depuración
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mt-4">
      <h2>Registrar Nueva Transacción</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      {isLoading && <Spinner animation="border" variant="primary" />}
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3" controlId="tipo">
          <Form.Label>Tipo de Transacción</Form.Label>
          <Form.Control
            as="select"
            name="tipo"
            value={formData.tipo}
            onChange={handleChange}
            required
          >
            <option value="ingreso">Ingreso</option>
            <option value="egreso">Egreso</option>
          </Form.Control>
        </Form.Group>

        <Form.Group className="mb-3" controlId="descripcion">
          <Form.Label>Descripción</Form.Label>
          <Form.Control
            type="text"
            name="descripcion"
            value={formData.descripcion}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="monto">
          <Form.Label>Monto</Form.Label>
          <Form.Control
            type="number"
            name="monto"
            value={formData.monto}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="fecha">
          <Form.Label>Fecha</Form.Label>
          <Form.Control
            type="date"
            name="fecha"
            value={formData.fecha}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="metodoPago">
          <Form.Label>Método de Pago</Form.Label>
          <Form.Control
            as="select"
            name="metodoPago"
            value={formData.metodoPago}
            onChange={handleChange}
          >
            <option value="efectivo">Efectivo</option>
            <option value="transferencia">Transferencia</option>
            <option value="tarjeta">Tarjeta</option>
          </Form.Control>
        </Form.Group>

        <Form.Group className="mb-3" controlId="cuentaDebito">
          <Form.Label>Cuenta Débito</Form.Label>
          <Form.Control
            as="select"
            name="cuentaDebito"
            value={formData.cuentaDebito}
            onChange={handleChange}
            required
          >
            <option value="Caja">Caja</option>
            <option value="Bancos">Bancos</option>
          </Form.Control>
        </Form.Group>

        <Form.Group className="mb-3" controlId="cuentaCredito">
          <Form.Label>Cuenta Crédito</Form.Label>
          <Form.Control
            as="select"
            name="cuentaCredito"
            value={formData.cuentaCredito}
            onChange={handleChange}
            required
          >
            <option value="Ingresos">Ingresos</option>
            <option value="Gastos">Gastos</option>
          </Form.Control>
        </Form.Group>

        <Form.Group className="mb-3" controlId="referencia">
          <Form.Label>Referencia</Form.Label>
          <Form.Control
            as="select"
            name="referencia"
            value={formData.referencia}
            onChange={handleChange}
            required
          >
            <option value="manual">Manual</option>
            <option value="factura">Factura</option>
          </Form.Control>
        </Form.Group>

        <Button variant="primary" type="submit" disabled={isLoading}>
          Registrar Transacción
        </Button>
      </Form>
    </div>
  );
};

export default CrearTransaccion;
