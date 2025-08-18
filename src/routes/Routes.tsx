import { createBrowserRouter } from "react-router-dom";

import HomePage from "../pages/home/HomePage";
import WishingWallPage from "../pages/wishing-wall/WishingWallPage";
import ProtectedRoute from "./ProtectedRoute";
import { RegisterProtectedRoute } from "./RegisterProtectedRoute";
import { routesObject } from "./routesConfig";
import PrivacyPolicyPage from "../pages/privacyPolicy/PrivacyPolicyPage";
import ContentGuidelinePage from "../pages/contentGuideline/ContentGuidelinePage";
import AdminLoginPage from "../pages/admin/login/LoginPage";
import AdminProtectedRoute from "./AdminProtectedRoute";
import DashboardPage from "../pages/admin/dashboard/DashboardPage";

// Create a router
export const router = createBrowserRouter([
  {
    path: routesObject.home.path,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: routesObject.register.path,
        element: <RegisterProtectedRoute />,
      },
      {
        path: routesObject.privacyPolicy.path,
        element: <PrivacyPolicyPage />,
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
      {
        path: routesObject.contentGuideline.path,
        element: <ContentGuidelinePage />,
      },
    ],
  },

  // ----------------- Admin Routes -----------------
  {
    path: routesObject.admin.login.path,
    element: <AdminLoginPage />,
  },
  {
    element: <AdminProtectedRoute />,
    children: [
      {
        path: routesObject.admin.dashboard.path,
        element: <DashboardPage />,
      },
    ],
  },
]);
