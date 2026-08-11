"use client";

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

/** Fixed "+256" prefix, user only types the local digits — avoids the
 * ambiguous free-text formats (0..., 256..., +256..., no leading 0) that
 * were reaching UPG inconsistently and getting rejected as "Invalid
 * Customer Number". `value` is always just the local digits (no prefix). */
export function PhoneInput({ value, onChange, placeholder = "7XX XXX XXX" }: PhoneInputProps) {
  return (
    <div className="flex items-center border border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-[#C4A55A]/40">
      <span className="px-3 py-2.5 text-sm font-medium text-gray-500 bg-gray-50 dark:bg-gray-800 border-r border-gray-300 dark:border-gray-700 select-none">
        +256
      </span>
      <input
        type="tel"
        inputMode="numeric"
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, "").slice(0, 9))}
        placeholder={placeholder}
        className="flex-1 px-3 py-2.5 text-sm bg-white dark:bg-gray-900 outline-none min-w-0"
      />
    </div>
  );
}
