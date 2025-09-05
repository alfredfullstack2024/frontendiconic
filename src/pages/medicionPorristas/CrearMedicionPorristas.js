import React, { useState, useEffect, useMemo } from "react";
import {
  crearMedicionPorristas,
  obtenerMedicionesPorristas,
  editarMedicionPorristas,
  obtenerEntrenadores,
  obtenerClientes,
} from "../../api/axios";
import { useNavigate } from "react-router-dom";
import { Container, Form, Button, Table, Alert, Row, Col } from "react-bootstrap";

const CrearMedicionPorristas = () => {
  const [formData, setFormData] = useState({
    clienteId: "",
    entrenadorId: "",
    equipo: "",
    categoria: "",
    posicion: "",
    ejercicios: [],
    descripcion: "",
  });
  const [clientes, setClientes] = useState([]);
  const [entrenadores, setEntrenadores] = useState([]);
  const [mediciones, setMediciones] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [nuevoEjercicio, setNuevoEjercicio] = useState({
    nombre: "",
    calificacion: "",
  });
  const [busqueda, setBusqueda] = useState("");
  const navigate = useNavigate();

  // Generamos todas las combinaciones posibles
  const categorias = (() => {
    const categoriasBase = ["Tiny", "Mini", "Youth", "Junior", "Senior", "Open"];
    const niveles = [1, 2, 3, 4, 5, 6, 7];
    const divisiones = ["Femenino", "Coed"];
    const result = [];

    categoriasBase.forEach((cat) => {
      niveles.forEach((nivel) => {
        divisiones.forEach((div) => {
          result.push(`${cat} Nivel ${nivel} - ${div}`);
        });
      });
    });

    return result;
  })();

  const posiciones = ["Flyer", "Base", "Spotter", "Backspot", "Frontspot"];

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Debes iniciar sesión para crear una medición.");
      navigate("/login");
    }
  }, [navigate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [clientesResponse, entrenadoresResponse, medicionesResponse] =
        await Promise.all([
          obtenerClientes(),
          obtenerEntrenadores(),
          obtenerMedicionesPorristas(),
        ]);
      setClientes(clientesResponse.data);
      setEntrenadores(entrenadoresResponse.data);
      setMediciones(medicionesResponse.data);
    } catch (err) {
      setError("Error al cargar datos: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (formData.entrenadorId) {
      const entrenador = entrenadores.find(
        (e) => e._id === formData.entrenadorId
      );
      const especialidades = Array.isArray(entrenador?.especialidad)
        ? entrenador.especialidad
        : [entrenador?.especialidad || "Sin especialidad"];
      setFormData((prev) => ({
        ...prev,
        equipo: especialidades.length > 0 ? especialidades[0] : "Sin especialidad",
      }));
    } else {
      setFormData((prev) => ({ ...prev, equipo: "" }));
    }
  }, [formData.entrenadorId, entrenadores]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleEjercicioChange = (e) => {
    setNuevoEjercicio({
      ...nuevoEjercicio,
      [e.target.name]:
        e.target.name === "calificacion" ? Number(e.target.value) : e.target.value,
    });
  };

  const añadirEjercicio = () => {
    if (
      nuevoEjercicio.nombre &&
      nuevoEjercicio.calificacion >= 1 &&
      nuevoEjercicio.calificacion <= 10
    ) {
      setFormData((prev) => ({
        ...prev,
        ejercicios: [...prev.ejercicios, { ...nuevoEjercicio }],
      }));
      setNuevoEjercicio({ nombre: "", calificacion: "" });
    } else {
      setError("El ejercicio debe tener nombre y calificación entre 1 y 10.");
    }
  };

  const eliminarEjercicio = (index) => {
    setFormData((prev) => ({
      ...prev,
      ejercicios: prev.ejercicios.filter((_, i) => i !== index),
    }));
  };

  const ponderacion = useMemo(() => {
    if (formData.ejercicios.length === 0) return 0;
    const sum = formData.ejercicios.reduce(
      (acc, ej) => acc + (ej.calificacion || 0),
      0
    );
    return (sum / formData.ejercicios.length).toFixed(2);
  }, [formData.ejercicios]);

  const pasaNivel = Number(ponderacion) >= 7;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      let response;
      if (editMode) {
        response = await editarMedicionPorristas(editId, formData);
        setSuccess("Medición actualizada con éxito!");
        setEditMode(false);
        setEditId(null);
        const updatedMediciones = await obtenerMedicionesPorristas();
        setMediciones(updatedMediciones.data);
      } else {
        response = await crearMedicionPorristas(formData);
        setSuccess("Medición creada con éxito!");
        fetchData();
      }

      setFormData({
        clienteId: "",
        entrenadorId: "",
        equipo: "",
        categoria: "",
        posicion: "",
        ejercicios: [],
        descripcion: "",
      });
    } catch (err) {
      setError(err.response?.data?.mensaje || "Error al procesar la medición.");
    }
  };

  const handleEdit = (medicion) => {
    setEditMode(true);
    setEditId(medicion._id);
    setFormData({
      clienteId: medicion.clienteId._id,
      entrenadorId: medicion.entrenadorId._id,
      equipo: medicion.equipo,
      categoria: medicion.categoria,
      posicion: medicion.posicion,
      ejercicios: medicion.ejercicios || [],
      descripcion: medicion.descripcion || "",
    });
  };

  const especialidadesPorEntrenador = Array.isArray(
    entrenadores.find((e) => e._id === formData.entrenadorId)?.especialidad
  )
    ? entrenadores.find((e) => e._id === formData.entrenadorId)?.especialidad
    : [
        entrenadores.find((e) => e._id === formData.entrenadorId)?.especialidad ||
          "Sin especialidad",
      ];

  const clientesFiltrados = useMemo(() => {
    return clientes.filter((cliente) =>
      (cliente.nombre + " " + cliente.apellido)
        .toLowerCase()
        .includes(busqueda.toLowerCase())
    );
  }, [clientes, busqueda]);

  const medicionesFiltradas = useMemo(() => {
    return mediciones.filter((medicion) =>
      (medicion.clienteId?.nombre + " " + medicion.clienteId?.apellido)
        .toLowerCase()
        .includes(busqueda.toLowerCase())
    );
  }, [mediciones, busqueda]);

  const calcularPonderacion = (ejercicios) => {
    if (!Array.isArray(ejercicios) || ejercicios.length === 0) return "0.00";
    const validEjercicios = ejercicios.filter(
      (ej) => ej.calificacion && !isNaN(ej.calificacion)
    );
    if (validEjercicios.length === 0) return "0.00";
    const sum = validEjercicios.reduce(
      (acc, ej) => acc + Number(ej.calificacion),
      0
    );
    return (sum / validEjercicios.length).toFixed(2);
  };

  return (
    <Container className="mt-4">
      <h2>{editMode ? "Editar Medición Porristas" : "Crear Medición Porristas"}</h2>
      {loading && <Alert variant="info">Cargando datos...</Alert>}
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}
      {!loading && (
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Buscar Deportista</Form.Label>
            <Form.Control
              type="text"
              placeholder="Escribe nombre o apellido..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Deportista (Cliente)</Form.Label>
            <Form.Select
              name="clienteId"
              value={formData.clienteId}
              onChange={handleChange}
              required
            >
              <option value="">Seleccione un cliente</option>
              {clientesFiltrados.map((cliente) => (
                <option key={cliente._id} value={cliente._id}>
                  {cliente.nombre + " " + cliente.apellido}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Entrenador</Form.Label>
            <Form.Select
              name="entrenadorId"
              value={formData.entrenadorId}
              onChange={handleChange}
              required
            >
              <option value="">Seleccione un entrenador</option>
              {entrenadores.map((entrenador) => (
                <option key={entrenador._id} value={entrenador._id}>
                  {entrenador.nombre + " " + entrenador.apellido}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Especialidad</Form.Label>
            <Form.Select
              name="equipo"
              value={formData.equipo}
              onChange={handleChange}
              required
              disabled={!formData.entrenadorId}
            >
              <option value="">Seleccione una especialidad</option>
              {especialidadesPorEntrenador.length > 0 ? (
                especialidadesPorEntrenador.map((esp, index) => (
                  <option key={index} value={esp}>
                    {esp}
                  </option>
                ))
              ) : (
                <option value="Sin especialidad">Sin especialidad</option>
              )}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Categoría</Form.Label>
            <Form.Select
              name="categoria"
              value={formData.categoria}
              onChange={handleChange}
              required
            >
              <option value="">Seleccione una categoría</option>
              {categorias.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Posición</Form.Label>
            <Form.Select
              name="posicion"
              value={formData.posicion}
              onChange={handleChange}
              required
            >
              <option value="">Seleccione una posición</option>
              {posiciones.map((pos) => (
                <option key={pos} value={pos}>
                  {pos}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Ejercicios</Form.Label>
            <Row>
              <Col md={6}>
                <Form.Control
                  type="text"
                  name="nombre"
                  placeholder="Nombre del ejercicio"
                  value={nuevoEjercicio.nombre}
                  onChange={handleEjercicioChange}
                />
              </Col>
              <Col md={3}>
                <Form.Control
                  type="number"
                  name="calificacion"
                  placeholder="Calificación (1-10)"
                  value={nuevoEjercicio.calificacion}
                  onChange={handleEjercicioChange}
                  min={1}
                  max={10}
                />
              </Col>
              <Col md={3}>
                <Button variant="secondary" onClick={añadirEjercicio}>
                  Añadir Ejercicio
                </Button>
              </Col>
            </Row>
            {formData.ejercicios.length > 0 && (
              <Table striped bordered hover className="mt-3">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Calificación</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.ejercicios.map((ej, index) => (
                    <tr key={index}>
                      <td>{ej.nombre}</td>
                      <td>{ej.calificacion}</td>
                      <td>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => eliminarEjercicio(index)}
                        >
                          Eliminar
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </Form.Group>

          <Alert variant="info">
            Ponderación: {ponderacion} - {pasaNivel ? "Pasa Nivel" : "No Pasa Nivel"}
          </Alert>

          <Form.Group className="mb-3">
            <Form.Label>Descripción (Opcional)</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
            />
          </Form.Group>

          <Button variant="primary" type="submit">
            {editMode ? "Actualizar Medición" : "Crear Med
