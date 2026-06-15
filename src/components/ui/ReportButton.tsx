"use client";

import { useState } from "react";
import { addReport, syncProfileFromAuthUser } from "@/lib/data";
import { useAuthSession } from "@/lib/useAuthSession";
import type { ReportEntityType } from "@/types";

interface ReportButtonProps {
  entityType: ReportEntityType;
  entityId: string;
  compact?: boolean;
}

export default function ReportButton({
  entityType,
  entityId,
  compact = false,
}: ReportButtonProps) {
  const { isConfigured, user } = useAuthSession();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [pending, setPending] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isConfigured || !user) {
    return null;
  }

  const handleSubmit = async () => {
    if (!reason.trim()) {
      setError("Please add a short reason.");
      return;
    }

    setPending(true);
    setError(null);

    try {
      await syncProfileFromAuthUser(user);
      await addReport({
        reporter_id: user.id,
        entity_type: entityType,
        entity_id: entityId,
        reason: reason.trim(),
      });
      setSubmitted(true);
      setOpen(false);
      setReason("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to submit this report.");
    } finally {
      setPending(false);
    }
  };

  return (
    <div className={compact ? "text-xs" : "text-sm"}>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="text-stone-400 hover:text-red-600 transition-colors"
      >
        {submitted ? "Reported" : "Report"}
      </button>

      {open && (
        <div className="mt-2 rounded-xl border border-stone-200 bg-stone-50 p-3 space-y-2">
          <textarea
            rows={3}
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder="What should a moderator review?"
            className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
          />
          {error && <p className="text-xs text-red-600">{error}</p>}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={pending}
              className="rounded-lg bg-stone-900 px-3 py-1.5 text-xs font-semibold text-white"
            >
              {pending ? "Sending…" : "Submit report"}
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-lg border border-stone-300 px-3 py-1.5 text-xs font-semibold text-stone-600"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
