import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { obtenerEntrenadorPorId, editarEntrenador } from "../api/axios";

const EditarClases = () => {
  const { id } = useParams(); // ID del entrenador
  const navigate = useNavigate();
  const [entrenador, setEntrenador] = useState({ clases: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const cargarEntrenador = async () => {
      try {
        const response = await obtenerEntrenadorPorId(id);
        setEntrenador(response.data); // Carga las clases del entrenador
        console.log("Clases cargadas:", response.data.clases); // Depuración
      } catch (err) {
        console.error("Error al cargar las clases:", err.message);
        setError("No se pudo cargar las clases. Verifica tu conexión o sesión.");
        navigate("/entrenadores"); // Redirige si falla
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      cargarEntrenador();
    } else {
      setLoading(false);
      navigate("/entrenadores");
    }
  }, [id, navigate]);

  const handleClaseChange = (index, field, value) => {
    const nuevasClases = [...entrenador.clases];
    nuevasClases[index] = { ...nuevasClases[index], [field]: value };
    setEntrenador({ ...entrenador, clases: nuevasClases });
  };

  const agregarClase = () => {
    setEntrenador({
      ...entrenador,
      clases: [...entrenador.clases, { nombreClase: "", capacidadMaxima: 0, dias: [] }],
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await editarEntrenador(id, { ...entrenador, clases: entrenador.clases });
      navigate("/entrenadores");
    } catch (err) {
      console.error("Error al guardar las clases:", err.message);
      setError("No se pudo guardar las clases. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Cargando...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;

  return (
    <div>
      <h1>Editar Clases del Entrenador</h1>
      <form onSubmit={handleSubmit}>
        {entrenador.clases.map((clase, index) => (
          <div key={index} style={{ marginBottom: "10px" }}>
            <input
              value={clase.nombreClase || ""}
              onChange={(e) => handleClaseChange(index, "nombreClase", e.target.value)}
              placeholder="Nombre de la clase"
              style={{ marginRight: "10px" }}
            />
            <input
              value={clase.capacidadMaxima || ""}
              onChange={(e) => handleClaseChange(index, "capacidadMaxima", e.target.value)}
              placeholder="Capacidad Máxima"
              type="number"
              style={{ marginRight: "10px" }}
            />
            <input
              value={clase.dias?.join(", ") || ""}
              onChange={(e) => handleClaseChange(index, "dias", e.target.value.split(", "))}
              placeholder="Días (ej. Lunes, Martes)"
            />
          </div>
        ))}
        <button
          type="button"
          onClick={agregarClase}
          style={{ marginRight: "10px", marginTop: "10px" }}
        >
          Agregar Clase
        </button>
        <button type="submit" style={{ marginTop: "10px" }}>
          Guardar Cambios
        </button>
        {error && <p style={{ color: "red", marginTop: "10px" }}>{error}</p>}
      </form>
    </div>
  );
};

export default EditarClases;
