import { useEffect, useMemo, useRef, useState } from "react";

import { useNavigate } from "react-router-dom";
import "react-datepicker/dist/react-datepicker.css";
import ReCAPTCHA from "react-google-recaptcha";
import { Country } from "country-state-city";
import { useForm } from "react-hook-form";
import axios from "axios";
import { yupResolver } from "@hookform/resolvers/yup";
import toast from "react-hot-toast";

import { useAppDispatch, useAppSelector } from "../../redux/hook";
import useDropdown from "../../hooks/useDropdown";
import { registerSchema, type RegisterFormData } from "../../utils/validation";
import {
  setAccessToken,
  setCaptchaValue,
  setDob,
} from "../../api/auth/authSlice";
import { authService } from "../../api/auth/endPoints";
import { setCookie } from "../../utils";
import { routesObject } from "../../routes/routesConfig";
import DatePicker from "react-datepicker";
import { CalendarSvg } from "../../icons";
import MagicBento from "../animations/MagicBento/MagicBento";
import { Search } from "lucide-react";

export const RegisterForm = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { dob, captchaValue } = useAppSelector((state) => state.auth);
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const genderOptions = ["Male", "Female", "Non-binary", "Prefer not to say"];
  const countryOptions = useMemo(
    () => Country.getAllCountries().map((country) => country.name),
    []
  );

  const genderDropdown = useDropdown({ options: genderOptions });
  const countryDropdown = useDropdown({ options: countryOptions });

  // React Hook Form setup
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    trigger,
  } = useForm<RegisterFormData>({
    resolver: yupResolver(registerSchema),
    mode: "onChange",
  });

  // Auto-detect country on mount
  useEffect(() => {
    const autoDetectCountry = async () => {
      if (!countryDropdown.selectedValue) {
        try {
          const res = await axios.get("http://ip-api.com/json/");
          const data = res.data;

          if (data && data.status === "success" && data.country) {
            const found = countryOptions.find(
              (name) => name.toLowerCase() === data.country.toLowerCase()
            );

            if (found) {
              countryDropdown.selectOption(found);
              setValue("country", found);
            }
          } else {
            console.error(
              "Failed to get country from API response:",
              data.message || "Unknown error"
            );
          }
        } catch (error) {
          console.error("Failed to auto-detect country:", error);
        }
      }
    };
    const timer = setTimeout(autoDetectCountry, 100);
    return () => clearTimeout(timer);
  }, [countryOptions, countryDropdown, setValue]);

  // Update form values when dropdowns change
  useEffect(() => {
    if (genderDropdown.selectedValue) {
      setValue("gender", genderDropdown.selectedValue);
      trigger("gender");
    }

    if (countryDropdown.selectedValue) {
      setValue("country", countryDropdown.selectedValue);
      trigger("country");
    }

    if (dob) {
      setValue("dob", dob);
      trigger("dob");
    }

    if (captchaValue) {
      setValue("captcha", captchaValue);
      trigger("captcha");
    }
  }, [
    genderDropdown.selectedValue,
    countryDropdown.selectedValue,
    dob,
    captchaValue,
    setValue,
    trigger,
  ]);

  const handleCaptchaChange = (value: string | null) => {
    dispatch(setCaptchaValue(value));
  };

  const onSubmit = async (data: RegisterFormData) => {
    setIsSubmitting(true);
    try {
      // Prepare user data for Firebase
      const userData = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        gender: data.gender,
        dob: dob,
        country: data.country,
      };

      // Add user to Firebase
      const userId = await authService.addUser(userData);

      if (userId) {
        dispatch(setAccessToken(userId));
        toast.success("User Register Successfully");
        setCookie("iux-token", userId);
        navigate(routesObject.wishingWall.path);
      }
    } catch (error) {
      console.error("Registration failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative z-30 w-full h-full flex flex-col items-center justify-center px-4 pt-[3.375rem]">
      <div className="text-center mx-auto w-full max-w-[65rem]">
        {/* Heading */}
        <h1 className="text-[2.5rem] md:text-[3.75rem] lg:text-[4rem] mx-auto font-extrabold mb-10 lg:mb-20 leading-tight">
          Register
        </h1>

        {/* Registration Form */}
        <form
          className="text-start max-w-[45rem] mx-auto"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-[1.875rem]">
            {/* First Name Field */}
            <div>
              <label className="block text-base font-medium mb-1.5">
                First name
              </label>
              <input
                type="text"
                {...register("firstName")}
                placeholder="John"
                autoComplete="off"
                className={`w-full p-4 bg-inputBg text-white placeholder:text-subTitle rounded-lg focus:outline-none focus:border ${
                  errors.firstName
                    ? "border-red-500"
                    : "focus:border-primary-main"
                }`}
              />
              {errors.firstName && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.firstName.message}
                </p>
              )}
            </div>

            {/* Last Name Field */}
            <div>
              <label className="block text-base font-medium mb-1.5">
                Last name
              </label>
              <input
                type="text"
                {...register("lastName")}
                placeholder="Doe"
                autoComplete="off"
                className={`w-full p-4 bg-inputBg text-white placeholder:text-subTitle rounded-lg focus:outline-none focus:border ${
                  errors.lastName
                    ? "border-red-500"
                    : "focus:border-primary-main"
                }`}
              />
              {errors.lastName && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.lastName.message}
                </p>
              )}
            </div>
          </div>

          {/* Email Field */}
          <div className="mt-[1.875rem]">
            <label className="block text-base font-medium mb-1.5">Email</label>
            <input
              type="email"
              {...register("email")}
              placeholder="johnexample@gmail.com"
              autoComplete="off"
              className={`w-full p-4 bg-inputBg text-white placeholder:text-subTitle rounded-lg focus:outline-none focus:border ${
                errors.email ? "border-red-500" : "focus:border-primary-main"
              }`}
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-[1.875rem] mt-[1.875rem]">
            {/* Gender Field */}
            <div>
              <label className="block text-base font-medium mb-1.5">
                Gender
              </label>
              <div className="relative" ref={genderDropdown.dropdownRef}>
                <button
                  type="button"
                  onClick={genderDropdown.toggleDropdown}
                  className={`w-full p-4 bg-inputBg text-white rounded-lg focus:outline-none focus:border flex items-center justify-between ${
                    errors.gender
                      ? "border-red-500"
                      : "focus:border-primary-main"
                  }`}
                >
                  <span
                    className={
                      genderDropdown.selectedValue
                        ? "text-white"
                        : "text-subTitle"
                    }
                  >
                    {genderDropdown.selectedValue || "Select gender"}
                  </span>
                  <svg
                    className={`w-4 h-4 text-white transition-transform ${
                      genderDropdown.isOpen ? "rotate-180" : ""
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
                {genderDropdown.isOpen && (
                  <div
                    className={`absolute left-0 right-0 bg-inputBg rounded-lg shadow-lg z-50 ${
                      genderDropdown.direction === "up"
                        ? "bottom-full mb-2"
                        : "top-full mt-2"
                    }`}
                    style={{ maxHeight: 300 }}
                  >
                    <ul className="max-h-60 overflow-y-auto">
                      {genderOptions.map((gender) => (
                        <li
                          key={gender}
                          onClick={() => {
                            genderDropdown.selectOption(gender);
                            genderDropdown.closeDropdown();
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
              {errors.gender && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.gender.message}
                </p>
              )}
            </div>

            {/* DOB Field */}
            <div>
              <label className="block text-base font-medium mb-1.5">DOB</label>
              <div className="relative">
                <DatePicker
                  selected={dob}
                  onChange={(date) => dispatch(setDob(date))}
                  dateFormat="dd/MM/yyyy"
                  placeholderText="DD/MM/YYYY"
                  className={`w-full p-4 bg-inputBg text-white placeholder:text-subTitle rounded-lg focus:outline-none focus:border pr-12 ${
                    errors.dob ? "border-red-500" : "focus:border-primary-main"
                  }`}
                  wrapperClassName="w-full"
                  showPopperArrow={false}
                  popperPlacement="bottom-start"
                  autoComplete="off"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                  <CalendarSvg />
                </div>
              </div>
              {errors.dob && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.dob.message}
                </p>
              )}
            </div>
          </div>

          {/* Country Field */}
          <div className="mt-[1.875rem]">
            <label className="block text-base font-medium mb-1.5">
              Country
            </label>
            <div className="relative" ref={countryDropdown.dropdownRef}>
              <button
                type="button"
                onClick={countryDropdown.toggleDropdown}
                className={`w-full p-4 bg-inputBg text-white rounded-lg focus:outline-none focus:border flex items-center justify-between ${
                  errors.country
                    ? "border-red-500"
                    : "focus:border-primary-main"
                }`}
              >
                <span
                  className={
                    countryDropdown.selectedValue
                      ? "text-white"
                      : "text-subTitle"
                  }
                >
                  {countryDropdown.selectedValue || "Select country"}
                </span>
                <svg
                  className={`w-4 h-4 text-white transition-transform ${
                    countryDropdown.isOpen ? "rotate-180" : ""
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
              {countryDropdown.isOpen && (
                <div
                  className={`absolute flex flex-col left-0 right-0 bg-inputBg rounded-lg shadow-lg z-50 overflow-hidden ${
                    countryDropdown.direction === "up"
                      ? "bottom-full mb-2"
                      : "top-full mt-1"
                  }`}
                  style={{ maxHeight: 300 }}
                >
                  <div className="relative border-b border-gray-600">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      value={countryDropdown.search}
                      onChange={(e) =>
                        countryDropdown.setSearch(
                          e.target.value.replace(/^\s+/, "")
                        )
                      }
                      placeholder="Search country..."
                      className="p-3 bg-transparent text-white  outline-none pl-12"
                      autoComplete="off"
                    />
                  </div>
                  <ul className="max-h-60 overflow-y-auto mb-2">
                    {countryDropdown.filteredOptions.map((name) => (
                      <li
                        key={name}
                        onClick={() => countryDropdown.selectOption(name)}
                        className="w-full py-3 px-4 text-left hover:cursor-pointer hover:bg-gray-700 transition-colors"
                      >
                        {name}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            {errors.country && (
              <p className="text-red-500 text-xs mt-1">
                {errors.country.message}
              </p>
            )}
          </div>

          {/* ReCAPTCHA Field */}
          <div className="mt-[1.875rem]">
            <ReCAPTCHA
              ref={recaptchaRef}
              sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
              onChange={handleCaptchaChange}
              theme="dark"
              size="normal"
            />
            {errors.captcha && (
              <p className="text-red-500 text-xs mt-1">
                {errors.captcha.message}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <div className="mt-[1.875rem]">
            <MagicBento
              textAutoHide={true}
              enableStars={true}
              enableSpotlight={true}
              enableBorderGlow={true}
              enableTilt={true}
              enableMagnetism={true}
              clickEffect={true}
              spotlightRadius={300}
              particleCount={12}
              glowColor="15, 239, 158"
              buttonText={isSubmitting ? "Submitting..." : "Submit"}
              width="100%"
              buttonType="submit"
              isDisabled={isSubmitting}
            />
          </div>
        </form>
      </div>
    </div>
  );
};
