import Link from "next/link";
import { User, Settings, Bell } from "lucide-react";
import UserAvatar from "./UserAvatar";
import SignOutButton from "./SignOutButton";

const menuLinks = [
  { label: "Profile", href: "/profile", icon: User },
  { label: "Settings", href: "/settings", icon: Settings },
  { label: "Price Alerts", href: "/alerts", icon: Bell },
];

const UserMenu = ({ name, email }: { name: string; email: string }) => {
  return (
    <div className="relative group z-50">
      <button className="cursor-pointer rounded-full ring-2 ring-transparent group-hover:ring-[#3b82f6]/50 transition-all">
        <UserAvatar name={name} />
      </button>

      <div
        className="invisible opacity-0 translate-y-1 group-hover:visible group-hover:opacity-100
        group-hover:translate-y-0 absolute right-0 top-full pt-3 w-64 transition-all duration-200 ease-out"
      >
        <div className="rounded-xl border border-gray-800 bg-[#0a0a0a]/95 backdrop-blur-sm shadow-2xl shadow-black/40 overflow-hidden">
          <div className="flex items-center gap-3 px-4 py-3.5 bg-gradient-to-b from-white/[0.03] to-transparent">
            <UserAvatar name={name} size="md" />
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-100 truncate">{name}</p>
              <p className="text-xs text-gray-500 truncate">{email}</p>
            </div>
          </div>

          <div className="h-px bg-gray-800" />

          <div className="p-1.5 flex flex-col">
            {menuLinks.map(({ label, href, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-gray-300
                hover:bg-white/5 hover:text-white transition-colors"
              >
                <Icon className="size-4 text-gray-500" />
                {label}
              </Link>
            ))}
          </div>

          <div className="h-px bg-gray-800" />

          <div className="p-1.5">
            <SignOutButton />
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserMenu;
