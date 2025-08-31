import React from "react";
import { Container, Card } from "react-bootstrap";

const Dashboard = () => {
  return (
    <Container className="mt-4">
      <Card>
        <Card.Body>
          <Card.Title>Bienvenido al Dashboard</Card.Title>
          <Card.Text>
            Este es el panel principal de la aplicación. Desde aquí puedes
            navegar a las diferentes secciones, Este programa te permitira
            Administrar tu Gimnasio en la parte de control de ganancias y
            gastos. clientes, entrenadores, asignacion y creacion de rutinas, y
            mas opciones. Bienvenido a Admin-Gimnasios, La aplicacion que te
            ayudara a llevar el control de tu Gimnasio.
          </Card.Text>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Dashboard;
