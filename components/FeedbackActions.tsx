"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";  // <-- import toast from sonner
import { sendFeedbackEmail } from "@/lib/utils";

interface FeedbackActionsProps {
  email: string;
  interviewRole: string;
  feedback: any;
}

export default function FeedbackActions({
  email,
  interviewRole,
  feedback,
}: FeedbackActionsProps) {
  const [loading, setLoading] = useState(false);

  const handleSendEmail = async () => {
    setLoading(true);

    const result = await sendFeedbackEmail({
      email,
      subject: `Evalix Feedback - ${interviewRole} Interview`,
      feedback: JSON.stringify(feedback, null, 2),
    });

    setLoading(false);

    if (result.success) {
      toast.success("Feedback email sent successfully!");
    } else {
      toast.error("Failed to send feedback email. Try again.");
    }
  };

  return (
    <div className="mt-6 flex flex-row items-center justify-center gap-x-2">
      <p>Want to get a copy of this feedback?{" "}</p>
      <Button
        onClick={handleSendEmail}
        disabled={loading || !email}
        className="btn-primary"
      >
        {loading ? "Sending..." : "Click here"}
      </Button>
    </div>
  );
}
