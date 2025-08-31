import React, { useContext } from "react";
import { Container } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import Sidebar from "./Sidebar"; // Importamos el Sidebar

const Layout = ({ children }) => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div style={{ display: "flex" }}>
      {user && <Sidebar handleLogout={handleLogout} />}
      <Container className="mt-4" style={{ marginLeft: user ? "250px" : "0" }}>
        {children}
      </Container>
    </div>
  );
};

export default Layout;
