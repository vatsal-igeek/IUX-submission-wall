import { useNavigate } from "react-router-dom";

import BackgroundWithSvg from "../../components/Background/BackgroundWithSvg";
import { routesObject } from "../../routes/routesConfig";
import AddWishesSection from "../../components/WishingWall/AddWishesSection";
import WishesCards from "../../components/WishingWall/WishesCards";
import Footer from "../../components/Footer";

const WishingWallPage = () => {
  const navigate = useNavigate();

  return (
    <>
      {/* Add whishes section */}
      <div className="relative flex flex-col pb-56">
        <BackgroundWithSvg />

        {/* Header - iUX Logo */}
        <div className="absolute top-[3.125rem] left-1/2 -translate-x-1/2 cursor-pointer" onClick={() => navigate(routesObject.home.path)}>
          <img src="/IUX-logo-Primary.svg" alt="logo" />
        </div>

        {/* Main content */}
        <div className="flex-1 pt-[7rem]">
          <AddWishesSection />
        </div>
      </div>

      <div className="bg-black z-50">
        {/* Wishes cards section */}
        <WishesCards />

        {/* Footer */}
        <Footer />
      </div>
    </>
  );
};

export default WishingWallPage;
