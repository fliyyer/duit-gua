import React, { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Icon } from './Icon';

interface InfoReminderProps {
  title?: string;
  content: React.ReactNode;
  className?: string;
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
}

export const InfoReminder: React.FC<InfoReminderProps> = ({
  title,
  content,
  className = '',
  side = 'top',
  align = 'center',
}) => {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setOpen((prev) => !prev);
          }}
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={() => setOpen(false)}
          className={`inline-flex items-center justify-center w-4 h-4 rounded-full text-muted-foreground/70 hover:text-foreground hover:bg-muted transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-ring shrink-0 cursor-pointer ${className}`}
          aria-label={title || 'Informasi bantuan'}
          title={title || 'Informasi'}
        >
          <Icon name="info" className="w-3.5 h-3.5" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        side={side}
        align={align}
        sideOffset={6}
        className="w-64 sm:w-72 p-2.5 text-xs rounded-xl border bg-popover text-popover-foreground shadow-lg z-50 pointer-events-auto"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
      >
        {title && (
          <h4 className="font-bold text-foreground text-xs mb-1 flex items-center gap-1.5">
            <Icon name="info" className="w-3.5 h-3.5 text-primary shrink-0" />
            <span>{title}</span>
          </h4>
        )}
        <div className="text-[11px] leading-relaxed text-muted-foreground">
          {content}
        </div>
      </PopoverContent>
    </Popover>
  );
};
