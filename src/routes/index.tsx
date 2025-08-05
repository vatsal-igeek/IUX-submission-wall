import { createBrowserRouter } from "react-router-dom";

import Layout from "../components/Layout";
import HomePage from "../pages/home/HomePage";

// Create a router
export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      }
    ]
  }
]);
