"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Database,
  Trash2,
  Loader2,
} from "lucide-react";
import React from "react";
import {  deleteDatabase } from "@/lib/actions/database";
import { toast } from "sonner";
import { useConfirmDialog } from "@/hooks/UseConfirmDialog";

interface Props {
  id: string;
  name: string;
  type: string;
  createdAt: string;
}

export function DatabaseCard({
  id,
  name,
  type,
  createdAt,
}: Props) {
  const [deleting, setDeleting] = React.useState(false);

  
  
  const confirm = useConfirmDialog();
  async function handleDelete() {
    const ok = await confirm({
      title: "Are you sure you want to delete this database?",
      description: "This action cannot be undone.",
      confirmText: "Delete",
      cancelText: "Cancel",
      type: "danger"
    })
    if(!ok) return;
    setDeleting(true);

    try {
      await deleteDatabase(id);
      toast.success("Deleted");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <Card className="bg-gradient-to-br from-white/5 to-white/0 border border-white/10 hover:border-white/20 backdrop-blur-xl rounded-2xl transition-all duration-300 group">
      <CardContent className="flex flex-col gap-4 ">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">
              {name}
            </h2>

            <div className="flex items-center gap-2 text-sm text-white/60 mt-1">
              <Database className="h-4 w-4" />
              {type}
            </div>
          </div>
        </div>


        {/* Footer */}
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-white/40">
            {createdAt}
          </p>

          <div className="flex items-center gap-2">
            <Button
              size="icon"
              variant="ghost"
              onClick={handleDelete}
              disabled={deleting}
              className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
            >
              {deleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}