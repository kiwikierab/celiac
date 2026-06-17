import type { Place } from "@/types";
import { getSafetyTags, safetySummary, safetyBgColor } from "@/lib/utils";

interface SafetyBadgeProps {
  place: Place;
  size?: "sm" | "md";
}

export default function SafetyBadge({ place, size = "md" }: SafetyBadgeProps) {
  const tags = getSafetyTags(place);
  const summary = safetySummary(place);
  const safetyRating = place.avg_safety_rating ?? 0;
  const colorClass = safetyBgColor(safetyRating);

  if (size === "sm") {
    return (
      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${colorClass}`}>
        {summary}
      </span>
    );
  }

  return (
    <div className="surface-card space-y-4 p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-stone-900">Celiac Safety</h3>
        <span className={`rounded-full px-3 py-1 text-sm font-semibold ${colorClass}`}>
          {summary}
        </span>
      </div>

      <ul className="space-y-1.5 text-sm">
        <SafetyItem label="Gluten-Free Menu" active={place.gluten_free_menu} />
        <SafetyItem label="Dedicated Fryer" active={place.dedicated_fryer} />
        <SafetyItem label="Dedicated Kitchen / Prep Area" active={place.dedicated_kitchen} />
        <SafetyItem label="Staff Trained on Coeliac" active={place.staff_trained} />
      </ul>

      {place.cross_contact_notes && (
        <div className="rounded-[20px] border border-[#ecc8a0] bg-[#fff4e5] p-3 text-xs text-[#8f5722]">
          <span className="font-semibold">Cross-contact note: </span>
          {place.cross_contact_notes}
        </div>
      )}

      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-1">
          {tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-[color:var(--stroke)] bg-[color:var(--panel-sage)] px-3 py-1 text-xs font-medium text-[color:var(--brand)]"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function SafetyItem({ label, active }: { label: string; active: boolean }) {
  return (
    <li className={`flex items-center gap-2 ${active ? "text-[color:var(--brand)]" : "text-stone-400"}`}>
      <span className="text-base">{active ? "✓" : "✗"}</span>
      <span>{label}</span>
    </li>
  );
}
