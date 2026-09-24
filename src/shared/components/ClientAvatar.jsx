const AVATAR_COLORS = [
  "bg-blue-600 text-white group-hover:bg-blue-700",
  "bg-violet-600 text-white group-hover:bg-violet-700",
  "bg-cyan-600 text-white group-hover:bg-cyan-700",
  "bg-emerald-600 text-white group-hover:bg-emerald-700",
  "bg-amber-500 text-white group-hover:bg-amber-600",
  "bg-red-600 text-white group-hover:bg-red-700",
];

const getInitials = (name) => {
  const parts = name?.trim().split(/\s+/).filter(Boolean) ?? [];
  if (!parts.length) return "?";
  if (parts.length === 1) return Array.from(parts[0]).slice(0, 2).join("");

  return `${Array.from(parts[0])[0]}${Array.from(parts[1])[0]}`;
};

export default function ClientAvatar({
  name = "",
  colorSeed = 0,
  sizeClass = "h-8 w-8",
  textClass = "text-xs",
  className = "",
}) {
  const colorIndex = Math.abs(Number(colorSeed) || 0) % AVATAR_COLORS.length;

  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full font-medium uppercase ${sizeClass} ${textClass} ${AVATAR_COLORS[colorIndex]} ${className}`}
    >
      {getInitials(name)}
    </div>
  );
}
