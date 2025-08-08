import { Navigate } from "react-router-dom";

import { getCookie, isAuthenticated } from "../utils";
import { routesObject } from "./routesConfig";
import RegisterPage from "../pages/register/RegisterPage";

export const RegisterProtectedRoute = () => {
  const accessToken = getCookie("iux-token") || null;

  if (isAuthenticated(accessToken)) {
    return <Navigate to={routesObject.wishingWall.path} replace />;
  }

  return <RegisterPage />;
};