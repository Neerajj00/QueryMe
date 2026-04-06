"use client";

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
import { addDatabase } from '@/lib/actions/database';

export function AddDatabaseDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <Plus />
          <span className="hidden sm:block">Add Database</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Database</DialogTitle>
        </DialogHeader>

        <form action={addDatabase} className="space-y-4">
          {/* Name */}
          <Label>Connection Name</Label>
          <Input name="name" placeholder="My Production DB" />

          {/* DB Type */}
          <Select name="dbType" required>
            <SelectTrigger className="  text-xs bg-white/10 border-white/20">
              <SelectValue placeholder="Select Database Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="POSTGRES">PostgreSQL</SelectItem>
              <SelectItem value="MYSQL">MySQL</SelectItem>
            </SelectContent>
          </Select>

          {/* Tabs */}
          <Tabs defaultValue="url" className="w-full">
            <TabsList className="grid grid-cols-2">
              <TabsTrigger value="url">Connection URL</TabsTrigger>
              <TabsTrigger value="manual">Manual</TabsTrigger>
            </TabsList>

            {/* URL TAB */}
            <TabsContent value="url">
              <div className="space-y-2">
                <Label>Connection URL</Label>
                <Input
                  name="connectionUrl"
                  placeholder="postgresql://user:password@localhost:5432/mydb"
                />
              </div>
            </TabsContent>

            {/* MANUAL TAB */}
            <TabsContent value="manual" className="space-y-2">
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label>Host</Label>
                  <Input
                    name="host"
                    placeholder="localhost or db.example.com"
                  />
                </div>

                <div className="space-y-1">
                  <Label>Port</Label>
                  <Input name="port" placeholder="5432" />
                </div>

                <div className="space-y-1">
                  <Label>Username</Label>
                  <Input name="username" placeholder="postgres" />
                </div>

                <div className="space-y-1">
                  <Label>Password</Label>
                  <Input
                    name="password"
                    type="password"
                    placeholder="••••••••"
                  />
                </div>

                <div className="space-y-1">
                  <Label>Database Name</Label>
                  <Input name="database" placeholder="my_database" />
                </div>

                <label className="flex items-center gap-2 text-xs mt-2">
                  <Checkbox />
                  Use SSL (recommended for cloud databases)
                </label>
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
