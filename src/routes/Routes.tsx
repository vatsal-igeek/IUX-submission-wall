import { createBrowserRouter } from "react-router-dom";

import Layout from "../components/Layout";
import HomePage from "../pages/home/HomePage";
import WishingWallPage from "../pages/wishing-wall/WishingWallPage";
import ProtectedRoute from "./ProtectedRoute";
import { RegisterProtectedRoute } from "./RegisterProtectedRoute";
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
        element: <RegisterProtectedRoute />,
      },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: routesObject.wishingWall.path,
        element: <WishingWallPage />,
      },
    ],
  },
]);
