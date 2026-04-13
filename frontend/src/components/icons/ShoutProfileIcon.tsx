/** Profile + lines from the mouth (simple line icon). */
export function ShoutProfileIcon({
  className,
  dense,
}: {
  className?: string;
  /** Thicker strokes for very small render sizes (e.g. next to “MA” in the nav mark). */
  dense?: boolean;
}) {
  const sw = dense ? 4.2 : 1.5;
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" aria-hidden>
      <g stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 28c-1-11 6.5-19.5 16.5-19.5 5 0 9 2.5 11 6.5" />
        <path d="M39.5 15c2.5 5 1 11.5-4 14.5-2 1.2-4.5 2-7 2.3" />
        <path d="M28.5 31c-3.5 2.5-8.5 3-13 1" />
        <path d="M32 23v1" strokeWidth={dense ? 5.5 : 2.2} />
        <path d="M34 20.5 46 15M35.5 24H48M34 27.5l12 5.5" />
      </g>
    </svg>
  );
}
