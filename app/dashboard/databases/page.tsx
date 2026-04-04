import { Button } from "@/components/ui/button";
import React from "react";
import { Plus } from "lucide-react";
import { DatabaseCard } from "./DatabaseCard";

function page() {
  return (
    <div className="h-screen w-full flex flex-col overflow-y-scroll">
      <div className="flex w-full h-16 justify-end ">
        <Button variant="default">
          <Plus />
          Add Database
        </Button>
      </div>
      <div className=" mt-4 w-full grid  sm:grid-cols-1  md:grid-cols-2 lg:grid-cols-3 gap-4">
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
  );
}

export default page;
