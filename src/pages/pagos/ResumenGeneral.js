import React, { useState } from "react";
import { Card, Row, Col, Form, Button, Spinner, Alert } from "react-bootstrap";
import api from "../../api/axios";

const ResumenGeneral = () => {
    const todayISO = new Date().toISOString().split("T")[0];

    const [filtroTipo, setFiltroTipo] = useState("dia");
    const [dia, setDia] = useState(todayISO);
    const [mes, setMes] = useState("");
    const [semana, setSemana] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [data, setData] = useState({
        ligas: { total: 0, efectivo: 0, nequi: 0 },
        mensualidades: { total: 0, efectivo: 0, nequi: 0 },
        productos: { total: 0, efectivo: 0, nequi: 0 },
        totalGeneral: 0,
    });

    const obtenerRangoFechas = () => {
        let startDate, endDate;

        if (filtroTipo === "dia" && dia) {
            startDate = new Date(dia);
            startDate.setHours(0, 0, 0, 0);
            endDate = new Date(dia);
            endDate.setHours(23, 59, 59, 999);
        }

        if (filtroTipo === "mes" && mes) {
            const [year, month] = mes.split("-");
            startDate = new Date(year, month - 1, 1);
            endDate = new Date(year, month, 0);
            endDate.setHours(23, 59, 59, 999);
        }

        if (filtroTipo === "semana" && semana) {
            const [year, week] = semana.split("-W");
            const date = new Date(year, 0, 1);
            const day = date.getDay();
            const dayOffset = day <= 4 ? -day + 1 : -day + 8;
            date.setDate(date.getDate() + dayOffset + (week - 1) * 7);

            startDate = new Date(date);
            startDate.setHours(0, 0, 0, 0);

            endDate = new Date(startDate);
            endDate.setDate(endDate.getDate() + 6);
            endDate.setHours(23, 59, 59, 999);
        }

        return { startDate, endDate };
    };

    const cargarResumen = async () => {
        try {
            setLoading(true);
            setError("");

            const { startDate, endDate } = obtenerRangoFechas();

            if (!startDate || !endDate) {
                setError("Selecciona un filtro válido");
                return;
            }

            const res = await api.get("/reportes/resumen-general", {
                params: {
                    fechaInicio: startDate.toISOString(),
                    fechaFin: endDate.toISOString(),
                },
            });

            setData({
                ligas: {
                    total: res.data?.ligas?.total || 0,
                    efectivo: res.data?.ligas?.efectivo || 0,
                    nequi: res.data?.ligas?.nequi || 0,
                },
                mensualidades: {
                    total: res.data?.mensualidades?.total || 0,
                    efectivo: res.data?.mensualidades?.efectivo || 0,
                    nequi: res.data?.mensualidades?.nequi || 0,
                },
                productos: {
                    total: res.data?.productos?.total || 0,
                    efectivo: res.data?.productos?.efectivo || 0,
                    nequi: res.data?.productos?.nequi || 0,
                },
                totalGeneral: res.data?.totalGeneral || 0,
            });

        } catch (e) {
            console.error("Error resumen general", e);
            setError("Error al cargar el resumen general");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mt-4">
            <h2 className="mb-4">Resumen General de Recaudo</h2>

            {error && <Alert variant="danger">{error}</Alert>}

            {/* FILTROS */}
            <Card className="mb-4">
                <Card.Body>
                    <Row className="align-items-end">
                        <Col md={3}>
                            <Form.Group>
                                <Form.Label>Tipo de Filtro</Form.Label>
                                <Form.Select
                                    value={filtroTipo}
                                    onChange={(e) => setFiltroTipo(e.target.value)}
                                >
                                    <option value="dia">Día</option>
                                    <option value="semana">Semana</option>
                                    <option value="mes">Mes</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>

                        {filtroTipo === "dia" && (
                            <Col md={3}>
                                <Form.Group>
                                    <Form.Label>Día</Form.Label>
                                    <Form.Control
                                        type="date"
                                        value={dia}
                                        onChange={(e) => setDia(e.target.value)}
                                    />
                                </Form.Group>
                            </Col>
                        )}

                        {filtroTipo === "mes" && (
                            <Col md={3}>
                                <Form.Group>
                                    <Form.Label>Mes</Form.Label>
                                    <Form.Control
                                        type="month"
                                        value={mes}
                                        onChange={(e) => setMes(e.target.value)}
                                    />
                                </Form.Group>
                            </Col>
                        )}

                        {filtroTipo === "semana" && (
                            <Col md={3}>
                                <Form.Group>
                                    <Form.Label>Semana</Form.Label>
                                    <Form.Control
                                        type="week"
                                        value={semana}
                                        onChange={(e) => setSemana(e.target.value)}
                                    />
                                </Form.Group>
                            </Col>
                        )}

                        <Col md={3}>
                            <Button
    type="button"
    variant="primary"
    className="w-100"
    onClick={cargarResumen}
>
    Consultar
</Button>                       </Col>
                    </Row>
                </Card.Body>
            </Card>

            {/* RESULTADOS */}
            {loading ? (
                <Spinner animation="border" />
            ) : (
                <>
                    <Row className="mb-4">
                        <Col md={4}>
                            <Card className="p-3 shadow-sm">
                                <h5 className="text-center">Ligas</h5>
                                <hr />
                                <p>Total: <strong>${(data.ligas.total || 0).toLocaleString("es-CO")}</strong></p>
                                <p>Efectivo: ${(data.ligas.efectivo || 0).toLocaleString("es-CO")}</p>
                                <p>Nequi: ${(data.ligas.nequi || 0).toLocaleString("es-CO")}</p>
                            </Card>
                        </Col>

                        <Col md={4}>
                            <Card className="p-3 shadow-sm">
                                <h5 className="text-center">Mensualidades</h5>
                                <hr />
                                <p>Total: <strong>${(data.mensualidades.total || 0).toLocaleString("es-CO")}</strong></p>
                                <p>Efectivo: ${(data.mensualidades.efectivo || 0).toLocaleString("es-CO")}</p>
                                <p>Nequi: ${(data.mensualidades.nequi || 0).toLocaleString("es-CO")}</p>
                            </Card>
                        </Col>

                        <Col md={4}>
                            <Card className="p-3 shadow-sm">
                                <h5 className="text-center">Productos</h5>
                                <hr />
                                <p>Total: <strong>${(data.productos.total || 0).toLocaleString("es-CO")}</strong></p>
                                <p>Efectivo: ${(data.productos.efectivo || 0).toLocaleString("es-CO")}</p>
                                <p>Nequi: ${(data.productos.nequi || 0).toLocaleString("es-CO")}</p>
                            </Card>
                        </Col>
                    </Row>

                    <Row>
                        <Col md={12}>
                            <Card bg="dark" text="white" className="p-4 text-center shadow">
                                <h4>TOTAL GENERAL</h4>
                                <h2>${(data.totalGeneral || 0).toLocaleString("es-CO")}</h2>
                            </Card>
                        </Col>
                    </Row>
                </>
            )}
        </div>
    );
};

export default ResumenGeneral;
