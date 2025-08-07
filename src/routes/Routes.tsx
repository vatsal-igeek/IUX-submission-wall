import { createBrowserRouter } from "react-router-dom";

import Layout from "../components/Layout";
import HomePage from "../pages/home/HomePage";
import RegisterPage from "../pages/register/RegisterPage";
import { routesObject } from "./routesConfig";

// Create a router
export const router = createBrowserRouter([
  {
    path: routesObject.home.path,
    element: <Layout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: routesObject.register.path,
        element: <RegisterPage />,
      }
    ]
  },
]);
