import React, { useState } from "react";
import { Form, Button, Alert, Card } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { registrarse } from "../../api/axios";

const CrearUsuario = () => {
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    password: "",
    rol: "recepcionista",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validaciones básicas
    if (!formData.nombre || !formData.email || !formData.password) {
      setError("Por favor, completa todos los campos obligatorios.");
      return;
    }

    try {
      await registrarse(formData);
      navigate("/usuarios");
    } catch (err) {
      const errorMessage = err.message;
      setError("Error al crear el usuario: " + errorMessage);
    }
  };

  return (
    <div className="container mt-4">
      <h2>Crear Usuario</h2>

      {error && <Alert variant="danger">{error}</Alert>}

      <Card>
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="nombre">
              <Form.Label>Nombre</Form.Label>
              <Form.Control
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="email">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="password">
              <Form.Label>Contraseña</Form.Label>
              <Form.Control
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="rol">
              <Form.Label>Rol</Form.Label>
              <Form.Control
                as="select"
                name="rol"
                value={formData.rol}
                onChange={handleChange}
              >
                <option value="admin">Admin</option>
                <option value="recepcionista">Recepcionista</option>
                <option value="entrenador">Entrenador</option>
                <option value="user">Usuario</option>
              </Form.Control>
            </Form.Group>

            <Button variant="primary" type="submit">
              Crear Usuario
            </Button>
            <Button
              variant="secondary"
              className="ms-2"
              onClick={() => navigate("/usuarios")}
            >
              Cancelar
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
};

export default CrearUsuario;
