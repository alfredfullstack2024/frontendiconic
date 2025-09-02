import React, { useState, useEffect } from "react";
import { Table, Button, Alert, Spinner, Form } from "react-bootstrap";
import { Link } from "react-router-dom";
import axios from "../api/axios";
import moment from "moment";

const Membresias = () => {
  const [membresias, setMembresias] = useState([]);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(true);
  const [filtro, setFiltro] = useState("todas"); // filtro vencidas/todas
  const [busqueda, setBusqueda] = useState(""); // ✅ nuevo estado para búsqueda

  useEffect(() => {
    const fetchMembresias = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("/membresias", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setMembresias(
          Array.isArray(response.data.membresias)
            ? response.data.membresias
            : []
        );
      } catch (err) {
        setError(`❌ Error al cargar las membresías: ${err.message}`);
      } finally {
        setCargando(false);
      }
    };

    fetchMembresias();
  }, []);

  const handleEliminar = async (id) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar esta membresía?")) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(`/membresias/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMembresias(membresias.filter((m) => m._id !== id));
      } catch (err) {
        setError(`❌ Error al eliminar la membresía: ${err.message}`);
      }
    }
  };

  // ✅ Función para calcular los días restantes
  const calcularDiasRestantes = (fechafin) => {
    if (!fechafin) return "No especificado";
    const hoy = new Date();
    const fin = new Date(fechafin);
    const diferencia = fin - hoy;
    const diasRestantes = Math.ceil(diferencia / (1000 * 60 * 60 * 24));
    return diasRestantes >= 0 ? diasRestantes : "Vencida";
  };

  // ✅ Aplicar filtros y búsqueda
  const membresiasFiltradas = membresias.filter((membresia) => {
    // filtro vencidas
    if (filtro === "vencidas" && calcularDiasRestantes(membresia.fechafin) !== "Vencida") {
      return false;
    }
    // filtro búsqueda por nombre
    if (busqueda.trim() !== "") {
      const nombreCompleto = membresia.cliente
        ? `${membresia.cliente.nombre} ${membresia.cliente.apellido || ""}`
        : "";
      return nombreCompleto.toLowerCase().includes(busqueda.toLowerCase());
    }
    return true;
  });

  if (cargando) {
    return <Spinner animation="border" variant="primary" />;
  }

  return (
    <div>
      <h2>Lista de Membresías</h2>

      {error && <Alert variant="danger">{error}</Alert>}

      <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-2">
        <Link to="/membresias/crear">
          <Button variant="primary">Agregar Membresía</Button>
        </Link>

        {/* ✅ Buscador por nombre */}
        <Form.Control
          type="text"
          placeholder="Buscar por nombre..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          style={{ maxWidth: "250px" }}
        />

        {/* ✅ Selector de filtro */}
        <Form.Select
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          style={{ width: "200px" }}
        >
          <option value="todas">Todas</option>
          <option value="vencidas">Vencidas</option>
        </Form.Select>
      </div>

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Duración (días)</th>
            <th>Días Restantes</th>
            <th>Sesiones Restantes</th>
            <th>Precio</th>
            <th>Fecha de Creación</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {membresiasFiltradas.length > 0 ? (
            membresiasFiltradas.map((membresia) => (
              <tr key={membresia._id}>
                <td>
                  {membresia.cliente
                    ? `${membresia.cliente.nombre} ${membresia.cliente.apellido || ""}`
                    : "Cliente no encontrado"}
                </td>
                <td>{membresia.duracion || "No especificado"}</td>
                <td>{calcularDiasRestantes(membresia.fechafin)}</td>
                <td>{membresia.sesionesRestantes || "No especificado"}</td>
                <td>{membresia.precio || "No especificado"}</td>
                <td>
                  {membresia.createdAt
                    ? moment(membresia.createdAt).format("DD/MM/YYYY")
                    : "No disponible"}
                </td>
                <td>
                  <Link to={`/membresias/editar/${membresia._id}`}>
                    <Button variant="warning" className="me-2">
                      Editar
                    </Button>
                  </Link>
                  <Button
                    variant="danger"
                    onClick={() => handleEliminar(membresia._id)}
                  >
                    Eliminar
                  </Button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7" className="text-center">
                No se encontraron membresías
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </div>
  );
};

export default Membresias;
