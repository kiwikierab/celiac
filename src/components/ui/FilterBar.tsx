"use client";

import type { PlaceFilters, PlaceCategory } from "@/types";

interface FilterBarProps {
  filters: PlaceFilters;
  onChange: (filters: PlaceFilters) => void;
}

const CATEGORIES: { value: PlaceCategory | ""; label: string }[] = [
  { value: "", label: "All" },
  { value: "cafe", label: "Café" },
  { value: "restaurant", label: "Restaurant" },
  { value: "bakery", label: "Bakery" },
  { value: "takeaway", label: "Takeaway" },
  { value: "other", label: "Other" },
];

export default function FilterBar({ filters, onChange }: FilterBarProps) {
  const toggle = (key: keyof PlaceFilters) => {
    onChange({ ...filters, [key]: !filters[key as keyof PlaceFilters] });
  };

  return (
    <div className="flex flex-wrap gap-2 items-center">
      {/* Category */}
      <div className="flex gap-1 flex-wrap">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            onClick={() => onChange({ ...filters, category: cat.value })}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
              filters.category === cat.value
                ? "bg-green-600 text-white border-green-600"
                : "bg-white text-stone-600 border-stone-300 hover:border-green-400"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <div className="w-px h-5 bg-stone-200 hidden sm:block" />

      {/* Safety filters */}
      <ToggleChip
        label="GF Menu"
        active={!!filters.gluten_free_menu}
        onClick={() => toggle("gluten_free_menu")}
      />
      <ToggleChip
        label="Dedicated Fryer"
        active={!!filters.dedicated_fryer}
        onClick={() => toggle("dedicated_fryer")}
      />
      <ToggleChip
        label="Dedicated Kitchen"
        active={!!filters.dedicated_kitchen}
        onClick={() => toggle("dedicated_kitchen")}
      />
      <ToggleChip
        label="Trained Staff"
        active={!!filters.staff_trained}
        onClick={() => toggle("staff_trained")}
      />
    </div>
  );
}

function ToggleChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
        active
          ? "bg-green-600 text-white border-green-600"
          : "bg-white text-stone-600 border-stone-300 hover:border-green-400"
      }`}
    >
      {active && "✓ "}
      {label}
    </button>
  );
}
