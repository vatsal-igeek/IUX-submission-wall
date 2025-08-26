import Heading from "../../../common/admin/Heading";
import ChartSection from "./ChartSection";
import MatrixCard from "./MatrixCard";

const ReachSection = () => {
  return (
    <div className="pt-10 pb-[60px]">
      <Heading title="Reach / Traffic" />
      <div className="grid grid-cols-2 gap-5 mt-5 mb-10">
        <MatrixCard
          count={500}
          percentage={50}
          trend="up"
          title="Total Unique Visitors"
        />
        <MatrixCard
          count={500000}
          percentage={50}
          trend="down"
          title="Total Page View"
        />
      </div>

      <ChartSection />
    </div>
  );
};

export default ReachSection;
