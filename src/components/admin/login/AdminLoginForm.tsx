import { cn } from "../../../utils/cn";
import MagicBento from "../../animations/MagicBento/MagicBento";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  adminLoginSchema,
  type AdminLoginFormData,
} from "../../../utils/validation";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { setCookie } from "../../../utils";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const AdminLoginForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AdminLoginFormData>({
    resolver: yupResolver(adminLoginSchema),
  });

  const onSubmit = async (data: AdminLoginFormData) => {
    const adminEmail = import.meta.env.VITE_ADMIN_EMAIL;
    const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD;

    if (data.email === adminEmail && data.password === adminPassword) {
      setCookie("isAdmin", "true", 1); // 1 day
      navigate("/admin/dashboard", { replace: true });
      toast.success("Login successfully!");
    } else {
      toast.error("Invalid email or password");
    }
  };

  return (
    <div className="relative z-30 w-full h-full flex flex-col items-center justify-center px-4 pt-[3.375rem]">
      <div className="text-center mx-auto w-full max-w-[65rem]">
        {/* Heading */}
        <h1 className="text-[2.5rem] md:text-[3.75rem] lg:text-[4rem] mx-auto font-extrabold mb-10 lg:mb-20 leading-tight">
          Login
        </h1>

        {/* Login Form */}
        <form
          className="text-start max-w-[45rem] mx-auto"
          onSubmit={handleSubmit(onSubmit)}
        >
          {/* Email Field */}
          <div className="mt-[1.875rem]">
            <label className="block text-base font-medium mb-1.5">Email</label>
            <input
              type="email"
              {...register("email")}
              placeholder="johnexample@gmail.com"
              autoComplete="off"
              className={cn(
                "w-full p-4 bg-inputBg text-white placeholder:text-subTitle rounded-lg focus:outline-none focus:border",
                errors.email ? "border-red-500" : "focus:border-primary-main"
              )}
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div className="mt-[1.875rem] relative">
            <label className="block text-base font-medium mb-1.5">
              Password
            </label>
            <input
              type={showPassword ? "text" : "password"}
              {...register("password")}
              autoComplete="off"
              className={cn(
                "w-full p-4 bg-inputBg text-white placeholder:text-subTitle rounded-lg focus:outline-none focus:border",
                errors.password ? "border-red-500" : "focus:border-primary-main"
              )}
              placeholder="*********"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-4 top-[49px] text-gray-400 hover:text-white"
              tabIndex={-1}
            >
              {!showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">
                {errors.password.message}
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
              buttonText={isSubmitting ? "Submitting..." : "Login"}
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

export default AdminLoginForm;
