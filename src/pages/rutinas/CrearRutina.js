import React, { useState, useEffect } from "react";
import { crearRutina, obtenerRutinas, editarRutina } from "../../api/axios";
import { useNavigate } from "react-router-dom";
import { Container, Form, Button, Table, Alert } from "react-bootstrap";

const CrearRutina = () => {
  const [formData, setFormData] = useState({
    grupoMuscular: "",
    nombreEjercicio: "",
    series: "",
    repeticiones: "",
    descripcion: "",
  });
  const [rutinas, setRutinas] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const navigate = useNavigate();

  // Verificar token al cargar el componente
  useEffect(() => {
    const token = localStorage.getItem("token");
    console.log("Token en localStorage:", token); // Depuración
    if (!token) {
      setError("Debes iniciar sesión para crear una rutina.");
      navigate("/login");
    }
  }, [navigate]);

  // Cargar las rutinas al montar el componente
  const fetchRutinas = async () => {
    try {
      const response = await obtenerRutinas();
      console.log("Rutinas obtenidas:", response.data); // Depuración
      setRutinas(response.data);
    } catch (err) {
      console.error("Error al obtener rutinas:", err);
      setError("Error al cargar las rutinas: " + err.message);
    }
  };

  useEffect(() => {
    fetchRutinas();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]:
        e.target.name === "series" || e.target.name === "repeticiones"
          ? Number(e.target.value)
          : e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      let response;
      if (editMode) {
        // Actualizar rutina existente
        response = await editarRutina(editId, formData);
        console.log("Respuesta del backend (editar):", response.data); // Depuración
        setSuccess("Rutina actualizada con éxito!");
        setEditMode(false);
        setEditId(null);
      } else {
        // Crear nueva rutina
        response = await crearRutina(formData);
        console.log("Respuesta del backend (crear):", response.data); // Depuración
        setSuccess("Rutina creada con éxito!");
      }

      // Limpiar el formulario
      setFormData({
        grupoMuscular: "",
        nombreEjercicio: "",
        series: "",
        repeticiones: "",
        descripcion: "",
      });
      // Recargar las rutinas para mostrar la actualización
      fetchRutinas();
    } catch (err) {
      console.error("Error al procesar rutina:", err.response?.data || err);
      if (err.response?.status === 401) {
        setError("Sesión expirada. Por favor, inicia sesión de nuevo.");
        localStorage.removeItem("token");
        navigate("/login");
      } else {
        setError(
          err.response?.data?.mensaje ||
            err.message ||
            "Error al procesar la rutina. Revisa los datos e intenta de nuevo."
        );
      }
    }
  };

  const handleEdit = (rutina) => {
    setEditMode(true);
    setEditId(rutina._id);
    setFormData({
      grupoMuscular: rutina.grupoMuscular,
      nombreEjercicio: rutina.nombreEjercicio,
      series: rutina.series,
      repeticiones: rutina.repeticiones,
      descripcion: rutina.descripcion || "",
    });
  };

  const ejerciciosPorGrupo = {
    Pecho: [
      "Press de banca",
      "Flexiones",
      "Aperturas con mancuernas",
      "Press inclinado",
      "Cruces en polea",
      "Fondos en paralelas",
      "Press declinado",
      "Pullover con mancuerna",
      "Push-up diamante",
      "Press con mancuernas",
    ],
    Piernas: [
      "Sentadillas",
      "Peso muerto",
      "Zancadas",
      "Prensa de piernas",
      "Extensiones de cuádriceps",
      "Peso muerto sumo",
      "Elevación de talones",
      "Step-ups",
      "Sentadilla frontal",
      "Curl femoral",
    ],
    Espalda: [
      "Dominadas",
      "Remo con barra",
      "Jalón al pecho",
      "Remo con mancuerna",
      "Peso muerto rumano",
      "Remo en máquina",
      "Face pull",
      "Pull-over con barra",
      "Hiperextensiones",
      "Jalón tras nuca",
    ],
    Brazos: [
      "Curl de bíceps con mancuernas",
      "Extensiones de tríceps en polea",
      "Martillo con mancuernas",
      "Press francés",
      "Curl de bíceps con barra",
      "Dips para tríceps",
      "Curl concentrado",
      "Extensiones sobre la cabeza",
      "Curl martillo con barra",
      "Kickback de tríceps",
    ],
    Hombros: [
      "Press militar",
      "Elevaciones laterales",
      "Elevaciones frontales",
      "Encogimientos de hombros",
      "Remo al mentón",
      "Press Arnold",
      "Elevaciones traseras",
      "Press con mancuernas",
      "Rotaciones externas",
      "Plancha con elevación",
    ],
    Abdomen: [
      "Plancha",
      "Crunches",
      "Elevaciones de piernas",
      "Russian twists",
      "Bicicleta abdominal",
      "Plancha lateral",
      "Mountain climbers",
      "Ab rollouts",
      "Leg raises colgando",
      "Vacío abdominal",
    ],
  };

  return (
    <Container className="mt-4">
      <h2>{editMode ? "Editar Rutina" : "Crear Rutina"}</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Grupo Muscular</Form.Label>
          <Form.Select
            name="grupoMuscular"
            value={formData.grupoMuscular}
            onChange={handleChange}
            required
          >
            <option value="">Seleccione un grupo muscular</option>
            <option value="Pecho">Pecho</option>
            <option value="Piernas">Piernas</option>
            <option value="Espalda">Espalda</option>
            <option value="Brazos">Brazos</option>
            <option value="Hombros">Hombros</option>
            <option value="Abdomen">Abdomen</option>
          </Form.Select>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Nombre del Ejercicio</Form.Label>
          <Form.Select
            name="nombreEjercicio"
            value={formData.nombreEjercicio}
            onChange={handleChange}
            required
          >
            <option value="">Seleccione un ejercicio</option>
            {formData.grupoMuscular &&
              ejerciciosPorGrupo[formData.grupoMuscular].map((ejercicio) => (
                <option key={ejercicio} value={ejercicio}>
                  {ejercicio}
                </option>
              ))}
          </Form.Select>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Series</Form.Label>
          <Form.Control
            type="number"
            name="series"
            value={formData.series}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Repeticiones</Form.Label>
          <Form.Control
            type="number"
            name="repeticiones"
            value={formData.repeticiones}
            onChange={handleChange}
            required
          />
        </Form.Group>

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
          {editMode ? "Actualizar Rutina" : "Crear Rutina"}
        </Button>
        {editMode && (
          <Button
            variant="secondary"
            className="ms-2"
            onClick={() => {
              setEditMode(false);
              setEditId(null);
              setFormData({
                grupoMuscular: "",
                nombreEjercicio: "",
                series: "",
                repeticiones: "",
                descripcion: "",
              });
            }}
          >
            Cancelar Edición
          </Button>
        )}
      </Form>

      {/* Sección para listar las rutinas creadas */}
      <div className="mt-5">
        <h3>Rutinas Creadas</h3>
        {rutinas.length === 0 ? (
          <p>No hay rutinas creadas aún.</p>
        ) : (
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Grupo Muscular</th>
                <th>Ejercicio</th>
                <th>Series</th>
                <th>Repeticiones</th>
                <th>Descripción</th>
                <th>Creado Por</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {rutinas.map((rutina) => (
                <tr key={rutina._id}>
                  <td>{rutina.grupoMuscular}</td>
                  <td>{rutina.nombreEjercicio}</td>
                  <td>{rutina.series}</td>
                  <td>{rutina.repeticiones}</td>
                  <td>{rutina.descripcion || "N/A"}</td>
                  <td>
                    {rutina.creadoPor ? rutina.creadoPor.nombre : "Desconocido"}
                  </td>
                  <td>
                    <Button
                      variant="warning"
                      size="sm"
                      onClick={() => handleEdit(rutina)}
                    >
                      Editar
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </div>
    </Container>
  );
};

export default CrearRutina;
