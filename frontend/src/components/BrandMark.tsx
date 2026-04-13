import { Link } from "react-router-dom";
import { ShoutProfileIcon } from "./icons/ShoutProfileIcon";

export function BrandMark({ linkTo, size = "md" }: { linkTo?: string; size?: "sm" | "md" | "lg" }) {
  const box =
    size === "lg"
      ? "h-12 min-w-[3.5rem] px-1.5 rounded-2xl text-base gap-1"
      : size === "sm"
        ? "h-8 min-w-[2.65rem] px-1 rounded-lg text-[10px] gap-0.5"
        : "h-10 min-w-[3rem] px-1 rounded-xl text-sm gap-0.5";
  const iconCls = size === "lg" ? "h-[18px] w-[18px]" : size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5";

  const inner = (
    <div
      className={`${box} inline-flex items-center justify-center bg-gradient-to-br from-brand-from via-brand-via to-brand-to text-white font-bold shadow-glow ring-1 ring-white/20 leading-none tracking-tight`}
    >
      <span>MA</span>
      <ShoutProfileIcon dense className={`${iconCls} shrink-0 opacity-95 text-white`} />
    </div>
  );
  if (linkTo) {
    return (
      <Link to={linkTo} className="inline-flex shrink-0">
        {inner}
      </Link>
    );
  }
  return <span className="inline-flex shrink-0">{inner}</span>;
}
