import { Outlet } from "react-router-dom";

import BackgroundWithSvg from "./Background/BackgroundWithSvg";
import Footer from "./Footer";

const Layout = () => {
  return (
    <div className="relative min-h-screen flex flex-col">
      <BackgroundWithSvg />

      {/* Header - iUX Logo */}
      <div className="absolute top-[3.125rem] left-1/2 -translate-x-1/2 z-50">
        <img src="/IUX-logo-Primary.svg" alt="logo" />
      </div>

      {/* Main content */}
      <div className="flex-1">
        <Outlet />
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Layout;
