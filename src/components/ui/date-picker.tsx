import * as React from "react"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import { Calendar as CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export interface DatePickerProps {
  value?: string | Date
  onChange?: (dateStr: string) => void
  onSelectDate?: (date: Date | undefined) => void
  placeholder?: string
  className?: string
  disabled?: boolean
  align?: "start" | "center" | "end"
  id?: string
}

function parseLocalDate(val: string | Date | undefined): Date | undefined {
  if (!val) return undefined
  if (val instanceof Date) return val
  const parts = val.split("-").map(Number)
  if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
    return new Date(parts[0], parts[1] - 1, parts[2], 12, 0, 0)
  }
  const parsed = new Date(val)
  return isNaN(parsed.getTime()) ? undefined : parsed
}

function formatLocalDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

export function DatePicker({
  value,
  onChange,
  onSelectDate,
  placeholder = "Pilih tanggal",
  className,
  disabled = false,
  align = "start",
  id: elementId,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false)
  const selectedDate = React.useMemo(() => parseLocalDate(value), [value])

  const handleSelect = (date: Date | undefined) => {
    if (date) {
      const formatted = formatLocalDate(date)
      onChange?.(formatted)
      onSelectDate?.(date)
      setOpen(false)
    }
  }

  const handleQuickSelect = (daysAgo: number) => {
    const target = new Date()
    target.setDate(target.getDate() - daysAgo)
    const formatted = formatLocalDate(target)
    onChange?.(formatted)
    onSelectDate?.(target)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={elementId}
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full justify-start text-left font-normal h-10 px-3 border-input hover:bg-accent/40 rounded-lg",
            !selectedDate && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
          <span className="truncate">
            {selectedDate ? (
              format(selectedDate, "d MMMM yyyy", { locale: id })
            ) : (
              placeholder
            )}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 rounded-xl shadow-elevated" align={align}>
        <div className="flex items-center justify-between border-b px-3 py-2 bg-muted/30">
          <span className="text-xs font-semibold text-muted-foreground">Pintas:</span>
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={() => handleQuickSelect(0)}
              className="text-xs px-2 py-1 rounded-md bg-background border hover:bg-accent hover:text-accent-foreground font-medium transition-colors"
            >
              Hari ini
            </button>
            <button
              type="button"
              onClick={() => handleQuickSelect(1)}
              className="text-xs px-2 py-1 rounded-md bg-background border hover:bg-accent hover:text-accent-foreground font-medium transition-colors"
            >
              Kemarin
            </button>
          </div>
        </div>
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleSelect}
          autoFocus
        />
      </PopoverContent>
    </Popover>
  )
}
