import { useState } from "react";
import { cn } from "../../../../utils/cn";
import LineChart from "../LineChart";

const ChartSection = () => {
  const [active, setActive] = useState<"daily" | "weekly" | "monthly">(
    "monthly"
  );

  const series = [
    {
      name: "Dataset A",
      data: [31, 40, 28, 51, 42, 109, 100],
    },
    {
      name: "Dataset B",
      data: [11, 32, 45, 32, 34, 52, 41],
    },
  ];

  const categories = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  return (
    <div className="p-[30px] border-primary-main/20 rounded-xl border">
      <div className="flex items-center justify-between">
        {/* Title */}
        <p className="text-[1.25rem] font-semibold text-cardCreator">
          Total unique visitors vs Total page view
        </p>

        {/* Buttons */}
        <div className="flex gap-5 items-center">
          {["daily", "weekly", "monthly"].map((label) => (
            <button
              key={label}
              onClick={() => setActive(label as typeof active)}
              className={cn(
                "py-1 text-[1rem] font-medium transition",
                active === label
                  ? "border-primary-main text-primary-main border-b-2"
                  : "text-cardCreator"
              )}
            >
              {label.charAt(0).toUpperCase() + label.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <LineChart
        series={series}
        categories={categories}
        title="Comparison Over Time"
        colors={["#008FFB", "#00E396"]}
        type="area"
      />
    </div>
  );
};

export default ChartSection;
