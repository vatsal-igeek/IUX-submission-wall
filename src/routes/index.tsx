import { createBrowserRouter } from "react-router-dom";

import HomePage from "../pages/home/HomePage";

// Create a router
export const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
  }
]);
