import React from "react";

interface Props {
  title: string;
}

const Heading: React.FC<Props> = ({ title }) => {
  return <h1 className="font-bold text-[32px] text-white">{title}</h1>;
};

export default Heading;
