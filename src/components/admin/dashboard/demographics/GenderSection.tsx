import React, { useState } from "react";
import { cn } from "../../../../utils/cn";

type GenderData = {
  label: string;
  value: number;
  color: string;
};

interface Props {
  data: GenderData[];
}

const GenderDistributionDesign: React.FC<Props> = ({ data }) => {
  // Find max value to normalize bubble sizes
  const maxValue = Math.max(...data.map((d) => d.value));
  const [active, setActive] = useState<"daily" | "weekly" | "monthly">(
    "monthly"
  );

  const getFontSize = (value: number) => {
    const minFont = 20; // px
    const maxFont = 40; // px
    return minFont + (value / maxValue) * (maxFont - minFont); // linear scaling
  };

  return (
    <div className="border-primary-main/20 border flex flex-col justify-between p-5 rounded-2xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-[1.25rem] font-semibold text-cardCreator">
          Total Registered Users
        </p>
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

      {/* Circles */}
      <div className="flex justify-center items-center gap-6 ">
        {data.map((item, idx) => {
          // Scale bubble size (min 60px → max 160px)
          const size = 60 + (item.value / maxValue) * 100;
          const fontSize = getFontSize(item.value);
          return (
            <div
              key={idx}
              className={`${item.color} rounded-full flex items-center justify-center`}
              style={{ width: size, height: size }}
            >
              <span
                className="font-bold text-black"
                style={{ fontSize: `${fontSize}px` }}
              >
                {item.value}%
              </span>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex justify-start gap-6 text-[1rem] ">
        {data.map((item, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <span className={`w-2 h-2  ${item.color}`}></span>
            {item.label}
          </div>
        ))}
      </div>
    </div>
  );
};

export default GenderDistributionDesign;
