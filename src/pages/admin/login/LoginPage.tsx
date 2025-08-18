import { useNavigate } from "react-router-dom";
import { routesObject } from "../../../routes/routesConfig";
import BackgroundWithSvg from "../../../components/Background/BackgroundWithSvg";
import AdminLoginForm from "../../../components/admin/login/AdminLoginForm";

const AdminLoginPage = () => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen flex flex-col">
      <BackgroundWithSvg />

      {/* Header - iUX Logo */}
      <div
        className="absolute top-[3.125rem] left-1/2 -translate-x-1/2 z-50 cursor-pointer"
        onClick={() => navigate(routesObject.home.path)}
      >
        <img src="/IUX-logo-Primary.svg" alt="logo" />
      </div>

      {/* Main content */}
      <div className="flex-1 pt-[7rem]">
        <AdminLoginForm />
      </div>
    </div>
  );
};

export default AdminLoginPage;
