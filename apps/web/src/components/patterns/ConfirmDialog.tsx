import { useState, type ReactNode } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ConfirmDialogProps = {
  open: boolean;
  children?: ReactNode;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  requireReason?: boolean;
  reasonLabel?: string;
  reasonPlaceholder?: string;
  onConfirm: (reason?: string) => void | Promise<void>;
};

export function ConfirmDialog({
  children,
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  destructive,
  requireReason,
  reasonLabel = "Reason",
  reasonPlaceholder = "Provide a reason…",
  onConfirm,
}: ConfirmDialogProps) {
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const reasonValid = !requireReason || reason.trim().length > 0;

  async function handleConfirm() {
    if (!reasonValid) return;
    setSubmitting(true);
    try {
      await onConfirm(requireReason ? reason.trim() : undefined);
      setReason("");
      onOpenChange(false);
    } catch {
      // The mutation reports its error; leave the dialog open to retry.
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          {description ? (
            <AlertDialogDescription>{description}</AlertDialogDescription>
          ) : null}
        </AlertDialogHeader>
        {children}
        {requireReason ? (
          <div className="space-y-2">
            <Label htmlFor="confirm-reason">{reasonLabel}</Label>
            <Textarea
              id="confirm-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={reasonPlaceholder}
              required
            />
          </div>
        ) : null}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={submitting}>
            {cancelLabel}
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={!reasonValid || submitting}
            className={cn(
              destructive && buttonVariants({ variant: "destructive" }),
            )}
            onClick={(e) => {
              e.preventDefault();
              void handleConfirm();
            }}
          >
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
