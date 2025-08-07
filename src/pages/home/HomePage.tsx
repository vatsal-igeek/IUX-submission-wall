import { useNavigate } from "react-router-dom";

import MagicBento from "../../components/animations/MagicBento/MagicBento";
import { HomeDividerSvg } from "../../icons";
import { routesObject } from "../../routes/routesConfig";

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="relative z-30 w-full h-full flex flex-col items-center justify-center px-4">
      <div className="text-center mt-[3.125rem] lg:mt-[7rem] max-w-[62rem] gap-[3.75rem] mx-auto">
        {/* Headline */}
        <h1 className="text-[2.5rem] md:text-[3.75rem] lg:text-[4rem] max-w-[44rem] lg:max-w-[60rem] mx-auto font-extrabold mb-10 lg:mb-[3.75rem] leading-tight">
          The Network of Wisdom: Connecting Financial Insights
        </h1>

        {/* Feature Links */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-2 md:gap-1.5 lg:gap-4 mb-10 lg:mb-[3.75rem] text-primary-main text-xl lg:text-2xl font-medium">
          <span>Uncover the Patterns</span>
          <HomeDividerSvg />
          <span>Build Our Collective Intelligence</span>
          <HomeDividerSvg />
          <span>Share Your Node</span>
        </div>

        {/* Description */}
        <p className="text-base md:text-xl lg:text-2xl mb-10 lg:mb-[3.75rem] text-center mx-auto max-w-[22rem] xs:max-w-full leading-normal text-subTitle">
          Lorem ipsum dolor sit amet consectetur. Eleifend viverra etiam donec in. Neque velit tellus aenean iaculis diam vel ac ultrices urna. Pretium pellentesque nascetur eget fringilla nunc elit
          sit est placerat.
        </p>

        {/* CTA Button */}
        <div onClick={() => navigate(routesObject.register.path)}>
          <MagicBento
            textAutoHide={true}
            enableStars={true}
            enableSpotlight={true}
            enableBorderGlow={true}
            enableTilt={true}
            enableMagnetism={true}
            clickEffect={true}
            spotlightRadius={300}
            particleCount={12}
            glowColor="15, 239, 158"
          />
        </div>
      </div>
    </div>
  );
};

export default HomePage;
