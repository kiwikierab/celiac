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
      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${colorClass}`}>
        {summary}
      </span>
    );
  }

  return (
    <div className="rounded-xl border border-stone-200 bg-stone-50 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-stone-800">Celiac Safety</h3>
        <span className={`text-sm font-semibold px-3 py-1 rounded-full ${colorClass}`}>
          {summary}
        </span>
      </div>

      {/* Feature checklist */}
      <ul className="space-y-1.5 text-sm">
        <SafetyItem label="Gluten-Free Menu" active={place.gluten_free_menu} />
        <SafetyItem label="Dedicated Fryer" active={place.dedicated_fryer} />
        <SafetyItem label="Dedicated Kitchen / Prep Area" active={place.dedicated_kitchen} />
        <SafetyItem label="Staff Trained on Coeliac" active={place.staff_trained} />
      </ul>

      {/* Cross contact notes */}
      {place.cross_contact_notes && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800">
          <span className="font-semibold">Cross-contact note: </span>
          {place.cross_contact_notes}
        </div>
      )}

      {/* Tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1 pt-1">
          {tags.map((tag) => (
            <span
              key={tag}
              className="text-xs bg-green-50 text-green-700 border border-green-200 rounded-full px-2 py-0.5"
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
    <li className={`flex items-center gap-2 ${active ? "text-green-700" : "text-stone-400"}`}>
      <span className="text-base">{active ? "✓" : "✗"}</span>
      <span>{label}</span>
    </li>
  );
}
