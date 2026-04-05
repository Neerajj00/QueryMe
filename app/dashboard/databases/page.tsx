import { Button } from "@/components/ui/button";
import React from "react";
import { Plus } from "lucide-react";
import { DatabaseCard } from "./DatabaseCard";

function page() {
  return (
    <div className="h-full w-full flex flex-col overflow-hidden">
      {/* top fixed */}
      <div className="flex w-full h-16 justify-end shrink-0">
        <Button variant="default">
          <Plus />
          Add Database
        </Button>
      </div>

      {/* scrollable area */}
      <div className="flex-1 overflow-y-auto mt-2 ">
        <div className=" w-full grid  sm:grid-cols-1  md:grid-cols-2 lg:grid-cols-3 gap-4">
        
        <DatabaseCard 
        name = "My Database"
        type = "PostgreSQL"
        createdAt = "2024-06-01"
        />
        <DatabaseCard 
        name = "My Database"
        type = "PostgreSQL"
        createdAt = "2024-06-01"
        />
        <DatabaseCard 
        name = "My Database"
        type = "PostgreSQL"
        createdAt = "2024-06-01"
        />
        <DatabaseCard 
        name = "My Database"
        type = "PostgreSQL"
        createdAt = "2024-06-01"
        />
        <DatabaseCard 
        name = "My Database"
        type = "PostgreSQL"
        createdAt = "2024-06-01"
        />
        <DatabaseCard 
        name = "My Database"
        type = "PostgreSQL"
        createdAt = "2024-06-01"
        />
        <DatabaseCard 
        name = "My Database"
        type = "PostgreSQL"
        createdAt = "2024-06-01"
        />
        <DatabaseCard 
        name = "My Database"
        type = "PostgreSQL"
        createdAt = "2024-06-01"
        />
        <DatabaseCard 
        name = "My Database"
        type = "PostgreSQL"
        createdAt = "2024-06-01"
        />
        <DatabaseCard 
        name = "My Database"
        type = "PostgreSQL"
        createdAt = "2024-06-01"
        />
        <DatabaseCard 
        name = "My Database"
        type = "PostgreSQL"
        createdAt = "2024-06-01"
        />
        <DatabaseCard 
        name = "My Database"
        type = "PostgreSQL"
        createdAt = "2024-06-01"
        />
        </div>
      </div>
    </div>
  );
}

export default page;
