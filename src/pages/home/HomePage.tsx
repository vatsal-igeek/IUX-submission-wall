import BackgroundWithSvg from "../../components/Background/BackgroundWithSvg";
import { HomeDividerSvg } from "../../icons";

const HomePage = () => {
  return (
    <div className="w-full h-screen relative overflow-hidden font-primary">
      <BackgroundWithSvg />

      {/* Main Content */}
      <div className="relative z-30 w-full h-full flex flex-col items-center justify-center px-4">
        {/* Header - iUX Logo */}
        <div className="absolute top-[3.125rem] left-1/2 -translate-x-1/2">
          <img src="/IUX-logo-Primary.svg" alt="logo" />
        </div>

        {/* Main Content Area */}
        <div className="text-center max-w-[62rem] gap-[3.75rem] mx-auto">
          {/* Headline */}
          <h1 className="text-[4rem] font-extrabold mb-[3.75rem] leading-tight">
            The Network of Wisdom:
            <br />
            Connecting Financial Insights
          </h1>

          {/* Feature Links */}
          <div className="flex items-center justify-center gap-4 mb-[3.75rem] text-primary-main text-2xl font-medium">
            <span>Uncover the Patterns</span>
            <HomeDividerSvg />
            <span>Build Our Collective Intelligence</span>
            <HomeDividerSvg />
            <span>Share Your Node</span>
          </div>

          {/* Description */}
          <p className="text-2xl mb-[3.75rem] text-center mx-auto leading-normal text-subTitle">Lorem ipsum dolor sit amet consectetur. Eleifend viverra etiam donec in. Neque velit tellus aenean iaculis diam vel ac ultrices urna. Pretium pellentesque nascetur eget fringilla nunc elit sit est placerat.</p>

          {/* CTA Button */}
          <button className="bg-primary-main text-black font-semibold px-6 py-3 rounded-lg text-base">Connect your insight & Explore the network</button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
