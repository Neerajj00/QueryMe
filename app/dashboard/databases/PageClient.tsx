"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { DatabaseCard } from "./DatabaseCard";
import { DatabaseFormDialog } from "./AddDatabaseDialog";

export default function PageClient({ databases }: any) {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="h-full w-full flex flex-col overflow-hidden">
      {/* Top bar */}
      <div className="w-full flex justify-end">
        <Button
          onClick={() => {
            setOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Database
        </Button>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto mt-2 ">
  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 ">
          {databases.length === 0 && (
            <div className="col-span-full h-full flex w-full  justify-center items-center text-center text-muted-foreground">
              <p>
                No databases added yet. Click &quot;Add Database&quot; to get
                started.
              </p>
            </div>
          )}
          {databases.map((db: any) => (
            <DatabaseCard
              key={db.id}
              id={db.id}
              name={db.name}
              type={db.dbType}
              createdAt={db.createdAt.toISOString().split("T")[0]}
            />
          ))}
        </div>
      </div>

      {/* Dialog (shared for add + edit) */}
      <DatabaseFormDialog
        open={open}
        setOpen={setOpen}
      />
    </div>
  );
}
