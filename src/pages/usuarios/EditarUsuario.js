import React, { useState, useEffect } from "react";
import { Form, Button, Alert, Card } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { obtenerUsuarios, editarUsuario } from "../../api/axios";

const EditarUsuario = () => {
  const { id } = useParams();
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    rol: "",
    password: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Cargar datos del usuario
  useEffect(() => {
    const fetchUsuario = async () => {
      try {
        const response = await obtenerUsuarios();
        const usuario = response.data.find((user) => user._id === id);
        if (!usuario) {
          throw new Error("Usuario no encontrado");
        }
        setFormData({
          nombre: usuario.nombre,
          email: usuario.email,
          rol: usuario.rol,
          password: "",
        });
      } catch (err) {
        const errorMessage = err.message;
        setError("Error al cargar el usuario: " + errorMessage);
      }
    };
    fetchUsuario();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validaciones básicas
    if (!formData.nombre || !formData.email) {
      setError("Por favor, completa todos los campos obligatorios.");
      return;
    }

    const datosEnvio = {
      nombre: formData.nombre,
      email: formData.email,
      rol: formData.rol,
    };
    if (formData.password) {
      datosEnvio.password = formData.password;
    }

    try {
      await editarUsuario(id, datosEnvio);
      navigate("/usuarios");
    } catch (err) {
      const errorMessage = err.message;
      setError("Error al actualizar el usuario: " + errorMessage);
    }
  };

  return (
    <div className="container mt-4">
      <h2>Editar Usuario</h2>

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
              <Form.Label>Nueva Contraseña (opcional)</Form.Label>
              <Form.Control
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Dejar en blanco para no cambiar"
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
              Actualizar Usuario
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

export default EditarUsuario;
