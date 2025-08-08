// Register form type
export interface UserData {
  firstName: string;
  lastName: string;
  email: string;
  gender: string;
  dob: Date | null;
  country: string;
  createdAt?: Date;
}

// Protected route props
export interface ProtectedRouteProps {
  redirectPath?: string;
}

// auth protected route props
export interface AuthProtectedRouteProps {
  redirectTo?: string;
}