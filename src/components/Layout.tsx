import { Link } from "react-router-dom";
import { Outlet } from "react-router-dom";

const Layout = () => {
  return (
    <div className="relative min-h-screen">
      {/* Main content */}
      <Outlet />
      
      {/* Footer - Common across all pages */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full z-50">
        <div className="border-t border-dashed border-gray-400 pt-5 mx-auto px-[7.5rem] flex justify-between items-center text-gray-400 text-sm font-primary">
          <span>© 2025 All rights reserved</span>
          <Link to="#" className="hover:text-primary-main">
            Privacy Policy
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Layout; 