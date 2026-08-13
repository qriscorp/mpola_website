"use client";

type Carrier = "MTN" | "AIRTEL";

interface CarrierSelectProps {
  value: Carrier;
  onChange: (value: Carrier) => void;
}

const OPTIONS: { id: Carrier; label: string }[] = [
  { id: "MTN", label: "MTN Mobile Money" },
  { id: "AIRTEL", label: "Airtel Money" },
];

/** Auto-selected from the phone prefix by the caller, but always
 * user-overridable — matches kumpi's mobile money network picker. */
export function CarrierSelect({ value, onChange }: CarrierSelectProps) {
  return (
    <div className="flex gap-2">
      {OPTIONS.map((o) => (
        <button
          key={o.id}
          type="button"
          onClick={() => onChange(o.id)}
          className={`flex-1 py-2 rounded-lg text-xs font-semibold border transition-colors ${
            value === o.id
              ? "bg-[#1B2B3A] border-[#1B2B3A] text-white"
              : "bg-white border-gray-300 text-gray-600 hover:border-[#1B2B3A]/40 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:border-gray-500"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
