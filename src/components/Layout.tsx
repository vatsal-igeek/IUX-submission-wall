import { Outlet, useNavigate } from "react-router-dom";

import BackgroundWithSvg from "./Background/BackgroundWithSvg";
import Footer from "./Footer";
import { routesObject } from "../routes/routesConfig";

const Layout = () => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen flex flex-col">
      <BackgroundWithSvg />

      {/* Header - iUX Logo */}
      <div className="absolute top-[3.125rem] left-1/2 -translate-x-1/2 z-50 cursor-pointer" onClick={() => navigate(routesObject.home.path)}>
        <img src="/IUX-logo-Primary.svg" alt="logo" />
      </div>

      {/* Main content */}
      <div className="flex-1 pt-[7rem]">
        <Outlet />
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Layout;
