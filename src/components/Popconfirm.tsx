import * as React from "react";
import { AlertCircle } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover";
import { Button } from "./ui/button";

export interface PopconfirmProps {
  title?: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel?: () => void;
  children: React.ReactNode;
  align?: "start" | "center" | "end";
  side?: "top" | "right" | "bottom" | "left";
  variant?: "destructive" | "default";
}

export const Popconfirm: React.FC<PopconfirmProps> = ({
  title = "Hapus data ini?",
  description,
  confirmText = "Hapus",
  cancelText = "Batal",
  onConfirm,
  onCancel,
  children,
  align = "end",
  side = "top",
  variant = "destructive",
}) => {
  const [open, setOpen] = React.useState(false);

  const handleConfirm = (e: React.MouseEvent) => {
    e.stopPropagation();
    onConfirm();
    setOpen(false);
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.stopPropagation();
    onCancel?.();
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent
        align={align}
        side={side}
        className="w-64 p-3 rounded-xl shadow-elevated bg-popover border space-y-2.5 z-50"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-2.5">
          <div
            className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 mt-0.5 ${
              variant === "destructive"
                ? "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                : "bg-primary/10 text-primary"
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5" />
          </div>
          <div className="space-y-0.5 text-left min-w-0 flex-1">
            <h5 className="text-xs font-bold text-foreground leading-tight">
              {title}
            </h5>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              {description}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-1.5 pt-1 border-t border-border/60">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleCancel}
            className="h-7 px-2.5 text-[11px] rounded-md font-medium text-muted-foreground hover:text-foreground"
          >
            {cancelText}
          </Button>
          <Button
            type="button"
            variant={variant === "destructive" ? "destructive" : "default"}
            size="sm"
            onClick={handleConfirm}
            className="h-7 px-2.5 text-[11px] rounded-md font-semibold shadow-xs"
          >
            {confirmText}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};
