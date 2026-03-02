import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { obtenerClientes } from "../../api/axios";

const MESES_ANIO = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
const TIPOS_PAGO = ["TODOS", "Efectivo", "Nequi"];

const inputStyle = { padding: "1rem", borderRadius: "0.8rem", border: "2px solid #94a3b8", fontSize: "1.1rem" };
const selectStyle = { padding: "1rem", borderRadius: "0.8rem", border: "2px solid #94a3b8", fontSize: "1.1rem" };
const btnPrimary = { background: "#4f46e5", color: "white", padding: "1rem 2rem", borderRadius: "0.8rem", border: "none", cursor: "pointer", fontWeight: "bold" };
const btnSuccess = { background: "#22c55e", color: "white", padding: "1rem 3rem", borderRadius: "0.8rem", border: "none", cursor: "pointer", fontWeight: "bold" };
const thStyle = { padding: "1.2rem 0.5rem", textAlign: "center", fontWeight: "bold" };
const tdStyle = { padding: "1rem 0.5rem", textAlign: "center" };

const Pagames = () => {
    const [anios, setAnios] = useState([]);
    const [anioSeleccionado, setAnioSeleccionado] = useState(new Date().getFullYear().toString());
    const [nuevoAnio, setNuevoAnio] = useState("");
    const [clientes, setClientes] = useState([]);
    const [pagosDelAnio, setPagosDelAnio] = useState([]);

    const [searchCliente, setSearchCliente] = useState("");
    const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
    const [planSeleccionado, setPlanSeleccionado] = useState("Plan Black");
    const [valorManual, setValorManual] = useState("");
    const [mesAPagar, setMesAPagar] = useState("");
    const [tipoPagoSeleccionado, setTipoPagoSeleccionado] = useState("Efectivo");

    const [filtroNombre, setFiltroNombre] = useState("");
    const [filtroEspecialidad, setFiltroEspecialidad] = useState("TODAS");
    const [filtroTipoPago, setFiltroTipoPago] = useState("TODOS");
    const [filtroPeriodo, setFiltroPeriodo] = useState("MES");

    const backendURL = "https://backend-5zxh.onrender.com/api";

    const cargarDatosIniciales = async () => {
        try {
            const [aniosRes, clientesRes] = await Promise.all([
                axios.get(`${backendURL}/paga-mes/anios`),
                obtenerClientes()
            ]);
            setAnios(aniosRes.data);
            setClientes(clientesRes.data);
        } catch (error) { console.error("Error inicial:", error); }
    };

    const cargarPagos = async () => {
        if (!anioSeleccionado) return;
        try {
            const res = await axios.get(`${backendURL}/paga-mes/pagos/${anioSeleccionado}`);
            const pagosReales = res.data.filter(p => p.nombre !== "SYSTEM");

            const pagosEnriquecidos = pagosReales.map(pago => {
                const cliente = clientes.find(c =>
                    `${c.nombre} ${c.apellido}`.trim().toUpperCase() === pago.nombre.toUpperCase()
                );
                return { ...pago, especialidad: cliente?.especialidad || "Sin Especialidad" };
            });

            setPagosDelAnio(pagosEnriquecidos);
        } catch (error) { console.error("Error cargando pagos:", error); }
    };

    useEffect(() => { cargarDatosIniciales(); }, []);
    useEffect(() => { cargarPagos(); }, [anioSeleccionado, clientes]);

    const registrarPago = async () => {
        if (!clienteSeleccionado || !mesAPagar || !valorManual) return alert("Completa todos los campos");
        try {
            await axios.post(`${backendURL}/paga-mes/pagos`, {
                nombre: `${clienteSeleccionado.nombre} ${clienteSeleccionado.apellido}`.trim().toUpperCase(),
                anio: anioSeleccionado,
                plan: planSeleccionado,
                total: Number(valorManual),
                mesesPagados: [mesAPagar],
                tipoPago: tipoPagoSeleccionado
            });

            alert("Pago registrado correctamente");
            setSearchCliente("");
            setValorManual("");
            setMesAPagar("");
            cargarPagos();
        } catch (error) { alert("Error al registrar pago"); }
    };

    const especialidadesDisponibles = useMemo(() => {
        const specs = new Set(clientes.map(c => c.especialidad).filter(Boolean));
        return ["TODAS", ...Array.from(specs).sort()];
    }, [clientes]);

    const datosFiltrados = useMemo(() => {
        let pagos = pagosDelAnio;
        const hoy = new Date();

        if (filtroNombre.trim()) {
            pagos = pagos.filter(p => p.nombre.toLowerCase().includes(filtroNombre.toLowerCase()));
        }

        if (filtroEspecialidad !== "TODAS") {
            pagos = pagos.filter(p => p.especialidad === filtroEspecialidad);
        }

        if (filtroTipoPago !== "TODOS") {
            pagos = pagos.filter(p => p.tipoPago === filtroTipoPago);
        }

        if (filtroPeriodo === "DIA") {
            pagos = pagos.filter(p => {
                if (!p.createdAt) return false;
                const fecha = new Date(p.createdAt);
                return fecha.toDateString() === hoy.toDateString();
            });
        }

        if (filtroPeriodo === "SEMANA") {
            const inicioSemana = new Date(hoy);
            inicioSemana.setDate(hoy.getDate() - hoy.getDay());
            inicioSemana.setHours(0, 0, 0, 0);

            const finSemana = new Date(inicioSemana);
            finSemana.setDate(inicioSemana.getDate() + 6);
            finSemana.setHours(23, 59, 59, 999);

            pagos = pagos.filter(p => {
                if (!p.createdAt) return false;
                const fecha = new Date(p.createdAt);
                return fecha >= inicioSemana && fecha <= finSemana;
            });
        }

        if (filtroPeriodo === "MES") {
            pagos = pagos.filter(p => {
                if (!p.createdAt) return false;
                const fecha = new Date(p.createdAt);
                return (
                    fecha.getMonth() === hoy.getMonth() &&
                    fecha.getFullYear() === hoy.getFullYear()
                );
            });
        }

        const total = pagos.reduce((acc, p) => acc + p.total, 0);
        return { pagos, total };
    }, [pagosDelAnio, filtroNombre, filtroEspecialidad, filtroTipoPago, filtroPeriodo]);

    const nombresUnicosFiltrados = useMemo(() => {
        return [...new Set(datosFiltrados.pagos.map(p => p.nombre))];
    }, [datosFiltrados.pagos]);

    return (
        <div style={{ padding: "2rem" }}>
            <div style={{ marginBottom: "2rem" }}>
                <select
                    value={filtroPeriodo}
                    onChange={e => setFiltroPeriodo(e.target.value)}
                    style={{ ...selectStyle, padding: "0.6rem" }}
                >
                    <option value="MES">Mes Completo</option>
                    <option value="SEMANA">Semana</option>
                    <option value="DIA">Diario</option>
                </select>

                <div style={{ marginTop: "1rem", fontWeight: "bold" }}>
                    TOTAL FILTRADO: ${datosFiltrados.total.toLocaleString("es-CO")}
                </div>
            </div>
        </div>
    );
};

export default Pagames;
