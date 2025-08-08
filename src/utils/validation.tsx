import * as yup from "yup";

export const registerSchema = yup.object({
    firstName: yup
      .string()
      .required("First name is required")
      .min(2, "First name must be at least 2 characters")
      .max(50, "First name must be less than 50 characters")
      .matches(/^[a-zA-Z\s]*$/, "First name can only contain letters and spaces"),
    lastName: yup
      .string()
      .required("Last name is required")
      .min(2, "Last name must be at least 2 characters")
      .max(50, "Last name must be less than 50 characters")
      .matches(/^[a-zA-Z\s]*$/, "Last name can only contain letters and spaces"),
    email: yup
      .string()
      .required("Email is required")
      .email("Please enter a valid email address"),
    gender: yup
      .string()
      .required("Gender is required")
      .oneOf(["Male", "Female", "Non-binary", "Prefer not to say"], "Please select a valid gender"),
    dob: yup
      .date()
      .required("Date of birth is required")
      .max(new Date(), "Date of birth cannot be in the future"),
    country: yup
      .string()
      .required("Country is required"),
    captcha: yup
      .string()
      .required("Please complete the reCAPTCHA")
  });

export type RegisterFormData = yup.InferType<typeof registerSchema>;
