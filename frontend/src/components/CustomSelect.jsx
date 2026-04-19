import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

export default function CustomSelect({
  value,
  onChange,
  options = [],
  placeholder = "Choisir",
  className = "",
  buttonClassName = "",
  menuClassName = "",
  disabled = false,
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  const selected = useMemo(
    () => options.find((opt) => String(opt.value) === String(value)),
    [options, value]
  );

  useEffect(() => {
    function onDocClick(e) {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target)) setOpen(false);
    }

    function onEscape(e) {
      if (e.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onEscape);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onEscape);
    };
  }, []);

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        className={
          "w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-left text-white outline-none " +
          "focus:border-purple-400/30 focus:ring-2 focus:ring-purple-500/10 disabled:opacity-50 disabled:cursor-not-allowed " +
          buttonClassName
        }
      >
        <span className="block truncate text-sm">{selected ? selected.label : placeholder}</span>
        <ChevronDown className={`pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/65 transition ${open ? "rotate-180" : ""}`} />
      </button>

      {open && !disabled && (
        <div
          className={
            "absolute z-[120] mt-1 max-h-64 w-full overflow-auto rounded-2xl border border-white/10 " +
            "bg-[#0b0b16] p-1 shadow-[0_20px_60px_rgba(0,0,0,0.55)] " +
            menuClassName
          }
        >
          {options.length === 0 ? (
            <div className="px-3 py-2 text-sm text-white/50">Aucune option</div>
          ) : (
            options.map((opt) => {
              const active = String(opt.value) === String(value);
              return (
                <button
                  key={String(opt.value)}
                  type="button"
                  disabled={Boolean(opt.disabled)}
                  onClick={() => {
                    onChange?.(opt.value);
                    setOpen(false);
                  }}
                  className={
                    "mb-1 block w-full rounded-xl px-3 py-2 text-left text-sm transition last:mb-0 " +
                    (active ? "bg-white/15 text-white" : "text-white/85 hover:bg-white/10") +
                    (opt.disabled ? " opacity-50 cursor-not-allowed" : "")
                  }
                >
                  <span className="block truncate">{opt.label}</span>
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

