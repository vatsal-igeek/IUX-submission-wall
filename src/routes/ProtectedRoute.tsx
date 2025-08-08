import React from "react";

import { Navigate, Outlet, useLocation } from "react-router-dom";

import type { ProtectedRouteProps } from "../types/authType";
import { getCookie, isAuthenticated } from "../utils";
import { routesObject } from "./routesConfig";

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ redirectPath = routesObject.register.path }) => {
  const location = useLocation();
  const accessToken = getCookie("iux-token") || null;

  // Check if the user is authenticated
  const authenticated = isAuthenticated(accessToken);

  if (!authenticated) {
    // Redirect to login page but save the attempted url
    return <Navigate to={redirectPath} state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
