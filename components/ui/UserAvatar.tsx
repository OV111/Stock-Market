function getInitials(name: string): string {
  const words = name.trim().split(/\s+/);
  if (words.length === 1) return words[0][0]?.toUpperCase() ?? "";
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

const sizeClasses = {
  sm: "size-8 text-xs",
  md: "size-9 text-sm",
};

const UserAvatar = ({
  name,
  size = "sm",
}: {
  name: string;
  size?: "sm" | "md";
}) => {
  return (
    <div
      className={`flex items-center justify-center rounded-full bg-[#3b82f6] text-white font-semibold shrink-0 ${sizeClasses[size]}`}
    >
      {getInitials(name)}
    </div>
  );
};

export default UserAvatar;
