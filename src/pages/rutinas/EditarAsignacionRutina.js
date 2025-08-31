import React, { useState, useEffect, useContext } from "react";
import {
  consultarRutinaPorNumeroIdentificacion,
  obtenerRutinas,
  editarAsignacionRutina,
  eliminarAsignacionRutina,
} from "../../api/axios";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Form,
  Button,
  Table,
  Alert,
  Row,
  Col,
  Spinner,
} from "react-bootstrap";
import { AuthContext } from "../../context/AuthContext";

const EditarAsignacionRutina = () => {
  const [cedula, setCedula] = useState("");
  const [rutinas, setRutinas] = useState([]);
  const [asignaciones, setAsignaciones] = useState([]);
  const [editMode, setEditMode] = useState(null); // ID de la asignación en edición
  const [editFormData, setEditFormData] = useState({
    rutinaId: "",
    diasEntrenamiento: [],
    diasDescanso: [],
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  // Verificar autenticación
  useEffect(() => {
    if (!user || !user.token) {
      setError("Debes iniciar sesión para editar asignaciones de rutinas.");
      navigate("/login");
    }
  }, [user, navigate]);

  // Cargar todas las rutinas disponibles para el formulario de edición
  useEffect(() => {
    const fetchRutinas = async () => {
      try {
        setLoading(true);
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const rutinasRes = await obtenerRutinas(config);
        setRutinas(rutinasRes.data);
      } catch (err) {
        setError(
          "Error al cargar rutinas: " +
            (err.response?.data?.message || err.message)
        );
      } finally {
        setLoading(false);
      }
    };
    if (user && user.token) fetchRutinas();
  }, [user]);

  // Limpiar mensajes de error/éxito después de 5 segundos
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError("");
        setSuccess("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  // Buscar asignaciones por número de cédula
  const handleSearch = async () => {
    if (!cedula) {
      setError("Por favor, ingresa un número de cédula.");
      return;
    }
    try {
      setLoading(true);
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const response = await consultarRutinaPorNumeroIdentificacion(
        cedula,
        config
      );
      const asignacionesData = Array.isArray(response.data)
        ? response.data
        : [];
      if (asignacionesData.length === 0) {
        setError("No se encontraron asignaciones para este cliente.");
        setAsignaciones([]);
      } else {
        setAsignaciones(asignacionesData);
        setError("");
      }
    } catch (err) {
      setError(
        "Error al buscar asignaciones: " +
          (err.response?.data?.message || err.message)
      );
      setAsignaciones([]);
    } finally {
      setLoading(false);
    }
  };

  // Iniciar modo de edición para una asignación
  const handleEditStart = (asignacion) => {
    setEditMode(asignacion._id);
    setEditFormData({
      rutinaId: asignacion.rutinaId?._id || "",
      diasEntrenamiento: asignacion.diasEntrenamiento || [],
      diasDescanso: asignacion.diasDescanso || [],
    });
  };

  // Cancelar edición
  const handleCancelEdit = () => {
    setEditMode(null);
    setEditFormData({
      rutinaId: "",
      diasEntrenamiento: [],
      diasDescanso: [],
    });
  };

  // Manejar cambios en el formulario de edición
  const handleEditChange = (e) => {
    setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
  };

  const handleEditDiasEntrenamiento = (e) => {
    const dias = Array.from(e.target.selectedOptions, (option) => option.value);
    setEditFormData({ ...editFormData, diasEntrenamiento: dias });
  };

  const handleEditDiasDescanso = (e) => {
    const dias = Array.from(e.target.selectedOptions, (option) => option.value);
    setEditFormData({ ...editFormData, diasDescanso: dias });
  };

  // Guardar cambios de la asignación editada
  const handleEditSubmit = async (asignacionId, clienteId) => {
    if (
      !editFormData.rutinaId ||
      editFormData.diasEntrenamiento.length === 0 ||
      editFormData.diasDescanso.length === 0
    ) {
      setError(
        "Todos los campos son obligatorios, incluyendo rutina, días de entrenamiento y descanso."
      );
      return;
    }
    try {
      setLoading(true);
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const updatedData = {
        clienteId: clienteId,
        rutinaId: editFormData.rutinaId,
        diasEntrenamiento: editFormData.diasEntrenamiento,
        diasDescanso: editFormData.diasDescanso,
      };
      await editarAsignacionRutina(asignacionId, updatedData, config);
      setSuccess("Asignación actualizada con éxito!");
      setEditMode(null);
      // Refrescar las asignaciones
      handleSearch();
    } catch (err) {
      setError(
        "Error al actualizar asignación: " +
          (err.response?.data?.message || err.message)
      );
    } finally {
      setLoading(false);
    }
  };

  // Eliminar una asignación
  const handleDelete = async (asignacionId) => {
    if (user.rol !== "admin") {
      setError("No tienes permisos para eliminar asignaciones.");
      return;
    }
    try {
      setLoading(true);
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await eliminarAsignacionRutina(asignacionId, config);
      setSuccess("Asignación eliminada con éxito!");
      // Refrescar las asignaciones
      handleSearch();
    } catch (err) {
      setError(
        "Error al eliminar asignación: " +
          (err.response?.data?.message || err.message)
      );
    } finally {
      setLoading(false);
    }
  };

  // Formatear fecha
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Container className="mt-4">
      <h2>Editar Asignación de Rutina</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}
      {loading && (
        <div className="text-center">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Cargando...</span>
          </Spinner>
        </div>
      )}

      {/* Formulario para buscar por cédula */}
      <Form className="mb-4">
        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Número de Cédula</Form.Label>
              <Form.Control
                type="text"
                value={cedula}
                onChange={(e) => setCedula(e.target.value)}
                placeholder="Ingresa el número de cédula"
                disabled={loading}
              />
            </Form.Group>
          </Col>
          <Col md={6} className="d-flex align-items-end">
            <Button variant="primary" onClick={handleSearch} disabled={loading}>
              Buscar
            </Button>
          </Col>
        </Row>
      </Form>

      {/* Tabla de asignaciones */}
      {asignaciones.length > 0 && (
        <div className="mt-5">
          <h3>Asignaciones del Cliente</h3>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Número de Identificación</th>
                <th>Rutina</th>
                <th>Grupo Muscular</th>
                <th>Series</th>
                <th>Repeticiones</th>
                <th>Descripción</th>
                <th>Días de Entrenamiento</th>
                <th>Días de Descanso</th>
                <th>Fecha de Asignación</th>
                <th>Asignada Por</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {asignaciones.map((asignacion) => (
                <tr key={asignacion._id}>
                  {editMode === asignacion._id ? (
                    <>
                      <td>
                        {asignacion.clienteId?.nombre}{" "}
                        {asignacion.clienteId?.apellido}
                      </td>
                      <td>{asignacion.numeroIdentificacion}</td>
                      <td>
                        <Form.Select
                          name="rutinaId"
                          value={editFormData.rutinaId}
                          onChange={handleEditChange}
                          required
                          disabled={loading}
                        >
                          <option value="">Seleccione una rutina</option>
                          {rutinas.map((rutina) => (
                            <option key={rutina._id} value={rutina._id}>
                              {rutina.nombreEjercicio} ({rutina.grupoMuscular})
                            </option>
                          ))}
                        </Form.Select>
                      </td>
                      <td>{asignacion.rutinaId?.grupoMuscular || "N/A"}</td>
                      <td>{asignacion.rutinaId?.series || "N/A"}</td>
                      <td>{asignacion.rutinaId?.repeticiones || "N/A"}</td>
                      <td>{asignacion.rutinaId?.descripcion || "N/A"}</td>
                      <td>
                        <Form.Select
                          multiple
                          name="diasEntrenamiento"
                          value={editFormData.diasEntrenamiento}
                          onChange={handleEditDiasEntrenamiento}
                          required
                          disabled={loading}
                        >
                          <option value="Lunes">Lunes</option>
                          <option value="Martes">Martes</option>
                          <option value="Miércoles">Miércoles</option>
                          <option value="Jueves">Jueves</option>
                          <option value="Viernes">Viernes</option>
                          <option value="Sábado">Sábado</option>
                          <option value="Domingo">Domingo</option>
                        </Form.Select>
                      </td>
                      <td>
                        <Form.Select
                          multiple
                          name="diasDescanso"
                          value={editFormData.diasDescanso}
                          onChange={handleEditDiasDescanso}
                          required
                          disabled={loading}
                        >
                          <option value="Lunes">Lunes</option>
                          <option value="Martes">Martes</option>
                          <option value="Miércoles">Miércoles</option>
                          <option value="Jueves">Jueves</option>
                          <option value="Viernes">Viernes</option>
                          <option value="Sábado">Sábado</option>
                          <option value="Domingo">Domingo</option>
                        </Form.Select>
                      </td>
                      <td>{formatDate(asignacion.createdAt)}</td>
                      <td>{asignacion.asignadaPor?.nombre || "N/A"}</td>
                      <td>
                        <Button
                          variant="success"
                          size="sm"
                          onClick={() =>
                            handleEditSubmit(
                              asignacion._id,
                              asignacion.clienteId?._id
                            )
                          }
                          disabled={loading}
                        >
                          Guardar
                        </Button>{" "}
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={handleCancelEdit}
                          disabled={loading}
                        >
                          Cancelar
                        </Button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td>
                        {asignacion.clienteId?.nombre}{" "}
                        {asignacion.clienteId?.apellido}
                      </td>
                      <td>{asignacion.numeroIdentificacion}</td>
                      <td>
                        {asignacion.rutinaId?.nombreEjercicio || "Desconocido"}
                      </td>
                      <td>{asignacion.rutinaId?.grupoMuscular || "N/A"}</td>
                      <td>{asignacion.rutinaId?.series || "N/A"}</td>
                      <td>{asignacion.rutinaId?.repeticiones || "N/A"}</td>
                      <td>{asignacion.rutinaId?.descripcion || "N/A"}</td>
                      <td>
                        {asignacion.diasEntrenamiento?.join(", ") || "N/A"}
                      </td>
                      <td>{asignacion.diasDescanso?.join(", ") || "N/A"}</td>
                      <td>{formatDate(asignacion.createdAt)}</td>
                      <td>{asignacion.asignadaPor?.nombre || "N/A"}</td>
                      <td>
                        <Button
                          variant="warning"
                          size="sm"
                          onClick={() => handleEditStart(asignacion)}
                          disabled={loading}
                        >
                          Editar
                        </Button>{" "}
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDelete(asignacion._id)}
                          disabled={loading || user.rol !== "admin"}
                        >
                          Eliminar
                        </Button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}
    </Container>
  );
};

export default EditarAsignacionRutina;
