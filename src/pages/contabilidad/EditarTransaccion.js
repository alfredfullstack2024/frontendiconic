import React, { useState, useEffect } from "react";
import { Form, Button, Alert, Col, Row } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/axios";

const EditarTransaccion = () => {
  const { id } = useParams();
  const [formData, setFormData] = useState({
    tipo: "egreso",
    monto: "",
    descripcion: "",
    fecha: "",
    categoria: "",
    cuentaDebito: "Caja",
    cuentaCredito: "Gastos",
    referencia: "manual",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTransaccion = async () => {
      try {
        const response = await api.get(`/contabilidad/${id}`);
        const transaccion = response.data;
        setFormData({
          tipo: transaccion.tipo,
          monto: transaccion.monto,
          descripcion: transaccion.descripcion,
          fecha: new Date(transaccion.fecha).toISOString().split("T")[0],
          categoria: transaccion.categoria || "",
          cuentaDebito: transaccion.cuentaDebito,
          cuentaCredito: transaccion.cuentaCredito,
          referencia: transaccion.referencia,
        });
      } catch (err) {
        setError("Error al cargar la transacción: " + err.message);
        if (err.message.includes("Sesión expirada")) {
          navigate("/login");
        }
      }
    };
    fetchTransaccion();
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/contabilidad/${id}`, formData);
      setSuccess("Transacción actualizada exitosamente");
      setError("");
      setTimeout(() => {
        navigate("/contabilidad");
      }, 2000);
    } catch (err) {
      setError("Error al actualizar la transacción: " + err.message);
      if (err.message.includes("Sesión expirada")) {
        navigate("/login");
      }
    }
  };

  return (
    <div className="container mt-4">
      <h2>Editar Transacción</h2>

      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      <Form onSubmit={handleSubmit}>
        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Tipo</Form.Label>
              <Form.Select
                name="tipo"
                value={formData.tipo}
                onChange={handleChange}
                required
              >
                <option value="egreso">Egreso</option>
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Categoría</Form.Label>
              <Form.Control
                type="text"
                name="categoria"
                value={formData.categoria}
                onChange={handleChange}
                placeholder="Ej. Mantenimiento, Baños, etc."
              />
            </Form.Group>
          </Col>
        </Row>

        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Monto</Form.Label>
              <Form.Control
                type="number"
                name="monto"
                value={formData.monto}
                onChange={handleChange}
                required
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Fecha</Form.Label>
              <Form.Control
                type="date"
                name="fecha"
                value={formData.fecha}
                onChange={handleChange}
                required
              />
            </Form.Group>
          </Col>
        </Row>

        <Form.Group className="mb-3">
          <Form.Label>Descripción</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            name="descripcion"
            value={formData.descripcion}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Button variant="primary" type="submit">
          Actualizar Transacción
        </Button>
        <Button
          variant="secondary"
          className="ms-2"
          onClick={() => navigate("/contabilidad")}
        >
          Cancelar
        </Button>
      </Form>
    </div>
  );
};

export default EditarTransaccion;
