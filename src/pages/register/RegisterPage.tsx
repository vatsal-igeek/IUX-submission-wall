import { useNavigate } from "react-router-dom";

import { RegisterForm } from "../../components/Register/RegisterForm";
import BackgroundWithSvg from "../../components/Background/BackgroundWithSvg";
import { routesObject } from "../../routes/routesConfig";
import Footer from "../../components/Footer";

const RegisterPage = () => {
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
        <RegisterForm />
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default RegisterPage;
