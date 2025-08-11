import { Link } from "react-router-dom";

import { routesObject } from "../routes/routesConfig";

const Footer = () => {
  return (
    <div className="w-full mt-8 bottom-0 md:z-50">
      <div className="my-dashed-border w-full">
        <div className="w-full max-w-[80rem] py-5 mx-auto px-4 xs:px-6 flex flex-col xs:flex-row justify-between items-center text-subTitle text-base font-primary gap-4">
        <span>© 2025 All rights reserved</span>
        <Link to={routesObject.privacyPolicy.path} className="hover:text-primary-main hover:underline">
          Privacy Policy
        </Link>
        </div>
      </div>
    </div>
  );
};

export default Footer;
