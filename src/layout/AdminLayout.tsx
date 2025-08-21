import { Sidebar, Menu, MenuItem } from "react-pro-sidebar";
import React from "react";
import { links } from "../constant/dashboard";
import { useNavigate } from "react-router-dom";

interface Props {
  children: React.ReactNode;
}

const AdminLayout: React.FC<Props> = ({ children }) => {
  // const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  return (
    <div className="flex h-screen bg-inputBg text-white">
      {/* Sidebar */}
      <Sidebar backgroundColor="bg-inputBg">
        <div className="absolute top-5 left-1/3 -translate-x-1/2 z-50 cursor-pointer">
          <img src="/IUX-logo-Primary.svg" alt="logo" />
        </div>
        <Menu className="pt-24">
          {links.map(({ url, icon: Icon, title }) => {
            return (
              <MenuItem
                onClick={() => {
                  navigate(url);
                }}
                key={url}
                icon={<Icon />}
              >
                {title}
              </MenuItem>
            );
          })}
        </Menu>
      </Sidebar>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-y-auto  bg-black">
        <div className="container ">{children}</div>
      </main>
    </div>
  );
};

export default AdminLayout;
