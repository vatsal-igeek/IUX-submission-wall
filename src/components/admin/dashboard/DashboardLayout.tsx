import { Search, SquareArrowOutUpRight } from "lucide-react";
import ReachSection from "./reachSection/ReachSection";
import DemographicSection from "./demographics/DemographicSection";

const DashboardLayout = () => {
  return (
    <div>
      <div className="flex justify-between items-center">
        <div className="flex items-center  max-w-md rounded-lg  bg-inputBg py-[15px] px-4  w-[720px] shadow-sm focus-within:ring-2 focus-within:ring-neutral-500">
          <Search className="h-5 w-5 text-white" />
          <input
            type="text"
            placeholder="Search..."
            className="ml-2 w-full bg-transparent text-sm text-subTitle placeholder-subTitle focus:outline-none "
          />
        </div>
        <button className="flex items-center gap-2 bg-primary-main px-4 py-3 rounded-lg text-inputBg">
          <SquareArrowOutUpRight className="h-[22px] w-[22px]" />
          <span className="text-base">Export pdf</span>
        </button>
      </div>

      {/* Reach section */}
      <ReachSection />
      <DemographicSection />
    </div>
  );
};

export default DashboardLayout;
