import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
// Importamos desde axios.js

const Suscripcion = () => {
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [enviando, setEnviando] = useState(false);
  const navigate = useNavigate();

  // Verificar si el pago fue exitoso al cargar la página
  useEffect(() => {
    const verificarPago = async () => {
      const params = new URLSearchParams(window.location.search);
      const sessionId = params.get("session_id");
      if (sessionId) {
        try {
          const response = await api.get(
            `/pagos/verificar?session_id=${sessionId}`
          );
          setMensaje(response.data.message);
          setTimeout(() => navigate("/contabilidad"), 3000); // Redirigir después de 3 segundos
        } catch (err) {
          setError("❌ Error al verificar el pago.");
        }
      }
    };

    if (window.location.pathname === "/suscripcion/exito") {
      verificarPago();
    }
  }, [navigate]);

  const handleSuscribirse = async () => {
    setError("");
    setMensaje("");
    setEnviando(true);

    try {
      const response = await api.post("/pagos/crear-sesion");
      window.location.href = response.data.url; // Redirigir a la página de pago
    } catch (err) {
      console.error("Error al crear la sesión de pago:", err.response?.data);
      setError("❌ Error al iniciar el proceso de pago.");
      setEnviando(false);
    }
  };

  if (window.location.pathname === "/suscripcion/exito") {
    return (
      <div className="container mx-auto p-4">
        <h2 className="text-2xl font-bold mb-4">Suscripción Exitosa</h2>
        {mensaje && <p className="text-green-500">{mensaje}</p>}
        {error && <p className="text-red-500">{error}</p>}
        <p>Redirigiendo a la página de contabilidad...</p>
      </div>
    );
  }

  if (window.location.pathname === "/suscripcion/cancelado") {
    return (
      <div className="container mx-auto p-4">
        <h2 className="text-2xl font-bold mb-4">Suscripción Cancelada</h2>
        <p>El pago fue cancelado. Intenta de nuevo si deseas suscribirte.</p>
        <button
          onClick={() => navigate("/suscripcion")}
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Volver a Intentar
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">
        Suscribirse a Gestión de Gimnasios
      </h2>
      <p>Obtén acceso completo por solo $10 al mes.</p>
      {error && <p className="text-red-500">{error}</p>}
      <button
        onClick={handleSuscribirse}
        disabled={enviando}
        className={`mt-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-700 ${
          enviando ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        {enviando ? "Procesando..." : "Suscribirse Ahora"}
      </button>
    </div>
  );
};

export default Suscripcion;
