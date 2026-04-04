"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Database, MessageSquare, Pencil } from "lucide-react"

interface DatabaseCardProps {
  name: string
  type: string
  createdAt: string
  onChat?: () => void
  onEdit?: () => void
}

export function DatabaseCard({
  name,
  type,
  createdAt,
  onChat,
  onEdit,
}: DatabaseCardProps) {
  return (
    <Card className="bg-white/5 border-white/10 backdrop-blur-md hover:border-white/20 transition-all duration-300 rounded-2xl">
      <CardContent className=" flex flex-col gap-4">
        
        {/* Top Section */}
        <div className="flex flex-col gap-2">
          
          {/* DB Name */}
          <h2 className="text-lg font-semibold text-white">
            {name}
          </h2>

          {/* DB Type Badge */}
          <div className="flex items-center gap-2 text-sm text-white/70">
            <Database className="h-4 w-4" />
            <span>{type}</span>
          </div>

          {/* Created Date */}
          <p className="text-xs text-white/50">
            Added on {createdAt}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-2">
          
          <Button
            variant="secondary"
            size="sm"
            onClick={onChat}
            className="flex-1 bg-white/10 hover:bg-white/20 text-white"
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            Chat
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={onEdit}
            className="text-white/70 hover:text-white hover:bg-white/10"
          >
            <Pencil className="h-4 w-4" />
          </Button>

        </div>
      </CardContent>
    </Card>
  )
}