"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Plus } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { addDatabase } from "@/lib/actions/database";

export function AddDatabaseDialog() {
  const [dbType, setDbType] = React.useState("")

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          <span className="hidden sm:block">Add Database</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg space-y-4">
        <DialogHeader>
          <DialogTitle>Add Database</DialogTitle>
        </DialogHeader>

        <form action={addDatabase} className="space-y-4">
          
          {/* Connection Name */}
          <div className="space-y-1">
            <Label htmlFor="name">Connection Name</Label>
            <Input
              id="name"
              name="name"
              placeholder="My Production DB"
              required
            />
          </div>

          {/* DB Type */}
          <div className="space-y-1">
            <Label>Database Type</Label>

            {/* Hidden input (IMPORTANT) */}
            <input type="hidden" name="dbType" value={dbType} />

            <Select onValueChange={setDbType}>
              <SelectTrigger className="bg-white/10 border-white/20">
                <SelectValue placeholder="Select Database Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="POSTGRESQL">PostgreSQL</SelectItem>
                <SelectItem value="MYSQL">MySQL</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="url" className="w-full">
            <TabsList className="grid grid-cols-2">
              <TabsTrigger value="url">Connection URL</TabsTrigger>
              <TabsTrigger value="manual">Manual</TabsTrigger>
            </TabsList>

            {/* URL */}
            <TabsContent value="url">
              <div className="space-y-1">
                <Label htmlFor="connectionUrl">Connection URL</Label>
                <Input
                  id="connectionUrl"
                  name="connectionUrl"
                  placeholder="postgresql://user:password@localhost:5432/mydb"
                />
              </div>
            </TabsContent>

            {/* MANUAL */}
            <TabsContent value="manual">
              <div className="space-y-3">
                
                <div className="space-y-1">
                  <Label htmlFor="host">Host</Label>
                  <Input id="host" name="host" placeholder="localhost" />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="port">Port</Label>
                  <Input id="port" name="port" placeholder="5432" />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="username">Username</Label>
                  <Input id="username" name="username" placeholder="postgres" />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="database">Database Name</Label>
                  <Input
                    id="database"
                    name="database"
                    placeholder="my_database"
                  />
                </div>

                {/* SSL */}
                <div className="flex items-center gap-2 pt-1">
                  <Checkbox id="ssl" name="ssl" />
                  <Label htmlFor="ssl" className="text-xs cursor-pointer">
                    Use SSL
                  </Label>
                </div>

              </div>
            </TabsContent>
          </Tabs>

          {/* Submit */}
          <Button type="submit" className="w-full">
            Connect Database
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}