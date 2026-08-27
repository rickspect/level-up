type AvatarProps = {
  size?: "lg" | "md";
};

const sizeClasses = {
  lg: "h-32 w-32",
  md: "h-24 w-24",
};

export default function Avatar({ size = "lg" }: AvatarProps) {
  return (
    <div
      className={`${sizeClasses[size]} relative flex items-center justify-center rounded-full border-2 border-gold/40 bg-surface-elevated shadow-[0_0_24px_rgba(201,162,39,0.15)]`}
    >
      <div className="absolute inset-1 rounded-full bg-gradient-to-b from-white/10 to-transparent" />
      <svg
        viewBox="0 0 64 64"
        fill="none"
        className="h-1/2 w-1/2 text-muted"
        aria-hidden="true"
      >
        <circle cx="32" cy="22" r="12" fill="currentColor" opacity="0.6" />
        <path
          d="M12 56c4-14 16-20 20-20s16 6 20 20"
          fill="currentColor"
          opacity="0.4"
        />
      </svg>
    </div>
  );
}
