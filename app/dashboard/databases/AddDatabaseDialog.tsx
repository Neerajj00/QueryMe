"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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
import { toast } from "sonner";

interface Props {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export function DatabaseFormDialog({ open, setOpen }: Props) {
  const [dbType, setDbType] = React.useState("POSTGRESQL");
  const [pending, startTransition] = React.useTransition();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-lg space-y-4">
        <DialogHeader>
          <DialogTitle>Add Database</DialogTitle>
        </DialogHeader>

        <form
          action={(formData) => {
            startTransition(async () => {
              try {
                await addDatabase(formData);
                toast.success("Database added");

                setOpen(false);
              } catch (err: any) {
                toast.error(err.message || "Something went wrong");
              }
            });
          }}
          className="space-y-4"
        >
          {/* Name */}
          <div className="space-y-1">
            <Label>Connection Name</Label>
            <Input name="name" required />
          </div>

          {/* DB Type */}
          <div className="space-y-1">
            <Label>Database Type</Label>

            <input type="hidden" name="dbType" value={dbType} />

            <Select value={dbType} onValueChange={setDbType}>
              <SelectTrigger>
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
                <Label>Connection URL</Label>
                <Input name="connectionUrl" />
              </div>
            </TabsContent>

            {/* Manual */}
            <TabsContent value="manual">
              <div className="space-y-3">
                <Input name="host" placeholder="Host" />
                <Input name="port" placeholder="Port" />
                <Input name="username" placeholder="Username" />
                <Input name="password" placeholder="Password" type="password" />
                <Input name="database" placeholder="Database" />

                <div className="flex items-center gap-2">
                  <Checkbox name="ssl" />
                  <Label className="text-xs">Use SSL</Label>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Submit */}
          <Button
            type="submit"
            className="w-full"
            disabled={pending || !dbType}
          >
            {pending ? "Connecting..." : "Connect Database"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
