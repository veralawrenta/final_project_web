"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { useReplyReview } from "@/hooks/useReviews";
import { Send, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { createReplyReviewSchema } from "@/lib/validator/dashboard.reviews.schema";

interface ReplyReviewModalProps {
  reviewId: number;
  open: boolean;
  onClose: () => void;
}

const ReplyReviewModal = ({
  reviewId,
  open,
  onClose,
}: ReplyReviewModalProps) => {
  const createReply = useReplyReview();
  const form = useForm<z.infer<typeof createReplyReviewSchema>>({
    resolver: zodResolver(createReplyReviewSchema),
    defaultValues: {
      reviewId,
      reply: "",
    },
  });

  const reply = form.watch("reply");
  const onSubmit = (values: z.infer<typeof createReplyReviewSchema>) => {
    createReply.mutate(values, {
      onSuccess: () => {
        form.reset();
        onClose();
      },
    });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose();
      }}
    >
      <DialogContent className="rounded-2xl">
        <DialogHeader>
          <DialogTitle>Reply to Review</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <Textarea
            placeholder="Write your reply to the guest..."
            className="rounded-xl min-h-[80px] resize-none"
            maxLength={500}
            {...form.register("reply")}
          />
          {form.formState.errors.reply && (
            <p className="text-xs text-destructive">
              {form.formState.errors.reply.message}
            </p>
          )}
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {reply.length}/500
            </span>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4 mr-1" /> Cancel
              </Button>
              <Button
                size="sm"
                onClick={form.handleSubmit(onSubmit)}
                disabled={createReply.isPending}
              >
                <Send className="h-4 w-4 mr-1" />
                {createReply.isPending ? "Posting..." : "Post Reply"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReplyReviewModal;
