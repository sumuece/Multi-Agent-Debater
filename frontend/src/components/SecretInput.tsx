import { useId, useState, type InputHTMLAttributes } from "react";

function IconEye({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7Z" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function IconEyeOff({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path
        d="M10.7 10.7a3 3 0 0 0 4.2 4.2M9.88 5.09A10.4 10.4 0 0 1 12 5c6 0 10 7 10 7a18.8 18.8 0 0 1-2.16 3.19m-2.5 2.5A10.4 10.4 0 0 1 12 19c-6 0-10-7-10-7a18.8 18.8 0 0 1 4.07-5.69"
        strokeLinecap="round"
      />
      <path d="M2 2l20 20" strokeLinecap="round" />
    </svg>
  );
}

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, "type">;

/**
 * Masked secret field with an eye toggle. Always starts hidden (password dots).
 */
export function SecretInput({ className = "", id, autoComplete = "off", ...rest }: Props) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input
        id={inputId}
        type={visible ? "text" : "password"}
        spellCheck={false}
        autoComplete={autoComplete}
        className={`input-modern pr-11 ${className}`.trim()}
        {...rest}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-lg p-2 text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.06] transition-colors focus:outline-none focus:ring-2 focus:ring-accent/30"
        aria-label={visible ? "Hide secret" : "Show secret"}
        aria-pressed={visible}
        title={visible ? "Hide" : "Show"}
      >
        {visible ? <IconEyeOff className="h-4 w-4" /> : <IconEye className="h-4 w-4" />}
      </button>
    </div>
  );
}
