import React, { useState, useEffect } from "react";
import { Form, Button, Alert, Card } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

const PagoRapido = () => {
  const [formData, setFormData] = useState({
    clienteManual: "",
    productoManual: "",
    monto: "",
    fecha: new Date().toISOString().split("T")[0],
    metodoPago: "Efectivo",
  });
  const [error, setError] = useState("");
  const [showTiquete, setShowTiquete] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/pagos/pago-rapido", formData);
      setShowTiquete(true);
      alert("¡Pago Rápido Registrado! Ahora puedes imprimir el tiquete.");
    } catch (err) {
      setError("Error al registrar el pago rápido.");
    }
  };

  const imprimirTiquete = () => {
    const printContent = document.getElementById("tiquete-rapido").innerHTML;
    const win = window.open("", "", "height=500,width=300");
    win.document.write(`<html><head><title>Tiquete</title></head><body>${printContent}</body></html>`);
    win.document.close();
    win.print();
    win.close();
    navigate("/pagos");
  };

  return (
    <div className="container mt-4">
      <h2 style={{ color: "red", fontWeight: "bold" }}>PAGO RÁPIDO</h2>
      {error && <Alert variant="danger">{error}</Alert>}

      <Card className="border-danger">
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Nombre del Cliente (Escribir)</Form.Label>
              <Form.Control name="clienteManual" onChange={handleChange} required placeholder="Ej: Juan Pérez" />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Concepto / Producto</Form.Label>
              <Form.Control name="productoManual" onChange={handleChange} required placeholder="Ej: Mensualidad Pesas" />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Monto ($)</Form.Label>
              <Form.Control type="number" name="monto" onChange={handleChange} required />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Método de Pago</Form.Label>
              <Form.Select name="metodoPago" onChange={handleChange}>
                <option value="Efectivo">Efectivo</option>
                <option value="Transferencia">Transferencia</option>
                <option value="Tarjeta">Tarjeta</option>
              </Form.Select>
            </Form.Group>

            <Button variant="danger" type="submit" className="w-100">Registrar y Generar Tiquete</Button>
          </Form>

          {showTiquete && (
            <div className="mt-4 text-center">
              <div id="tiquete-rapido" style={{ border: "1px solid black", padding: "10px", textAlign: "left", width: "250px", margin: "0 auto", fontFamily: "monospace" }}>
                <h3 style={{ textAlign: "center" }}>ICONIC ALL STARS</h3>
                <p>FECHA: {formData.fecha}</p>
                <p>CLIENTE: {formData.clienteManual.toUpperCase()}</p>
                <hr />
                <p>CONCEPTO: {formData.productoManual}</p>
                <p>TOTAL: ${Number(formData.monto).toLocaleString()}</p>
                <p>METODO: {formData.metodoPago}</p>
                <p style={{ fontSize: "10px" }}>Pago rápido - Registro manual</p>
              </div>
              <Button variant="primary" className="mt-3" onClick={imprimirTiquete}>Imprimir Tiquete</Button>
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default PagoRapido;
