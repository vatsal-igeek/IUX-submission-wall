import { useEffect, useState } from "react";

import { Country } from "country-state-city";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import useDropdown from "../../hooks/useDropdown";
import { CalendarSvg } from "../../icons";
import axios from "axios";

const RegisterPage = () => {
  const genderOptions = ["Male", "Female", "Non-binary", "Prefer not to say"];
  const countryOptions = Country.getAllCountries().map((country) => country.name);

  const genderDropdown = useDropdown({ options: genderOptions });
  const countryDropdown = useDropdown({ options: countryOptions });

  const [dob, setDob] = useState<Date | null>(null);

  // Auto-detect country on mount
  useEffect(() => {
    if (!countryDropdown.selectedValue) {
      axios.get("https://ipapi.co/json/")
        .then((res) => {
          const data = res.data;
          if (data && data.country_name) {
            const found = countryOptions.find((name) => name.toLowerCase() === data.country_name.toLowerCase());
            if (found) countryDropdown.selectOption(found);
          }
        })
        .catch((error) => {
          console.error("Failed to auto-detect country:", error);
        });
    }
    // eslint-disable-next-line
  }, [countryOptions]);

  return (
    <div className="relative z-30 w-full h-full flex flex-col items-center justify-center px-4 pt-[3.375rem]">
      <div className="text-center mx-auto w-full max-w-[65rem]">
        {/* Heading */}
        <h1 className="text-[2.5rem] md:text-[3.75rem] lg:text-[4rem] mx-auto font-extrabold mb-10 lg:mb-20 leading-tight">Register</h1>

        {/* Registration Form */}
        <form className="text-start max-w-[45rem] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-[1.875rem]">
            {/* First Name Field */}
            <div>
              <label className="block text-base font-medium mb-1.5">First name</label>
              <input type="text" name="first_name" placeholder="John" className="w-full p-4 bg-inputBg text-white placeholder:text-subTitle rounded-lg focus:outline-none focus:border focus:border-primary-main" />
            </div>

            {/* Last Name Field */}
            <div>
              <label className="block text-base font-medium mb-1.5">Last name</label>
              <input type="text" name="last_name" placeholder="Doe" className="w-full p-4 bg-inputBg text-white placeholder:text-subTitle rounded-lg focus:outline-none focus:border focus:border-primary-main" />
            </div>
          </div>

          {/* Email Field */}
          <div className="mt-[1.875rem]">
            <label className="block text-base font-medium mb-1.5">Email</label>
            <input type="text" name="email" placeholder="johnexample@gmail.com" className="w-full p-4 bg-inputBg text-white placeholder:text-subTitle rounded-lg focus:outline-none focus:border focus:border-primary-main" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-[1.875rem] mt-[1.875rem]">
            {/* Gender Field */}
            <div>
              <label className="block text-base font-medium mb-1.5">Gender</label>
              <div className="relative" ref={genderDropdown.dropdownRef}>
                <button type="button" onClick={genderDropdown.toggleDropdown} className="w-full p-4 bg-inputBg text-white rounded-lg focus:outline-none focus:border focus:border-primary-main flex items-center justify-between">
                  <span className={genderDropdown.selectedValue ? "text-white" : "text-subTitle"}>{genderDropdown.selectedValue || "Select gender"}</span>
                  <svg className={`w-4 h-4 text-white transition-transform ${genderDropdown.isOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {genderDropdown.isOpen && (
                  <div className={`absolute left-0 right-0 bg-inputBg rounded-lg shadow-lg z-50 ${genderDropdown.direction === "up" ? "bottom-full mb-2" : "top-full mt-2"}`} style={{ maxHeight: 300 }}>
                    <ul className="max-h-60 overflow-y-auto">
                      {genderOptions.map((gender) => (
                        <li
                          key={gender}
                          onClick={() => {
                            genderDropdown.selectOption(gender);
                            genderDropdown.toggleDropdown();
                          }}
                          className="w-full py-3 px-4 text-left hover:cursor-pointer hover:bg-gray-700 transition-colors"
                        >
                          {gender}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* DOB Field */}
            <div>
              <label className="block text-base font-medium mb-1.5">DOB</label>
              <div className="relative">
                <DatePicker selected={dob} onChange={(date) => setDob(date)} dateFormat="dd/MM/yyyy" placeholderText="DD/MM/YYYY" className="w-full p-4 bg-inputBg text-white placeholder:text-subTitle rounded-lg focus:outline-none focus:border focus:border-primary-main pr-12" wrapperClassName="w-full" showPopperArrow={false} popperPlacement="bottom-start" autoComplete="off" />
                <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                  <CalendarSvg />
                </div>
              </div>
            </div>
          </div>

          {/* Country Field */}
          <div className="mt-[1.875rem]">
            <label className="block text-base font-medium mb-1.5">Country</label>
            <div className="relative" ref={countryDropdown.dropdownRef}>
              <button type="button" onClick={countryDropdown.toggleDropdown} className="w-full p-4 bg-inputBg text-white rounded-lg focus:outline-none focus:border focus:border-primary-main flex items-center justify-between">
                <span className={countryDropdown.selectedValue ? "text-white" : "text-subTitle"}>{countryDropdown.selectedValue || "Select country"}</span>
                <svg className={`w-4 h-4 text-white transition-transform ${countryDropdown.isOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {countryDropdown.isOpen && (
                <div className={`absolute flex flex-col left-0 right-0 bg-inputBg rounded-lg shadow-lg z-50 ${countryDropdown.direction === "up" ? "bottom-full mb-2" : "top-full mt-1"}`} style={{ maxHeight: 300 }}>
                  <input type="text" value={countryDropdown.search} onChange={(e) => countryDropdown.setSearch(e.target.value)} placeholder="Search country..." className="p-3 bg-transparent text-white border-b border-gray-600 outline-none" />
                  <ul className="max-h-60 overflow-y-auto mb-2">
                    {countryDropdown.filteredOptions.map((name) => (
                      <li key={name} onClick={() => countryDropdown.selectOption(name)} className={`w-full py-3 px-4 text-left hover:cursor-pointer hover:bg-gray-700 transition-colors`}>
                        {name}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
