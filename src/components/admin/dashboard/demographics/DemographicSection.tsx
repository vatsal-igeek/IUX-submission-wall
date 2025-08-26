import Heading from "../../../common/admin/Heading";
import GenderDistributionDesign from "./GenderSection";
import RegisteredUsers from "./RegisteredUsers";

const DemographicSection = () => {
  const sampleData = [
    { label: "Male", value: 60, color: "bg-emerald-400" },
    { label: "Female", value: 20, color: "bg-blue-400" },
    { label: "Non-binary", value: 15, color: "bg-green-400" },
    { label: "Prefer not to say", value: 5, color: "bg-sky-400" },
  ];
  return (
    <>
      <Heading title="Demographics" />
      <div className="grid grid-cols-2 mt-5 gap-10">
        <RegisteredUsers />
        <GenderDistributionDesign data={sampleData} />
      </div>
    </>
  );
};

export default DemographicSection;
