import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { routesObject } from "./routesConfig";
import { getCookie } from "../utils";

const AdminProtectedRoute: React.FC = () => {
  const location = useLocation();

  const adminCookieStr = getCookie("isAdmin");
  let isAdmin = false;
  if (adminCookieStr) {
    isAdmin = true;
  } else {
    console.log("Admin cookie not found");
  }

  if (!isAdmin) {
    return (
      <Navigate
        to={routesObject.admin.login.path}
        state={{ from: location }}
        replace
      />
    );
  }

  return <Outlet />;
};

export default AdminProtectedRoute;
