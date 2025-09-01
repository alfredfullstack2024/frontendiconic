// src/pages/Login.js
import React, { useState } from "react";
import { Form, Button, Alert, Card } from "react-bootstrap";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const { login } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((s) => ({ ...s, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const result = await login(formData.email, formData.password);
    if (!result.success) {
      setError(result.message || "Error al iniciar sesión");
    }
  };

  return (
    <div className="container mt-5">
      <h2>Iniciar Sesión</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      <Card style={{ maxWidth: 420, margin: "0 auto" }}>
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="email">
              <Form.Label>Email</Form.Label>
              <Form.Control type="email" name="email" value={formData.email} onChange={handleChange} required />
            </Form.Group>
            <Form.Group className="mb-3" controlId="password">
              <Form.Label>Contraseña</Form.Label>
              <Form.Control type="password" name="password" value={formData.password} onChange={handleChange} required />
            </Form.Group>
            <Button variant="primary" type="submit" className="w-100">Iniciar Sesión</Button>
          </Form>
        </Card.Body>
      </Card>
      <div className="text-center mt-3" style={{ fontStyle: "italic", color: "#666" }}>
        Nota: si el servidor estuvo inactivo puede tardar unos segundos en responder al primer intento.
      </div>
    </div>
  );
};

export default Login;
