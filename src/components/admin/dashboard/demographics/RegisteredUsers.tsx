import { useState } from "react";
import { cn } from "../../../../utils/cn";
import Avatar from "./Avatar";

const RegisteredUsers = () => {
  const [active, setActive] = useState<"daily" | "weekly" | "monthly">(
    "monthly"
  );
  const users = [
    { firstName: "Alice", lastName: "Smith" },
    { firstName: "Brian", lastName: "Jones" },
    { firstName: "Chris", lastName: "Miller" },
    { firstName: "Dana", lastName: "Taylor" },
  ];

  return (
    <div className="border border-primary-main/20 p-5 rounded-2xl">
      <div className="flex items-center justify-between">
        <p className="text-[1.25rem] font-semibold text-cardCreator">
          Total Registered Users
        </p>
        <div className="flex gap-5 items-center">
          {["daily", "weekly", "monthly"].map((label) => (
            <button
              key={label}
              onClick={() => setActive(label as typeof active)}
              className={cn(
                "py-1 text-[1rem] font-medium transition",
                active === label
                  ? "border-primary-main text-primary-main border-b-2"
                  : "text-cardCreator"
              )}
            >
              {label.charAt(0).toUpperCase() + label.slice(1)}
            </button>
          ))}
        </div>
      </div>
      <h2 className="text-[3.75rem] font-extrabold bg-gradient-to-r pb-4 from-cyan-400 to-green-400 text-transparent bg-clip-text mt-[24px] mb-[6.5rem]">
        500
      </h2>
      <div className="flex -space-x-4">
        {users.map((user, idx) => (
          <Avatar
            key={idx}
            firstName={user.firstName}
            lastName={user.lastName}
          />
        ))}
        <Avatar fallback="+30" />
      </div>
    </div>
  );
};

export default RegisteredUsers;
