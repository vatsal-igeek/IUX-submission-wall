import { useNavigate } from "react-router-dom";
import { routesObject } from "../../routes/routesConfig";
import BackgroundWithSvg from "../../components/Background/BackgroundWithSvg";
import PolicySection from "../../components/PrivacyPolicy/PolicySection";
import Footer from "../../components/Footer";

const PrivacyPolicyPage = () => {
  const navigate = useNavigate();

  return (
    <>
      <div className="relative min-h-screen p-8">
        <BackgroundWithSvg />
        {/* Logo */}
        <div
          className="absolute top-[3.125rem] left-1/2 -translate-x-1/2 z-50 cursor-pointer"
          onClick={() => navigate(routesObject.home.path)}
        >
          <img src="/IUX-logo-Primary.svg" alt="logo" />
        </div>
        {/* Main Content */}
        <PolicySection />
      </div>
      {/* Footer */}
      <Footer isTransParent={false} />
    </>
  );
};

export default PrivacyPolicyPage;
