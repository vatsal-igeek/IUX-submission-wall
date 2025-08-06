import useDropdown from "../../hooks/useDropdown";

const RegisterPage = () => {
  const genderOptions = ["Male", "Female", "Non-binary", "Prefer not to say"];
  
  const {
    isOpen: isGenderDropdownOpen,
    selectedValue: selectedGender,
    options: genderOptionsList,
    dropdownRef,
    toggleDropdown,
    selectOption: handleGenderSelect
  } = useDropdown({ options: genderOptions });

  return (
    <div className="relative z-30 w-full h-full flex flex-col items-center justify-center px-4 pt-[3.375rem]">
      <div className="text-center mx-auto w-full max-w-[65rem]">
        {/* Heading */}
        <h1 className="text-[2.5rem] md:text-[3.75rem] lg:text-[4rem] mx-auto font-extrabold mb-10 lg:mb-20 leading-tight">
          Register
        </h1>

        {/* Registration Form */}
        <form className="text-start max-w-[45rem] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-[1.875rem]">
            {/* First Name Field */}
            <div>
              <label className="block text-base font-medium mb-1.5">First name</label>
              <input
                type="text"
                name="first_name"
                placeholder="John"
                className="w-full p-4 bg-inputBg text-white placeholder:text-subTitle rounded-lg focus:outline-none focus:border focus:border-primary-main"
              />
            </div>

            {/* Last Name Field */}
            <div>
              <label className="block text-base font-medium mb-1.5">Last name</label>
              <input
                type="text"
                name="last_name"
                placeholder="Doe"
                className="w-full p-4 bg-inputBg text-white placeholder:text-subTitle rounded-lg focus:outline-none focus:border focus:border-primary-main"
              />
            </div>
          </div>

          {/* Email Field */}
          <div className="mt-[1.875rem]">
            <label className="block text-base font-medium mb-1.5">Email</label>
            <input
              type="text"
              name="email"
              placeholder="johnexample@gmail.com"
              className="w-full p-4 bg-inputBg text-white placeholder:text-subTitle rounded-lg focus:outline-none focus:border focus:border-primary-main"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-[1.875rem] mt-[1.875rem]">
            {/* Gender Field */}
             <div>
               <label className="block text-base font-medium mb-1.5">Gender</label>
               <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={toggleDropdown}
                  className={`w-full p-4 bg-inputBg text-white rounded-lg focus:outline-none ${selectedGender !== "Select gender" ? "focus:border focus:border-primary-main" : ""} flex items-center justify-between`}
                >
                  <span className={selectedGender ? "text-white" : "text-subTitle"}>
                    {selectedGender || "Select gender"}
                  </span>
                  <svg
                    className={`w-4 h-4 text-white transition-transform ${
                      isGenderDropdownOpen ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {isGenderDropdownOpen && (
                  <ul className="absolute flex flex-col gap-2 top-full left-0 right-0 mt-1 bg-inputBg rounded-lg shadow-lg z-50">
                    {genderOptionsList.map((gender, index) => (
                      <li
                        key={gender}
                        onClick={() => handleGenderSelect(gender)}
                        className={`w-full py-2 px-4 text-left hover:cursor-pointer hover:bg-gray-700 transition-colors ${
                          index === 0 ? "mt-2" : ""
                        } ${index === genderOptionsList.length - 1 ? "mb-2" : ""}`}
                      >
                        {gender}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
