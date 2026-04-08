"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { DatabaseCard } from "./DatabaseCard";
import { DatabaseFormDialog } from "./AddDatabaseDialog";
import { getDatabaseWithConnection } from "@/lib/actions/database";

export default function PageClient({ databases }: any) {
  const [open, setOpen] = React.useState(false);
  const [editingDb, setEditingDb] = React.useState<any>(null);

  return (
    <div className="h-full w-full flex flex-col overflow-hidden">
      {/* Top bar */}
      <div className="w-full h-16 flex justify-end">
        <Button
          onClick={() => {
            setEditingDb(null); // ADD mode
            setOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Database
        </Button>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto mt-2">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {databases.map((db: any) => (
            <DatabaseCard
              key={db.id}
              id={db.id}
              name={db.name}
              type={db.dbType}
              createdAt={db.createdAt.toISOString().split("T")[0]}
              onEdit={async () => {
                const fullDb = await getDatabaseWithConnection(db.id);
                setEditingDb(fullDb);
                setOpen(true);
              }}
            />
          ))}
        </div>
      </div>

      {/* Dialog (shared for add + edit) */}
      <DatabaseFormDialog
        open={open}
        setOpen={setOpen}
        initialData={editingDb}
      />
    </div>
  );
}
