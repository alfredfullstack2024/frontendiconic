import React, { useState, useEffect, useCallback } from "react";
import { Table, Button, Alert, Form, Row, Col, Card, Modal, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

// Función auxiliar para formatear montos (usa toLocaleString de forma segura)
const formatCurrencySafe = (amount) => {
    // Si amount no es un número, devuelve 0
    const value = parseFloat(amount) || 0; 
    return `$${value.toLocaleString("es-CO", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
};

// 🔧 Corrige el problema de zona horaria Colombia
const formatLocalDateTime = (date) => {
    return date
        .toLocaleString("sv-SE", { timeZone: "America/Bogota" })
        .replace(" ", "T");
};

const Pagos = () => {
    const todayISO = new Date().toLocaleDateString("sv-SE", {
  timeZone: "America/Bogota"
});
    const currentYear = new Date().getFullYear();

    const [pagos, setPagos] = useState([]);
    const [pagosFiltrados, setPagosFiltrados] = useState([]);
    const [filtroTipo, setFiltroTipo] = useState("dia"); // 👈 HOY por defecto
    const [mes, setMes] = useState("");
    
    const [dia, setDia] = useState(todayISO); // 👈 HOY automático
    const [anio, setAnio] = useState(currentYear.toString()); // 👈 NUEVO
    const [busquedaNombre, setBusquedaNombre] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showResumen, setShowResumen] = useState(false);
    const [resumen, setResumen] = useState([]);
    
    // ESTADOS PARA LA RECAUDACIÓN
    const [totalRecaudadoFiltrado, setTotalRecaudadoFiltrado] = useState(0); 
    const [totalRecaudadoGeneral, setTotalRecaudadoGeneral] = useState(0); 
    
    const navigate = useNavigate();

    // --- 1. Cargar pagos y Totales ---
    // --- 1. Cargar pagos y Totales (CORREGIDO) ---
    const fetchPagos = useCallback(async () => {
        setIsLoading(true);
        setError("");

        try {
            const params = {};

            if (filtroTipo === "anio" && anio) {
                const startDate = new Date(anio, 0, 1);
                const endDate = new Date(anio, 11, 31);
                endDate.setHours(23, 59, 59, 999);
                params.fechaInicio = formatLocalDateTime(startDate);
                params.fechaFin = formatLocalDateTime(endDate);
            } else if (filtroTipo === "mes" && mes) {
                const [year, month] = mes.split("-");
                const startDate = new Date(year, month - 1, 1);
                const endDate = new Date(year, month, 0);
                endDate.setHours(23, 59, 59, 999);
                params.fechaInicio = formatLocalDateTime(startDate);
                params.fechaFin = formatLocalDateTime(endDate);
            } else if (filtroTipo === "dia" && dia) {
                // Forzamos el formato literal para evitar conversiones de zona horaria
                params.fechaInicio = `${dia}T00:00:00`;
                params.fechaFin = `${dia}T23:59:59`;
            }

            // A) Obtener el total GENERAL histórico
            const allResponse = await api.get("/pagos");
            const totalGeneralMonto = (allResponse.data.pagos || [])
                .reduce((sum, pago) => sum + (pago.monto || 0), 0);
            setTotalRecaudadoGeneral(totalGeneralMonto);

            // B) Obtener pagos filtrados y el total calculado por el Backend
            const filteredResponse = await api.get("/pagos", { params });
            const fetchedPagos = filteredResponse.data.pagos || [];
            const totalBackend = filteredResponse.data.total || 0;
            
            setPagos(fetchedPagos); 
            setPagosFiltrados(fetchedPagos); 
            setTotalRecaudadoFiltrado(totalBackend); // Sincronización con el servidor
            
        } catch (err) {
            setError("Error al cargar los pagos: " + (err.response?.data?.message || err.message));
            setPagos([]);
            setPagosFiltrados([]);
        } finally {
            setIsLoading(false);
        }
    }, [filtroTipo, mes, dia, anio]);
    // --- 2. Filtro local por nombre (CORREGIDO) ---
    useEffect(() => {
        let filtrados;

        if (!busquedaNombre) {
            filtrados = pagos;
        } else {
            filtrados = pagos.filter((pago) => {
                const nombreCliente = pago.cliente
                    ? `${pago.cliente.nombre} ${pago.cliente.apellido || ""}`.toLowerCase()
                    : (pago.clienteManual || "").toLowerCase();
                return nombreCliente.includes(busquedaNombre.toLowerCase());
            });
        }

        setPagosFiltrados(filtrados);

        // Si hay una búsqueda activa, sumamos los visibles. 
        // Si no, respetamos la suma total de ese periodo que trajo el backend.
        if (busquedaNombre) {
            const sumaVisible = filtrados.reduce((sum, pago) => sum + Number(pago.monto || 0), 0);
            setTotalRecaudadoFiltrado(sumaVisible);
        } else {
            const sumaTotalPeriodo = pagos.reduce((sum, pago) => sum + Number(pago.monto || 0), 0);
            setTotalRecaudadoFiltrado(sumaTotalPeriodo);
        }

    }, [busquedaNombre, pagos]);
    const limpiarFiltros = () => {
        setFiltroTipo("dia");
        setDia(todayISO);
        setMes("");
        
        setAnio(currentYear.toString());
        setBusquedaNombre("");
    };

    const eliminarPago = async (id) => {
        // Mensaje de confirmación
        const confirmar = window.confirm("¿Estás seguro de que deseas eliminar este pago? El stock del producto se devolverá automáticamente.");
        
        if (!confirmar) return; // Si dice que no, se cancela todo

        try {
            setIsLoading(true);
            await api.delete(`/pagos/${id}`); // Ahora esta ruta sí existe
            alert("Eliminado con éxito");
            await fetchPagos(); // Recarga la lista
        } catch (err) {
            setError("Error al eliminar: " + (err.response?.data?.mensaje || err.message));
        } finally {
            setIsLoading(false);
        }
    };
  const formatFecha = (fecha) => {
    if (!fecha) return "Sin fecha";

    return new Date(fecha).toLocaleDateString("es-CO", {
        timeZone: "America/Bogota"
    });
};

    const abrirResumen = async () => {
        try {
            setIsLoading(true);
            const params = {};

            if (filtroTipo === "anio" && anio) {
                const startDate = new Date(anio, 0, 1);
                const endDate = new Date(anio, 11, 31);
                endDate.setHours(23, 59, 59, 999);
                params.fechaInicio = formatLocalDateTime(startDate);
params.fechaFin = formatLocalDateTime(endDate);
            }

            if (filtroTipo === "mes" && mes) {
                const [year, month] = mes.split("-");
                const startDate = new Date(year, month - 1, 1);
                const endDate = new Date(year, month, 0);
                endDate.setHours(23, 59, 59, 999);
                params.fechaInicio = formatLocalDateTime(startDate);
params.fechaFin = formatLocalDateTime(endDate);
            } 
             else if (filtroTipo === "dia" && dia) {
                const startDate = new Date(dia);
                startDate.setHours(0, 0, 0, 0);
                const endDate = new Date(dia);
                endDate.setHours(23, 59, 59, 999);
                params.fechaInicio = formatLocalDateTime(startDate);
params.fechaFin = formatLocalDateTime(endDate);
            }

            const { data } = await api.get("/pagos/resumen-metodo-pago", { params });
            setResumen(data.resumen || []);
            setTotalRecaudadoFiltrado(data.totalGeneral || 0); 
            setShowResumen(true);
        } catch (error) {
            setError("Error al obtener el resumen de pagos");
        } finally {
            setIsLoading(false);
        }
    };

    const irAPagosLigas = () => {
        navigate("/pagos/ligas");
    };

    const irAPagames = () => {
        navigate("/pagos/pagames");
    };

    return (
        <div className="container mt-4">
            <h2>Pagos</h2>
            {error && <Alert variant="danger">{error}</Alert>}

            <Card bg="dark" text="white" className="mb-4 shadow-lg">
                <Card.Body className="text-center py-3">
                    <Card.Title className="m-0 h4">
                        TOTAL RECAUDADO (GENERAL): {isLoading ? <Spinner animation="border" size="sm" /> : formatCurrencySafe(totalRecaudadoGeneral)}
                    </Card.Title>
                </Card.Body>
            </Card>

            <Card className="mb-4">
                <Card.Body>
                    <Card.Title>Filtros por Fecha y Nombre</Card.Title>
                    <Form>
                        <Row className="align-items-end">
                            <Col md={2}>
                                <Form.Group>
                                    <Form.Label>Tipo de Filtro</Form.Label>
                                    <Form.Select value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)}>
                                        <option value="dia">Día</option>
                                        
                                        <option value="mes">Mes</option>
                                        <option value="anio">Año</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>

                            {filtroTipo === "anio" && (
                                <Col md={2}>
                                    <Form.Group>
                                        <Form.Label>Año</Form.Label>
                                        <Form.Control
                                            type="number"
                                            value={anio}
                                            onChange={(e) => setAnio(e.target.value)}
                                            placeholder="2025"
                                        />
                                    </Form.Group>
                                </Col>
                            )}

                            {filtroTipo === "mes" && (
                                <Col md={2}>
                                    <Form.Group>
                                        <Form.Label>Mes</Form.Label>
                                        <Form.Control type="month" value={mes} onChange={(e) => setMes(e.target.value)} />
                                    </Form.Group>
                                </Col>
                            )}

                           

                            {filtroTipo === "dia" && (
                                <Col md={2}>
                                    <Form.Group>
                                        <Form.Label>Día</Form.Label>
                                        <Form.Control type="date" value={dia} onChange={(e) => setDia(e.target.value)} />
                                    </Form.Group>
                                </Col>
                            )}

                            <Col md={3}>
                                <Form.Group>
                                    <Form.Label>Buscar por Nombre</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={busquedaNombre}
                                        onChange={(e) => setBusquedaNombre(e.target.value)}
                                        placeholder="Nombre del cliente"
                                    />
                                </Form.Group>
                            </Col>

                            <Col md={3}>
                                <Row>
                                    <Col xs={6}>
                                        <Button variant="primary" className="w-100 mt-3" onClick={fetchPagos}>Filtrar</Button>
                                    </Col>
                                    <Col xs={6}>
                                        <Button variant="secondary" onClick={limpiarFiltros} className="w-100 mt-3">Limpiar</Button>
                                    </Col>
                                </Row>
                               <Button
    variant="warning"
    onClick={abrirResumen}
    className="w-100 mt-2"
    style={{ display: "none" }}
>
    Ver Resumen método de pago
</Button>
                            </Col>
                        </Row>
                    </Form>

                    <Alert variant="info" className="mt-3 text-center">
                                            <div className="mt-4 p-3 bg-success text-white rounded text-center">
    <h5 className="m-0">
        TOTAL FILTRADO ({filtroTipo.toUpperCase()}): {isLoading && pagosFiltrados.length === 0 ? <Spinner animation="border" size="sm" variant="light"/> : formatCurrencySafe(totalRecaudadoFiltrado)}
    </h5>
</div>
                        {new Date().toLocaleDateString("es-CO", { timeZone: "America/Bogota" })} para ver más información use los filtros
                    </Alert>

                   
                </Card.Body>
            </Card>

          <div className="mb-3 d-flex flex-wrap gap-2">
    <Button variant="primary" onClick={() => navigate("/pagos/crear")}>
        Crear pago
    </Button>
    <Button variant="success" onClick={irAPagosLigas}>
        Pagos Ligas
    </Button>
    <Button variant="info" onClick={irAPagames}>
        Pagos Mes
    </Button>
    {/* 👇 NUEVO BOTÓN ROJO */}
    <Button variant="danger" onClick={() => navigate("/pagos/pago-rapido")}>
        Pago Rápido
    </Button>
    <Button variant="dark" onClick={() => navigate("/pagos/resumen-general")}>
        Resumen General
    </Button>
</div>
            {isLoading && <Alert variant="info">Cargando pagos...</Alert>}
            {!isLoading && pagosFiltrados.length === 0 && !error && (
                <Alert variant="info">No hay pagos para mostrar en este periodo/filtro.</Alert>
            )}

            {!isLoading && pagosFiltrados.length > 0 && (
                <Table striped bordered hover>
                    <thead>
                        <tr>
                            <th>Cliente</th>
                            <th>Monto</th>
                            <th>Fecha</th>
                            <th>Producto</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pagosFiltrados.map((pago) => (
                           <tr key={pago._id || `${pago.fecha}-${pago.monto}`}>
                                <td>
    {pago.cliente
        ? `${pago.cliente.nombre} ${pago.cliente.apellido || ""}`
        : pago.clienteManual || "Sin cliente"}
</td>
                                <td>{formatCurrencySafe(pago.monto)}</td>
                                <td>{formatFecha(pago.fecha)}</td>
                                <td>
    {pago.producto && pago.producto.nombre
  ? pago.producto.nombre
  : pago.productoManual || "No especificado"}
</td>
                                <td>
                                    <Button variant="warning" size="sm" className="me-2" onClick={() => navigate(`/pagos/editar/${pago._id}`)}>
                                        Editar
                                    </Button>
                                    <Button variant="danger" size="sm" onClick={() => eliminarPago(pago._id)}>
                                        Eliminar
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            )}

            <Modal show={showResumen} onHide={() => setShowResumen(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Resumen por Método de Pago ({filtroTipo.toUpperCase()})</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {resumen.length === 0 ? (
                        <Alert variant="info">No hay datos disponibles para este periodo.</Alert>
                    ) : (
                        <Table striped bordered>
                            <thead>
                                <tr>
                                    <th>Método</th>
                                    <th>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {resumen.map((r) => (
                                    <tr key={r.metodoPago}>
                                        <td>{r.metodoPago}</td>
                                        <td>{formatCurrencySafe(r.total)}</td>
                                    </tr>
                                ))}
                                <tr className="fw-bold">
                                    <td>Total general del periodo</td>
                                    <td>{formatCurrencySafe(totalRecaudadoFiltrado)}</td>
                                </tr>
                            </tbody>
                        </Table>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowResumen(false)}>
                        Cerrar
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default Pagos;


