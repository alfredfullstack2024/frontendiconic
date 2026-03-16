import React, { useState, useEffect } from "react";
import { Card, Row, Col, Form, Button, Spinner, Alert } from "react-bootstrap";
import api from "../../api/axios";

const ResumenGeneral = () => {
   const mesActual = new Date().toISOString().slice(0, 7);

const [mes, setMes] = useState(mesActual);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [data, setData] = useState({
        ligas: { total: 0, efectivo: 0, transferencia: 0, tarjeta: 0 },
        mensualidades: { total: 0, efectivo: 0, transferencia: 0, tarjeta: 0 },
        productos: { total: 0, efectivo: 0, transferencia: 0, tarjeta: 0 },
        totalGeneral: 0,
    });

    const obtenerRangoFechas = () => {
    const [year, month] = mes.split("-");
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    endDate.setHours(23, 59, 59, 999);

    return { startDate, endDate };
};

    const cargarResumen = async () => {
    try {
        setLoading(true);
        setError("");

        const { startDate, endDate } = obtenerRangoFechas();

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
                transferencia: res.data?.ligas?.transferencia || 0,
                tarjeta: res.data?.ligas?.tarjeta || 0,
            },
            mensualidades: {
                total: res.data?.mensualidades?.total || 0,
                efectivo: res.data?.mensualidades?.efectivo || 0,
                transferencia: res.data?.mensualidades?.transferencia || 0,
                tarjeta: res.data?.mensualidades?.tarjeta || 0,
            },
            productos: {
                total: res.data?.productos?.total || 0,
                efectivo: res.data?.productos?.efectivo || 0,
                transferencia: res.data?.productos?.transferencia || 0,
                tarjeta: res.data?.productos?.tarjeta || 0,
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
   useEffect(() => {
    cargarResumen();
}, []);
}, []);

    // Componente interno para no repetir código de las tarjetas
    const StatCard = ({ title, stats }) => (
        <Card className="p-3 shadow-sm h-100">
            <h5 className="text-center">{title}</h5>
            <hr />
            <div className="d-flex justify-content-between mb-2">
                <strong>Total:</strong>
                <strong>${(stats.total || 0).toLocaleString("es-CO")}</strong>
            </div>
            <div className="d-flex justify-content-between">
                <span>Efectivo:</span>
                <span>${(stats.efectivo || 0).toLocaleString("es-CO")}</span>
            </div>
            <div className="d-flex justify-content-between">
                <span>Transferencia:</span>
                <span>${(stats.transferencia || 0).toLocaleString("es-CO")}</span>
            </div>
            <div className="d-flex justify-content-between">
                <span>Tarjeta:</span>
                <span>${(stats.tarjeta || 0).toLocaleString("es-CO")}</span>
            </div>
        </Card>
    );

    return (
        <div className="container mt-4">
            <h2 className="mb-4">Resumen General de Recaudo</h2>

            {error && <Alert variant="danger">{error}</Alert>}

            <Card className="mb-4">
                <Card.Body>
                    <Row className="align-items-end">
                       

                       
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

                        

                        <Col md={3}>
                            <Button
                                type="button"
                                variant="primary"
                                className="w-100"
                                onClick={cargarResumen}
                                disabled={loading}
                            >
                                {loading ? <Spinner size="sm" /> : "Consultar"}
                            </Button>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            {loading ? (
                <div className="text-center my-5">
                    <Spinner animation="border" variant="primary" />
                </div>
            ) : (
                <>
                    <Row className="mb-4">
                        <Col md={4} className="mb-3 mb-md-0">
                            <StatCard title="Ligas" stats={data.ligas} />
                        </Col>
                        <Col md={4} className="mb-3 mb-md-0">
                            <StatCard title="Mensualidades" stats={data.mensualidades} />
                        </Col>
                        <Col md={4}>
                            <StatCard title="Productos" stats={data.productos} />
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
