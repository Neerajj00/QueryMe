import { Button } from "@/components/ui/button";
import React from "react";
import { Plus } from "lucide-react";
import { DatabaseCard } from "./DatabaseCard";
import { AddDatabaseDialog } from './AddDatabaseDialog';
import { getDatabases } from "@/lib/actions/database";

async function page() {
  const databases = await getDatabases();
  return (
    <div className="h-full w-full flex flex-col overflow-hidden">
      {/* top fixed */}
      <div className=" w-full h-16 justify-end shrink-0 flex">
        <AddDatabaseDialog />
      </div>

      {/* scrollable area */}
      <div className="flex-1 overflow-y-auto mt-2 ">
        <div className=" w-full grid  sm:grid-cols-1  md:grid-cols-2 lg:grid-cols-3 gap-4">
        
        {
          databases.map((db) => (
            <DatabaseCard 
              key={db.id}
              name={db.name}
              type={db.dbType}
              createdAt={db.createdAt.toISOString().split("T")[0]} // Format date
            />
          ))
        }
        </div>
      </div>
    </div>
  );
}

export default page;
