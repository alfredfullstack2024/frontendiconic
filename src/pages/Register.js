import React, { useState } from "react";
import { Form, Button, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

const Register = () => {
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await api.post("/auth/register", formData);
      navigate("/login");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "❌ Error al registrar usuario. Intenta de nuevo."
      );
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <div className="card p-4" style={{ width: "400px" }}>
        <h2 className="text-center mb-4">📝 Registro de Usuario</h2>

        {error && <Alert variant="danger">{error}</Alert>}

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Nombre:</Form.Label>
            <Form.Control
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              placeholder="Ingresa tu nombre"
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Email:</Form.Label>
            <Form.Control
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Ingresa tu email"
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Contraseña:</Form.Label>
            <Form.Control
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Ingresa tu contraseña"
              required
            />
          </Form.Group>

          <Button variant="primary" type="submit" className="w-100">
            Registrarse
          </Button>
        </Form>
      </div>
    </div>
  );
};

export default Register;
