import React, { useState, useEffect, useCallback } from "react";
import { Table, Button, Alert, Form, Row, Col, Card } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { obtenerTransacciones } from "../../api/axios";
import * as XLSX from "xlsx";

const Contabilidad = () => {
  const [transacciones, setTransacciones] = useState([]);
  const [totalIngresos, setTotalIngresos] = useState(0);
  const [totalEgresos, setTotalEgresos] = useState(0);
  const [balance, setBalance] = useState(0);

  const [filtroTipo, setFiltroTipo] = useState("mes");
  const [mes, setMes] = useState("");
  const [semana, setSemana] = useState("");
  const [tipoTransaccion, setTipoTransaccion] = useState("");
  const [metodoPago, setMetodoPago] = useState(""); // ⬅️ nuevo estado

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasInitialLoad, setHasInitialLoad] = useState(false);
  const navigate = useNavigate();

  const fetchTransacciones = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const params = {};
      if (filtroTipo === "mes" && mes) {
        const [year, month] = mes.split("-");
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0);
        endDate.setHours(23, 59, 59, 999);
        params.fechaInicio = startDate.toISOString();
        params.fechaFin = endDate.toISOString();
      } else if (filtroTipo === "semana" && semana) {
        const [year, week] = semana.split("-W");
        const startDate = new Date(year, 0, 1);
        startDate.setDate(
          startDate.getDate() + (week - 1) * 7 - startDate.getDay() + 1
        );
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 6);
        endDate.setHours(23, 59, 59, 999);
        params.fechaInicio = startDate.toISOString();
        params.fechaFin = endDate.toISOString();
      }

      if (tipoTransaccion) params.tipo = tipoTransaccion;
      if (metodoPago && metodoPago !== "Todos") {
        params.metodoPago = metodoPago; // ⬅️ enviamos el método al backend
      }

      const response = await obtenerTransacciones(params);
      const fetchedTransacciones = response.data.transacciones || [];
      const ingresos = response.data.totalIngresos || 0;
      const egresos = response.data.totalEgresos || 0;
      const balanceCalc = response.data.balance || 0;

      setTransacciones(fetchedTransacciones);
      setTotalIngresos(ingresos);
      setTotalEgresos(egresos);
      setBalance(balanceCalc);
      setHasInitialLoad(true);
    } catch (err) {
      const errorMessage = err.message || "Error desconocido";
      setError("Error al cargar las transacciones: " + errorMessage);
      if (!hasInitialLoad) {
        setTransacciones([]);
        setTotalIngresos(0);
        setTotalEgresos(0);
        setBalance(0);
      }
    } finally {
      setIsLoading(false);
    }
  }, [filtroTipo, mes, semana, tipoTransaccion, metodoPago, hasInitialLoad]);

  useEffect(() => {
    fetchTransacciones();
  }, [fetchTransacciones]);

  const manejarFiltrar = async (e) => {
    e.preventDefault();
    await fetchTransacciones();
  };

  const limpiarFiltros = async () => {
    setFiltroTipo("mes");
    setMes("");
    setSemana("");
    setTipoTransaccion("");
    setMetodoPago(""); // ⬅️ limpiamos también el método
    await fetchTransacciones();
  };

  const formatFecha = (fecha) => {
    const date = new Date(fecha);
    return new Date(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate()
    ).toLocaleDateString("es-ES");
  };

  const exportarAExcel = () => {
    const datosResumen = [
      {
        Descripción: "Total Ingresos",
        Monto: `$${totalIngresos.toLocaleString()}`,
      },
      {
        Descripción: "Total Egresos",
        Monto: `$${totalEgresos.toLocaleString()}`,
      },
      { Descripción: "Balance", Monto: `$${balance.toLocaleString()}` },
      {},
    ];

    const datosTransacciones = transacciones.map((transaccion) => ({
      Tipo: transaccion.tipo === "ingreso" ? "Ingreso" : "Egreso",
      Descripción: transaccion.descripcion,
      Monto: `$${transaccion.monto.toLocaleString()}`,
      Fecha: formatFecha(transaccion.fecha),
      "Cuenta Débito": transaccion.cuentaDebito,
      "Cuenta Crédito": transaccion.cuentaCredito,
      Referencia: transaccion.referencia,
      "Creado Por": transaccion.creadoPor?.nombre || "Desconocido",
    }));

    const datosCompletos = [...datosResumen, ...datosTransacciones];

    const ws = XLSX.utils.json_to_sheet(datosCompletos);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Reporte Contabilidad");

    XLSX.writeFile(
      wb,
      `Reporte_Contabilidad_${new Date().toISOString().split("T")[0]}.xlsx`
    );
  };

  return (
    <div className="container mt-4">
      <h2>Contabilidad</h2>
      {error && <Alert variant="danger">{error}</Alert>}

      <Card className="mb-4">
        <Card.Body>
          <Card.Title>Filtrar Transacciones</Card.Title>
          <Form onSubmit={manejarFiltrar}>
            <Row>
              <Col md={3}>
                <Form.Group controlId="filtroTipo">
                  <Form.Label>Tipo de Filtro</Form.Label>
                  <Form.Select
                    value={filtroTipo}
                    onChange={(e) => setFiltroTipo(e.target.value)}
                    disabled={isLoading}
                  >
                    <option value="mes">Mes</option>
                    <option value="semana">Semana</option>
                  </Form.Select>
                </Form.Group>
              </Col>

              {filtroTipo === "mes" ? (
                <Col md={3}>
                  <Form.Group controlId="mes">
                    <Form.Label>Yo</Form.Label>
                    <Form.Control
                      type="month"
                      value={mes}
                      onChange={(e) => setMes(e.target.value)}
                      disabled={isLoading}
                    />
                  </Form.Group>
                </Col>
              ) : (
                <Col md={3}>
                  <Form.Group controlId="semana">
                    <Form.Label>Yo</Form.Label>
                    <Form.Control
                      type="week"
                      value={semana}
                      onChange={(e) => setSemana(e.target.value)}
                      disabled={isLoading}
                    />
                  </Form.Group>
                </Col>
              )}

              <Col md={3}>
                <Form.Group controlId="tipoTransaccion">
                  <Form.Label>Tipo de transacción</Form.Label>
                  <Form.Select
                    value={tipoTransaccion}
                    onChange={(e) => setTipoTransaccion(e.target.value)}
                    disabled={isLoading}
                  >
                    <option value="">Todos</option>
                    <option value="ingreso">Ingresos</option>
                    <option value="egreso">Egresos</option>
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={3}>
                <Form.Group controlId="metodoPago">
                  <Form.Label>Método de pago</Form.Label>
                  <Form.Select
                    value={metodoPago}
                    onChange={(e) => setMetodoPago(e.target.value)}
                    disabled={isLoading}
                  >
                    <option value="">Todos</option>
                    <option value="Efectivo">Efectivo</option>
                    <option value="Tarjeta">Tarjeta</option>
                    <option value="Transferencia">Transferencia</option>
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={12} className="d-flex align-items-end mt-3">
                <Button
                  type="submit"
                  variant="primary"
                  className="me-2"
                  disabled={isLoading}
                >
                  Filtrar
                </Button>
                <Button
                  variant="secondary"
                  onClick={limpiarFiltros}
                  disabled={isLoading}
                >
                  Limpiar
                </Button>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>

      <Card className="mb-4">
        <Card.Body>
          <Row>
            <Col>
              <Card.Title>Resumen financiero</Card.Title>
            </Col>
            <Col className="text-end">
              <Button
                variant="success"
                onClick={exportarAExcel}
                disabled={isLoading || transacciones.length === 0 || error}
              >
                Descargar en Excel
              </Button>
            </Col>
          </Row>

          {isLoading ? (
            <p>Cargando resumen...</p>
          ) : error ? (
            <p>Error al cargar el resumen.</p>
          ) : (
            <>
              <p>
                <strong>Ingresos totales:</strong>{" "}
                {totalIngresos > 0
                  ? `$${totalIngresos.toLocaleString()}`
                  : "No hay ingresos registrados"}
              </p>
              <p>
                <strong>Egresos totales:</strong>{" "}
                {totalEgresos > 0
                  ? `$${totalEgresos.toLocaleString()}`
                  : "No hay egresos registrados"}
              </p>
              <p>
                <strong>Saldo:</strong>{" "}
                {`${(totalIngresos - totalEgresos).toLocaleString()}`}
              </p>
            </>
          )}
        </Card.Body>
      </Card>

      <Button
        variant="primary"
        className="mb-3"
        onClick={() => navigate("/contabilidad/crear-transaccion")}
        disabled={isLoading}
      >
        Registrador Nueva Transacción
      </Button>

      {isLoading && <Alert variant="info">Cargando transacciones...</Alert>}
      {!isLoading && transacciones.length === 0 && !error && (
        <Alert variant="info">No hay transacciones para mostrar.</Alert>
      )}

      {!isLoading && transacciones.length > 0 && (
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Tipo</th>
              <th>Descripción</th>
              <th>Monto</th>
              <th>Fecha</th>
              <th>Cuenta Débito</th>
              <th>Cuenta de Crédito</th>
              <th>Referencia</th>
              <th>Creado Por</th>
            </tr>
          </thead>
          <tbody>
            {transacciones.map((transaccion) => (
              <tr key={transaccion._id}>
                <td>{transaccion.tipo === "ingreso" ? "Ingreso" : "Egreso"}</td>
                <td>{transaccion.descripcion}</td>
                <td>${transaccion.monto.toLocaleString()}</td>
                <td>{formatFecha(transaccion.fecha)}</td>
                <td>{transaccion.cuentaDebito}</td>
                <td>{transaccion.cuentaCredito}</td>
                <td>{transaccion.referencia}</td>
                <td>{transaccion.creadoPor?.nombre || "Desconocido"}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
};

export default Contabilidad;
