"use client";

import { useFormStatus } from "react-dom";

export function AdminActionButton({ label, pendingLabel, disabled }: { label: string; pendingLabel: string; disabled?: boolean }) {
  const { pending } = useFormStatus();
  return <button type="submit" disabled={disabled || pending} aria-busy={pending}>{pending ? pendingLabel : label}</button>;
}
