"use client";

import * as React from "react"
import { cn } from "@/lib/utils"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"

const SearchBar = React.forwardRef<
  HTMLInputElement,
  React.ComponentProps<"input">
>(({ className, ...props }, ref) => {
  return (
    <div className="relative w-full">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        type="search"
        className={cn("pl-9", className)}
        ref={ref}
        {...props}
      />
    </div>
  )
})

SearchBar.displayName = "SearchBar"

export { SearchBar } 