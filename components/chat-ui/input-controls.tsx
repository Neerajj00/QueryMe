"use client";

import {  SendHorizonal } from "lucide-react";
import { Button } from "@/components/ui/button";



export function InputControls() {

  return (
    <>
      <div className="flex w-full items-center justify-between px-4">
        
        <div className="flex items-center justify-end w-full gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-white/60 hover:bg-white/10 hover:text-white"
          >
            <SendHorizonal className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </>
  );
}
