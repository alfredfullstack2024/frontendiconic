import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Form, Button, Container, Row, Col } from "react-bootstrap";
import axios from "axios";

// URL base de la API (ajustada para Vercel o entorno)
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const EditarEntrenador = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [entrenador, setEntrenador] = useState({
    nombre: "",
    apellido: "",
    correo: "",
    telefono: "",
    especialidad: "",
    clases: [
      { nombreClase: "Entrenamiento General", dias: [], capacidadMaxima: 10 },
    ],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEntrenador = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `${API_URL}/entrenadores/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data = response.data;
        setEntrenador({
          nombre: data.nombre || "",
          apellido: data.apellido || "",
          correo: data.correo || "",
          telefono: data.telefono || "",
          especialidad: data.especialidad || "",
          clases: Array.isArray(data.clases) && data.clases.length > 0 ? data.clases : [
            { nombreClase: "Entrenamiento General", dias: [], capacidadMaxima: 10 },
          ],
        });
        setLoading(false);
      } catch (err) {
        setError(
          err.response?.data?.mensaje || "Error al cargar el entrenador"
        );
        setLoading(false);
      }
    };
    if (id) fetchEntrenador();
    else {
      setError("ID de entrenador no proporcionado");
      setLoading(false);
    }
  }, [id]);

  const handleClaseChange = (index, field, value) => {
    const nuevasClases = [...entrenador.clases];
    nuevasClases[index][field] = value;
    setEntrenador({ ...entrenador, clases: nuevasClases });
  };

  const handleDiaChange = (claseIndex, diaIndex, field, value) => {
    const nuevasClases = [...entrenador.clases];
    nuevasClases[claseIndex].dias[diaIndex] = {
      ...nuevasClases[claseIndex].dias[diaIndex],
      [field]: value,
    };
    setEntrenador({ ...entrenador, clases: nuevasClases });
  };

  const agregarDia = (claseIndex) => {
    const nuevasClases = [...entrenador.clases];
    nuevasClases[claseIndex].dias.push({
      dia: "",
      horarioInicio: "",
      horarioFin: "",
    });
    setEntrenador({ ...entrenador, clases: nuevasClases });
  };

  const eliminarDia = (claseIndex, diaIndex) => {
    const nuevasClases = [...entrenador.clases];
    nuevasClases[claseIndex].dias.splice(diaIndex, 1);
    setEntrenador({ ...entrenador, clases: nuevasClases });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${API_URL}/entrenadores/${id}`,
        entrenador,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Entrenador actualizado con éxito");
      navigate("/entrenadores");
    } catch (err) {
      setError(
        err.response?.data?.mensaje || "Error al actualizar el entrenador"
      );
    }
  };

  if (loading) return <p>Cargando...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <Container>
      <h2>Editar Entrenador</h2>
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Nombre</Form.Label>
          <Form.Control
            type="text"
            value={entrenador.nombre}
            onChange={(e) =>
              setEntrenador({ ...entrenador, nombre: e.target.value })
            }
            required
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Apellido</Form.Label>
          <Form.Control
            type="text"
            value={entrenador.apellido}
            onChange={(e) =>
              setEntrenador({ ...entrenador, apellido: e.target.value })
            }
            required
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Correo</Form.Label>
          <Form.Control
            type="email"
            value={entrenador.correo}
            onChange={(e) =>
              setEntrenador({ ...entrenador, correo: e.target.value })
            }
            required
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Teléfono</Form.Label>
          <Form.Control
            type="text"
            value={entrenador.telefono}
            onChange={(e) =>
              setEntrenador({ ...entrenador, telefono: e.target.value })
            }
            required
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Especialidad</Form.Label>
          <Form.Control
            type="text"
            value={entrenador.especialidad}
            onChange={(e) =>
              setEntrenador({ ...entrenador, especialidad: e.target.value })
            }
            required
          />
        </Form.Group>

        {Array.isArray(entrenador.clases) && entrenador.clases.map((clase, claseIndex) => (
          <div key={claseIndex} className="mb-4">
            <h5>Clase {claseIndex + 1}</h5>
            <Form.Group className="mb-3">
              <Form.Label>Nombre de la Clase</Form.Label>
              <Form.Control
                type="text"
                value={clase.nombreClase || ""}
                onChange={(e) =>
                  handleClaseChange(claseIndex, "nombreClase", e.target.value)
                }
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Capacidad Máxima</Form.Label>
              <Form.Control
                type="number"
                value={clase.capacidadMaxima || 10}
                onChange={(e) =>
                  handleClaseChange(
                    claseIndex,
                    "capacidadMaxima",
                    Number(e.target.value)
                  )
                }
                required
              />
            </Form.Group>
            <h6>Días y Horarios</h6>
            {Array.isArray(clase.dias) && clase.dias.map((dia, diaIndex) => (
              <Row key={diaIndex} className="mb-2">
                <Col>
                  <Form.Control
                    type="text"
                    placeholder="Día"
                    value={dia.dia || ""}
                    onChange={(e) =>
                      handleDiaChange(
                        claseIndex,
                        diaIndex,
                        "dia",
                        e.target.value
                      )
                    }
                    required
                  />
                </Col>
                <Col>
                  <Form.Control
                    type="time"
                    value={dia.horarioInicio || ""}
                    onChange={(e) =>
                      handleDiaChange(
                        claseIndex,
                        diaIndex,
                        "horarioInicio",
                        e.target.value
                      )
                    }
                    required
                  />
                </Col>
                <Col>
                  <Form.Control
                    type="time"
                    value={dia.horarioFin || ""}
                    onChange={(e) =>
                      handleDiaChange(
                        claseIndex,
                        diaIndex,
                        "horarioFin",
                        e.target.value
                      )
                    }
                    required
                  />
                </Col>
                <Col>
                  <Button
                    variant="danger"
                    onClick={() => eliminarDia(claseIndex, diaIndex)}
                  >
                    Eliminar
                  </Button>
                </Col>
              </Row>
            ))}
            <Button variant="secondary" onClick={() => agregarDia(claseIndex)}>
              Agregar Día
            </Button>
          </div>
        ))}

        <Button variant="primary" type="submit">
          Actualizar Entrenador
        </Button>
      </Form>
    </Container>
  );
};

export default EditarEntrenador;
