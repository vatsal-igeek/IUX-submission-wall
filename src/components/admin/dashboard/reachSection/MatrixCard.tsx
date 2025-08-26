import React from "react";
import { ArrowDown, ArrowUp } from "lucide-react";

interface Props {
  title: string;
  count: number;
  percentage: number;
  trend?: "up" | "down";
}

const formatCount = (num: number) =>
  new Intl.NumberFormat("en", { notation: "compact" }).format(num);

const MatrixCard: React.FC<Props> = ({
  title,
  count,
  percentage,
  trend = "up",
}) => {
  return (
    <div className="flex items-center justify-between  border-primary-main/20 rounded-2xl shadow-md border p-5">
      {/* Left Side */}
      <div>
        <h2 className="text-4xl font-bold bg-gradient-to-r pb-4 from-cyan-400 to-green-400 text-transparent bg-clip-text">
          {formatCount(count)}
        </h2>
        <p className="text-cardCreator text-[1.25rem] font-normal">{title}</p>
      </div>

      {/* Right Side */}
      <div className="flex flex-col items-end">
        <div className="w-20 h-10">
          <svg
            viewBox="0 0 100 40"
            fill="none"
            stroke="url(#gradient)"
            strokeWidth="3"
          >
            <defs>
              <linearGradient
                id="gradient"
                x1="0"
                x2="100"
                y1="0"
                y2="0"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#22d3ee" />
                <stop offset="1" stopColor="#4ade80" />
              </linearGradient>
            </defs>
            <path d="M0 30 Q25 5, 50 25 T100 20" />
          </svg>
        </div>

        {/* Percentage */}
        <div className="flex items-center  mt-5 gap-2 text-green-400 text-sm">
          {trend === "up" ? (
            <div className="bg-primary-main py-1 px-2 rounded-[40px] text-black">
              <ArrowUp size={16} />
            </div>
          ) : (
            <div className="bg-danger py-1 px-2 rounded-[40px] text-black">
              <ArrowDown size={16} />
            </div>
          )}
          <span className="text-[1.25rem] font-normal text-cardCreator">
            {percentage}%
          </span>
        </div>
      </div>
    </div>
  );
};

export default MatrixCard;
