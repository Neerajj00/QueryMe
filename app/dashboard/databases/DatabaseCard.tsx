"use client";

import { Trash2, Loader2 } from "lucide-react";
import React from "react";
import { deleteDatabase } from "@/lib/actions/database";
import { toast } from "sonner";
import { useConfirmDialog } from "@/hooks/UseConfirmDialog";

interface Props {
  id: string;
  name: string;
  type: string;
  createdAt: string;
}

function formatDate(date: string | Date) {
  const d = new Date(date);

  const day = d.getDate();
  const year = d.getFullYear();

  const month = d.toLocaleString("en-US", {
    month: "long",
  });

  const suffix = getOrdinalSuffix(day);

  return `${day}${suffix} ${month} ${year}`;
}

function getOrdinalSuffix(day: number) {
  if (day > 3 && day < 21) return "th";

  switch (day % 10) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
    default:
      return "th";
  }
}

export function DatabaseCard({
  id,
  name,
  type,
  createdAt,
}: Props) {
  const [deleting, setDeleting] = React.useState(false);
  const confirm = useConfirmDialog();

  async function handleDelete(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    const ok = await confirm({
      title: "Delete database?",
      description: "This action cannot be undone.",
      confirmText: "Delete",
      cancelText: "Cancel",
      type: "danger",
    });

    if (!ok) return;

    setDeleting(true);

    try {
      await deleteDatabase(id);
      toast.success("Database deleted");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div
      className="group flex items-center justify-between
                 rounded-lg border px-4 py-3
                 bg-background hover:bg-muted/40
                 hover:border-muted-foreground/20
                 transition-all"
    >
      {/* LEFT */}
      <div className="flex flex-col min-w-0">
        
        {/* Name */}
        <span className="text-sm font-medium truncate">
          {name}
        </span>

        {/* Meta */}
        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground flex-wrap">
          
          {getDatabaseBadge(name, type)}

          <span className="opacity-50">•</span>

          <span>{formatDate(createdAt)}</span>
        </div>
      </div>

      {/* RIGHT */}
      <button
        onClick={handleDelete}
        disabled={deleting}
        className="p-2 rounded-md text-muted-foreground
                   hover:text-red-500 hover:bg-red-500/10
                   transition opacity-70 group-hover:opacity-100"
      >
        {deleting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Trash2 size={16} />
        )}
      </button>
    </div>
  );
}

/* ---------------- BADGE ---------------- */

function getDatabaseBadge(name: string, type: string) {
  const base =
    "flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-medium";

  const t = type.toLowerCase();

  if (t.includes("mysql")) {
    return (
      <span className={`${base} bg-blue-500/10 text-blue-500`}>
        🐬 {type}
      </span>
    );
  }

  if (t.includes("postgres")) {
    return (
      <span className={`${base} bg-indigo-500/10 text-indigo-500`}>
        🐘 {type}
      </span>
    );
  }

  return (
    <span className={`${base} bg-muted text-muted-foreground`}>
      {name}
    </span>
  );
}