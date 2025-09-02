import React, { useState, useEffect } from "react";
import { Table, Button, Modal, Form, Alert } from "react-bootstrap";
import api from "../api/axios";

const Productos = () => {
  const [productos, setProductos] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingProducto, setEditingProducto] = useState(null);
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    precio: "",
    stock: "",
    estado: "activo",
  });
  const [error, setError] = useState("");

  // Cargar productos al montar el componente
  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const response = await api.get("/productos");
        console.log("Datos recibidos de la API:", response.data);
        setProductos(response.data);
      } catch (err) {
        console.error(
          "Error al cargar productos:",
          err.response ? err.response.data : err.message
        );
        setError(
          "Error al cargar los productos: " +
            (err.response ? err.response.data.message : err.message)
        );
      }
    };
    fetchProductos();
  }, []);

  // Manejar cambios en el formulario
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Manejar el envío del formulario (crear o editar producto)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const productoData = {
        nombre: formData.nombre,
        descripcion: formData.descripcion,
        precio: parseFloat(formData.precio),
        stock: parseInt(formData.stock, 10),
        estado: formData.estado,
      };
      console.log("Datos enviados al backend:", productoData);

      if (editingProducto) {
        // Editar producto existente
        const response = await api.put(
          `/productos/${editingProducto._id}`,
          productoData
        );
        console.log("Producto editado:", response.data);
        setProductos(
          productos.map((producto) =>
            producto._id === editingProducto._id ? response.data : producto
          )
        );
      } else {
        // Crear nuevo producto
        const response = await api.post("/productos", productoData);
        console.log("Producto creado:", response.data);
        setProductos([...productos, response.data]);
      }
      setShowModal(false);
      setEditingProducto(null);
      setFormData({
        nombre: "",
        descripcion: "",
        precio: "",
        stock: "",
        estado: "activo",
      });
    } catch (err) {
      console.error(
        "Error al guardar producto:",
        err.response ? err.response.data : err.message
      );
      setError(
        "Error al guardar el producto: " +
          (err.response ? err.response.data.message : err.message)
      );
    }
  };

  // Abrir el modal para editar un producto
  const handleEdit = (producto) => {
    setEditingProducto(producto);
    setFormData({
      nombre: producto.nombre,
      descripcion: producto.descripcion || "",
      precio: producto.precio.toString(),
      stock: producto.stock.toString(),
      estado: producto.estado || "activo",
    });
    setShowModal(true);
  };

  // Eliminar un producto
  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este producto?")) {
      try {
        await api.delete(`/productos/${id}`);
        setProductos(productos.filter((producto) => producto._id !== id));
      } catch (err) {
        console.error(
          "Error al eliminar producto:",
          err.response ? err.response.data : err.message
        );
        setError(
          "Error al eliminar el producto: " +
            (err.response ? err.response.data.message : err.message)
        );
      }
    }
  };

  return (
    <div className="container mt-4">
      <h2>Lista de Productos</h2>

      {error && <Alert variant="danger">{error}</Alert>}

      <Button
        variant="primary"
        onClick={() => setShowModal(true)}
        className="mb-3"
      >
        Crear Producto
      </Button>

      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Descripción</th>
            <th>Precio</th>
            <th>Stock</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {productos.map((producto) => (
            <tr key={producto._id}>
              <td>{producto.nombre}</td>
              <td>{producto.descripcion || "N/A"}</td>
              <td>${producto.precio}</td>
              <td>{producto.stock}</td>
              <td>{producto.estado || "activo"}</td>
              <td>
                <Button
                  variant="warning"
                  size="sm"
                  onClick={() => handleEdit(producto)}
                  className="me-2"
                >
                  Editar
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDelete(producto._id)}
                >
                  Eliminar
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Modal para agregar/editar producto */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            {editingProducto ? "Editar Producto" : "Crear Producto"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Nombre</Form.Label>
              <Form.Control
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Descripción</Form.Label>
              <Form.Control
                type="text"
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Precio</Form.Label>
              <Form.Control
                type="number"
                name="precio"
                value={formData.precio}
                onChange={handleChange}
                required
                step="0.01"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Stock</Form.Label>
              <Form.Control
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                required
                min="0"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Estado</Form.Label>
              <Form.Select
                name="estado"
                value={formData.estado}
                onChange={handleChange}
              >
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
              </Form.Select>
            </Form.Group>
            <Button variant="primary" type="submit">
              {editingProducto ? "Guardar Cambios" : "Crear Producto"}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Productos;
