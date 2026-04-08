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
import { addDatabase, updateDatabase } from "@/lib/actions/database";
import { toast } from "sonner";

interface Props {
  open: boolean;
  setOpen: (open: boolean) => void;
  initialData?: any;
}

export function DatabaseFormDialog({ open, setOpen, initialData }: Props) {
  const isEdit = !!initialData;

  const [dbType, setDbType] = React.useState(initialData?.dbType || "");
  const [pending, startTransition] = React.useTransition();

  React.useEffect(() => {
    setDbType(initialData?.dbType || "");
  }, [initialData]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-lg space-y-4">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Database" : "Add Database"}
          </DialogTitle>
        </DialogHeader>

        <form
          action={(formData) => {
            startTransition(async () => {
              try {
                if (isEdit) {
                  await updateDatabase(initialData.id, formData);
                  toast.success("Database updated");
                } else {
                  await addDatabase(formData);
                  toast.success("Database added");
                }

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
            <Input
              name="name"
              defaultValue={initialData?.name}
              required
            />
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
                <Input
                  name="connectionUrl"
                  defaultValue={initialData?.connectionUrl}
                />
              </div>
            </TabsContent>

            {/* Manual */}
            <TabsContent value="manual">
              <div className="space-y-3">
                <Input
                  name="host"
                  placeholder="Host"
                  defaultValue={initialData?.host}
                />
                <Input
                  name="port"
                  placeholder="Port"
                  defaultValue={initialData?.port}
                />
                <Input
                  name="username"
                  placeholder="Username"
                  defaultValue={initialData?.username}
                />
                <Input
                  name="password"
                  placeholder="Password"
                  type="password"
                />
                <Input
                  name="database"
                  placeholder="Database"
                  defaultValue={initialData?.database}
                />

                <div className="flex items-center gap-2">
                  <Checkbox
                    name="ssl"
                    defaultChecked={initialData?.ssl}
                  />
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
            {pending
              ? isEdit
                ? "Updating..."
                : "Connecting..."
              : isEdit
              ? "Update Database"
              : "Connect Database"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}