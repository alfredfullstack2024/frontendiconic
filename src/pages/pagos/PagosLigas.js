// src/pages/pagos/PagosLigas.js

import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { obtenerClientes } from "../../api/axios";

// ===========================================
// ⭐ NUEVA FUNCIÓN AUXILIAR: Obtener mes actual
// ===========================================
const obtenerNombreMesActual = () => {
    const date = new Date();
    const meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    const nombreMes = meses[date.getMonth()];
    const anio = date.getFullYear();
    return `${nombreMes} ${anio}`;
};

// Estilos (NO modificados)
const inputStyle = { padding: "1rem", borderRadius: "0.8rem", border: "2px solid #94a3b8", fontSize: "1.1rem" };
const selectStyle = { padding: "1rem", borderRadius: "0.8rem", border: "2px solid #94a3b8", fontSize: "1.1rem" };
const btnPrimary = { background: "#4f46e5", color: "white", padding: "1rem 2rem", borderRadius: "0.8rem", border: "none", cursor: "pointer", fontWeight: "bold" };
const btnSuccess = { background: "#22c55e", color: "white", padding: "1rem 3rem", borderRadius: "0.8rem", border: "none", cursor: "pointer", fontWeight: "bold" };
const thStyle = { padding: "1.2rem 0.5rem", textAlign: "center", fontWeight: "bold" };
const tdStyle = { padding: "1rem 0.5rem", textAlign: "center" };

const TIPOS_PAGO = ["TODOS", "Efectivo", "Nequi"];

const PagosLigas = () => {

    const [meses, setMeses] = useState([]);
    const [mesSeleccionado, setMesSeleccionado] = useState("");
    const [nuevoMes, setNuevoMes] = useState("");
    const [valorDiario, setValorDiario] = useState(8000);
    const [clientes, setClientes] = useState([]);
    const [searchCliente, setSearchCliente] = useState("");
    const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
    const [diaSeleccionado, setDiaSeleccionado] = useState("");
    const [comentarioPago, setComentarioPago] = useState("");
    const [tipoPagoSeleccionado, setTipoPagoSeleccionado] = useState("Efectivo");

    const [pagosDelMes, setPagosDelMes] = useState([]);
    const [totalRecaudado, setTotalRecaudado] = useState(0);

    const [filtroEspecialidad, setFiltroEspecialidad] = useState("TODAS");
    const [filtroPeriodo, setFiltroPeriodo] = useState("MES");
    const [filtroDia, setFiltroDia] = useState("");
    const [filtroSemana, setFiltroSemana] = useState("");
    const [filtroTipoPago, setFiltroTipoPago] = useState("TODOS");
    const [filtroNombre, setFiltroNombre] = useState("");

    const especialidades = useMemo(() => {
        const specs = new Set(clientes.map(c => c.especialidad).filter(Boolean));
        return ["TODAS", ...Array.from(specs).sort()];
    }, [clientes]);

    const backendURL = process.env.REACT_APP_API_URL || "https://backend-5zxh.onrender.com/api";

    // ===============================
    // CARGA INICIAL
    // ===============================
    useEffect(() => {
        const cargarDatosIniciales = async () => {
            try {
                const [mesesRes, clientesRes, configRes] = await Promise.all([
                    axios.get(`${backendURL}/pagos-ligas/meses`),
                    obtenerClientes(),
                    axios.get(`${backendURL}/pagos-ligas/valor-diario`).catch(() => ({ data: { valorDiario: 8000 } })),
                ]);

                const mesesData = mesesRes.data;
                setMeses(mesesData);
                setClientes(clientesRes.data);
                setValorDiario(configRes.data.valorDiario || 8000);

                if (mesesData.length > 0) {
                    const nombreMesActual = obtenerNombreMesActual();
                    const mesActualEnBD = mesesData.find(m =>
                        m.nombre.trim().toLowerCase() === nombreMesActual.toLowerCase()
                    );

                    if (mesActualEnBD) {
                        setMesSeleccionado(mesActualEnBD.nombre);
                    } else {
                        setMesSeleccionado(mesesData[mesesData.length - 1].nombre);
                    }
                }
            } catch (error) {
                console.error("Error en carga inicial:", error);
            }
        };

        cargarDatosIniciales();
    }, [backendURL]);

    // ===============================
    // 🔒 CARGAR PAGOS Y CONGELAR TOTAL HISTÓRICO
    // ===============================
    useEffect(() => {
        if (!mesSeleccionado) return;

        const cargarPagos = async () => {
            try {
                const res = await axios.get(`${backendURL}/pagos-ligas/pagos/${mesSeleccionado}`);
                const todosPagos = res.data || [];

                const pagosReales = todosPagos.filter(
                    p => p.nombre !== "SYSTEM" && p.nombre.trim() !== ""
                );

                // 🔒 CAMBIO CLAVE:
                // Ahora el total del mes se calcula SUMANDO pago.total
                // NO se multiplica por valorDiario
                let total = 0;

                const pagosEnriquecidos = pagosReales.map(pago => {
                    total += Number(pago.total || 0);

                    const cliente = clientes.find(c =>
                        `${c.nombre} ${c.apellido}`.trim().toLowerCase() === pago.nombre.trim().toLowerCase()
                    );

                    return {
                        ...pago,
                        especialidad: cliente?.especialidad || "Sin Especialidad",
                        tipoPago: pago.tipoPago || "N/A"
                    };
                });

                setPagosDelMes(pagosEnriquecidos);
                setTotalRecaudado(total);

            } catch (error) {
                console.error("Error cargando pagos:", error);
                setPagosDelMes([]);
                setTotalRecaudado(0);
            }
        };

        cargarPagos();
    }, [mesSeleccionado, clientes]);

    // ===============================
    // REGISTRAR PAGO (SIN CAMBIOS ESTRUCTURALES)
    // ===============================
    const registrarPagoDia = async () => {

        if (!clienteSeleccionado) return alert("Selecciona una niña");
        if (!diaSeleccionado || diaSeleccionado < 1 || diaSeleccionado > 31) return alert("Día inválido");
        if (!mesSeleccionado) return alert("Selecciona un mes");
        if (!tipoPagoSeleccionado) return alert("Selecciona el tipo de pago");

        const hoy = new Date().getDate();

        try {

            await axios.post(`${backendURL}/pagos-ligas/pagos`, {
                nombre: `${clienteSeleccionado.nombre} ${clienteSeleccionado.apellido}`.trim(),
                mes: mesSeleccionado,
                diasAsistidos: 1,
                total: valorDiario, // sigue usando el valor actual para NUEVOS pagos
                diasPagados: [parseInt(diaSeleccionado)],
                tipoPago: tipoPagoSeleccionado,
                comentario: Number(diaSeleccionado) !== hoy ? comentarioPago.trim() : "",
            });

            alert(`Día ${diaSeleccionado} registrado correctamente`);

            const res = await axios.get(`${backendURL}/pagos-ligas/pagos/${mesSeleccionado}`);
            const todosPagos = res.data || [];
            const pagosReales = todosPagos.filter(p => p.nombre !== "SYSTEM" && p.nombre.trim() !== "");

            let total = 0;

            const pagosEnriquecidos = pagosReales.map(pago => {
                total += Number(pago.total || 0);
                const cliente = clientes.find(c =>
                    `${c.nombre} ${c.apellido}`.trim().toLowerCase() === pago.nombre.trim().toLowerCase()
                );
                return { ...pago, especialidad: cliente?.especialidad || "Sin Especialidad", tipoPago: pago.tipoPago || "N/A" };
            });

            setPagosDelMes(pagosEnriquecidos);
            setTotalRecaudado(total);

            setSearchCliente("");
            setClienteSeleccionado(null);
            setDiaSeleccionado("");
            setComentarioPago("");

        } catch (error) {
            console.error(error);
            alert("Error al registrar pago");
        }
    };

    // ===============================
    // 🔒 FILTROS CON TOTAL HISTÓRICO
    // ===============================
    const pagosFiltrados = useMemo(() => {

        let pagos = pagosDelMes;

        if (filtroNombre.trim()) {
            const nombreFiltrado = filtroNombre.trim().toLowerCase();
            pagos = pagos.filter(p => p.nombre.trim().toLowerCase().includes(nombreFiltrado));
        }

        if (filtroEspecialidad !== "TODAS") {
            pagos = pagos.filter(p => p.especialidad === filtroEspecialidad);
        }

        if (filtroTipoPago !== "TODOS") {
            pagos = pagos.filter(p => p.tipoPago === filtroTipoPago);
        }

        // 🔒 CAMBIO CLAVE:
        // El total filtrado ahora es SUMA de pago.total
        const total = pagos.reduce((acc, pago) => acc + Number(pago.total || 0), 0);

        return {
            pagosFiltradosPorEspecialidad: pagos,
            totalFiltrado: total
        };

    }, [pagosDelMes, filtroEspecialidad, filtroTipoPago, filtroNombre]);

    const jugadorasFiltradas = useMemo(() => {
        return [...new Set(pagosFiltrados.pagosFiltradosPorEspecialidad.map(p => p.nombre.trim()))].filter(Boolean);
    }, [pagosFiltrados.pagosFiltradosPorEspecialidad]);

    const getEspecialidadJugadora = (nombre) => {
        const pago = pagosDelMes.find(c => c.nombre.trim() === nombre.trim());
        return pago?.especialidad || 'N/A';
    };

    const getTipoPagoJugadora = (nombre) => {
        const pago = pagosDelMes.find(c => c.nombre.trim() === nombre.trim());
        return pago?.tipoPago || 'Efectivo';
    };

    // 🔒 TOTAL POR JUGADORA = suma real
    const getTotalPorJugadora = (nombre) => {
        return pagosFiltrados.pagosFiltradosPorEspecialidad
            .filter(p => p.nombre.trim() === nombre.trim())
            .reduce((acc, pago) => acc + Number(pago.total || 0), 0);
    };

    const getDiasPagadosFiltrados = (nombre) => {
        const pagos = pagosFiltrados.pagosFiltradosPorEspecialidad.filter(p => p.nombre.trim() === nombre.trim());
        const dias = new Set();
        pagos.forEach(p => (p.diasPagados || []).forEach(d => dias.add(d)));
        return Array.from(dias).sort((a, b) => a - b);
    };

    return (
        <div style={{ padding: "2rem", background: "#f8fafc", minHeight: "100vh" }}>
            <div style={{ maxWidth: "2200px", margin: "0 auto", background: "white", borderRadius: "1.5rem", padding: "2.5rem", boxShadow: "0 20px 40px rgba(0,0,0,0.1)" }}>

                <h2 style={{ textAlign: "center", fontSize: "2.5rem", marginBottom: "2rem", color: "#1e293b" }}>
                    Control de Pagos de Ligas
                </h2>

                <div style={{ background: "#172554", color: "white", padding: "1.5rem 4rem", borderRadius: "1.5rem", fontSize: "2.5rem", fontWeight: "bold", marginBottom: "2rem" }}>
                    TOTAL RECAUDADO (MES): ${totalRecaudado.toLocaleString("es-CO")}
                </div>

                <div style={{ background: "#065f46", color: "white", padding: "1rem 2rem", borderRadius: "1rem", fontSize: "1.5rem", fontWeight: "bold", marginBottom: "2rem" }}>
                    TOTAL FILTRADO: ${pagosFiltrados.totalFiltrado.toLocaleString("es-CO")}
                </div>

                {mesSeleccionado && (
                    <div style={{ overflowX: "auto", borderRadius: "1.5rem", boxShadow: "0 15px 35px rgba(0,0,0,0.15)" }}>
                        <table style={{ width: "100%", minWidth: "2800px", borderCollapse: "collapse" }}>
                            <thead>
                                <tr style={{ background: "#1e293b", color: "white" }}>
                                    <th style={{ ...thStyle }}>Jugadora</th>
                                    <th style={{ ...thStyle }}>Especialidad</th>
                                    <th style={{ ...thStyle }}>Tipo</th>
                                    <th style={{ ...thStyle }}>Días</th>
                                    <th style={{ ...thStyle }}>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {jugadorasFiltradas.map(nombre => {
                                    const dias = getDiasPagadosFiltrados(nombre);
                                    const total = getTotalPorJugadora(nombre);

                                    return (
                                        <tr key={nombre}>
                                            <td style={tdStyle}>{nombre}</td>
                                            <td style={tdStyle}>{getEspecialidadJugadora(nombre)}</td>
                                            <td style={tdStyle}>{getTipoPagoJugadora(nombre)}</td>
                                            <td style={tdStyle}>{dias.length}</td>
                                            <td style={tdStyle}>${total.toLocaleString("es-CO")}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

            </div>
        </div>
    );
};

export default PagosLigas;
