import { useEffect } from "react";
import { Navigate, Outlet, useLocation, useSearchParams } from "react-router-dom";

const PrivateRoute = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const isPublic = searchParams.get("public") === "true";

  console.log("PrivateRoute - Ruta actual:", location.pathname, "isPublic:", isPublic);

  // Si es una ruta pública forzada o definida, permite el acceso
  const publicRoutes = [
    "/login",
    "/register",
    "/consulta-usuario",
  ];
  if (isPublic || publicRoutes.includes(location.pathname)) {
    console.log(`Acceso público permitido para: ${location.pathname}`);
    return <Outlet />;
  }

  // Para rutas protegidas, redirige si no hay token
  const token = localStorage.getItem("token");
  if (!token) {
    console.log("Sin token, redirigiendo a /login");
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default PrivateRoute;
