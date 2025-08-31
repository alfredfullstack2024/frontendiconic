import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";
import { Form, Button, Card } from "react-bootstrap";

const CrearProducto = () => {
  const navigate = useNavigate();
  const [producto, setProducto] = useState({
    nombre: "",
    precio: "",
    stock: "",
    categoria: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Convertir campos numéricos correctamente
    const parsedValue =
      name === "precio" || name === "stock" ? parseFloat(value) || "" : value;

    setProducto({ ...producto, [name]: parsedValue });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { nombre, precio, stock, categoria } = producto;

    if (!nombre || precio === "" || stock === "" || !categoria) {
      alert("⚠️ Todos los campos son obligatorios");
      return;
    }

    try {
      await axios.post("/productos", {
        nombre,
        precio: parseFloat(precio),
        stock: parseInt(stock),
        categoria,
      });
      alert("✅ Producto creado correctamente");
      navigate("/productos");
    } catch (error) {
      console.error(
        "❌ Error al crear producto:",
        error.response?.data || error.message
      );
      alert("❌ No se pudo crear el producto");
    }
  };

  return (
    <div className="container mt-5">
      <Card className="shadow">
        <Card.Header className="bg-dark text-white">
          📦 Crear nuevo producto
        </Card.Header>
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Nombre</Form.Label>
              <Form.Control
                type="text"
                name="nombre"
                value={producto.nombre}
                onChange={handleChange}
                placeholder="Nombre del producto"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Precio</Form.Label>
              <Form.Control
                type="number"
                name="precio"
                value={producto.precio}
                onChange={handleChange}
                placeholder="Precio del producto"
                required
                min="1"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Stock</Form.Label>
              <Form.Control
                type="number"
                name="stock"
                value={producto.stock}
                onChange={handleChange}
                placeholder="Cantidad en stock"
                required
                min="0"
              />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label>Categoría</Form.Label>
              <Form.Select
                name="categoria"
                value={producto.categoria}
                onChange={handleChange}
                required
              >
                <option value="">Seleccione una categoría</option>
                <option value="suplemento">Suplemento</option>
                <option value="ropa">Ropa</option>
                <option value="accesorio">Accesorio</option>
                <option value="servicio">Servicio</option>
              </Form.Select>
            </Form.Group>

            <div className="d-flex justify-content-between">
              <Button
                variant="secondary"
                onClick={() => navigate("/productos")}
              >
                ← Cancelar
              </Button>
              <Button type="submit" variant="primary">
                ✅ Crear producto
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
};

export default CrearProducto;
