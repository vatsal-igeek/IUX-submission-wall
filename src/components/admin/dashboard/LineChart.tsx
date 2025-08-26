import React from "react";
import ReactApexChart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";

export interface LineChartProps {
  series: {
    name: string;
    data: number[];
  }[];
  categories: string[];
  title?: string;
  colors?: string[];
  height?: number;
  type?: "line" | "area" | "bar";
}

const LineChart: React.FC<LineChartProps> = ({
  series,
  categories,
  colors = ["#008FFB", "#00E396"], // default blue & green
  height = 350,
  type = "area",
}) => {
  const options: ApexOptions = {
    chart: {
      type,
      zoom: { enabled: false },
      background: "#000",
      toolbar: { show: false },
      height: 350,
    },
    colors,
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: "smooth",
      width: 2,
    },
    fill: {
      type: "gradient",
      gradient: {
        shade: "dark",
        type: "vertical",
        shadeIntensity: 0.5,
        gradientToColors: colors,
        inverseColors: false,
        opacityFrom: 0.6,
        opacityTo: 0.05,
        stops: [0, 90, 100],
      },
    },
    tooltip: {
      theme: "dark", // ensures dark theme tooltip
      style: {
        fontSize: "14px",
        fontFamily: "inherit",
      },
      y: {
        formatter: (val: number) => val.toString(), // optional formatting
      },
    },
    grid: {
      borderColor: "#333",
      row: {
        colors: ["transparent", "transparent"],
        opacity: 0.1,
      },
    },
    xaxis: {
      categories,
      labels: { style: { colors: "#ccc" } },
    },
    yaxis: {
      labels: { style: { colors: "#ccc" } },
    },
    legend: {
      labels: { colors: "#ccc" },
      position: "bottom",
      horizontalAlign: "left",
      itemMargin: {
        horizontal: 15,
        vertical: 15,
      },
      fontSize: "16px",
      fontWeight: 400,
    },
    title: {
      text: undefined,
    },
  };

  return (
    <ReactApexChart
      options={options}
      series={series}
      type={type}
      height={height}
    />
  );
};

export default LineChart;
