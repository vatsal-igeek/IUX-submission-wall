import type { User } from "../../../../types/userType";

const Avatar = ({
  firstName,
  lastName,
  fallback,
}: {
  firstName?: User["firstName"];
  lastName?: User["lastName"];
  fallback?: string;
}) => {
  const initials =
    firstName && lastName ? `${firstName[0]}${lastName[0]}` : fallback;

  return (
    <div className="w-[70px] h-[70px] rounded-full  flex items-center justify-center bg-primary-main text-black font-bold text-[1rem] ring-2 ring-black">
      {initials}
    </div>
  );
};

export default Avatar;
