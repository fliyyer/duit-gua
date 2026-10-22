import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"
import { id } from "date-fns/locale"
import { cn } from "@/lib/utils"
import "react-day-picker/style.css"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      locale={id}
      showOutsideDays={showOutsideDays}
      className={cn("p-2 select-none", className)}
      classNames={{
        months: "flex flex-col sm:flex-row gap-4",
        month: "space-y-3",
        month_caption: "flex justify-center pt-1 relative items-center mb-2 px-6",
        caption_label: "text-sm font-semibold text-foreground capitalize",
        nav: "flex items-center justify-between w-full absolute top-1 inset-x-0 px-1 pointer-events-none",
        button_previous: "h-7 w-7 bg-background border border-input rounded-md inline-flex items-center justify-center opacity-70 hover:opacity-100 hover:bg-muted transition-colors pointer-events-auto",
        button_next: "h-7 w-7 bg-background border border-input rounded-md inline-flex items-center justify-center opacity-70 hover:opacity-100 hover:bg-muted transition-colors pointer-events-auto",
        month_grid: "w-full border-collapse",
        weekdays: "flex justify-between mb-1",
        weekday: "text-muted-foreground w-8 font-normal text-[0.8rem] text-center capitalize",
        week: "flex justify-between w-full mt-1",
        day: "h-8 w-8 text-center text-sm p-0 relative flex items-center justify-center",
        day_button: "h-8 w-8 p-0 font-normal rounded-md flex items-center justify-center transition-colors hover:bg-muted focus:outline-none focus:ring-1 focus:ring-ring text-xs sm:text-sm",
        selected: "!bg-primary !text-primary-foreground font-semibold hover:!bg-primary/90",
        today: "border border-primary font-bold text-primary",
        outside: "text-muted-foreground opacity-30",
        disabled: "text-muted-foreground opacity-20 pointer-events-none",
        range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation, className: chevronClass, ...chevronProps }) => {
          if (orientation === "left") {
            return <ChevronLeft className={cn("h-4 w-4", chevronClass)} {...chevronProps} />
          }
          return <ChevronRight className={cn("h-4 w-4", chevronClass)} {...chevronProps} />
        },
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
