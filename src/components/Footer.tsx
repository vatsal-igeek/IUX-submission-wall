import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <div className="w-full mt-8 bottom-0 md:z-50">
      <div className="border-t border-dashed border-gray-400 py-5 mx-auto px-5 xs:px-6 lg:px-[7.5rem] xl:max-w-[100%] flex flex-row justify-between items-center text-gray-400 text-sm font-primary gap-4">
        <span>© 2025 All rights reserved</span>
        <Link to="#" className="hover:text-primary-main">
          Privacy Policy
        </Link>
      </div>
    </div>
  );
};

export default Footer;
