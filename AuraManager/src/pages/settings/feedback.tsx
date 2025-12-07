import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { MessageCircle, Send, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/PageHeader";
import { PageContainer } from "@/components/PageContainer";

const issueTypes = [
  { value: "bug", label: "Bug Report" },
  { value: "feature", label: "Feature Request" },
  { value: "improvement", label: "Improvement Suggestion" },
  { value: "ui", label: "UI/UX Issue" },
  { value: "performance", label: "Performance Issue" },
  { value: "other", label: "Other" },
];

export default function Feedback() {
  const [issueType, setIssueType] = useState("bug");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!description.trim()) {
      toast.error("Please describe the issue");
      return;
    }

    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // TODO: Create feedback table in Supabase and insert the feedback
      // For now, we'll just store it in localStorage and show success
      const feedback = {
        user_id: user?.id,
        type: issueType,
        subject,
        description,
        email: email || user?.email,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent,
      };

      // Store in localStorage temporarily
      const existingFeedback = JSON.parse(localStorage.getItem("aura_feedback") || "[]");
      existingFeedback.push(feedback);
      localStorage.setItem("aura_feedback", JSON.stringify(existingFeedback));

      toast.success("Feedback submitted successfully", {
        description: "Thank you for helping us improve Aura Manager!",
      });

      // Reset form
      setSubject("");
      setDescription("");
      setEmail("");
      setIssueType("bug");
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast.error("Failed to submit feedback. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title="Report a Problem"
        description="Help us improve by reporting bugs or suggesting features"
      />

      <div className="grid gap-6 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Send Feedback
            </CardTitle>
            <CardDescription>
              Describe the issue you're experiencing or the feature you'd like to see
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="issue-type">Type of Issue</Label>
                <Select value={issueType} onValueChange={setIssueType}>
                  <SelectTrigger id="issue-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {issueTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Subject (optional)</Label>
                <Input
                  id="subject"
                  placeholder="Brief summary of the issue"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the issue in detail. Include steps to reproduce if reporting a bug."
                  rows={6}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Contact Email (optional)</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  We'll use this to follow up if needed
                </p>
              </div>

              <div className="pt-4 border-t">
                <Button type="submit" disabled={submitting} className="w-full sm:w-auto">
                  <Send className="h-4 w-4 mr-2" />
                  {submitting ? "Submitting..." : "Submit Feedback"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Reporting Tips
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>
              <strong>For bugs:</strong> Include steps to reproduce, expected behavior, and actual behavior.
            </p>
            <p>
              <strong>For features:</strong> Explain the use case and how it would help you.
            </p>
            <p>
              <strong>For UI issues:</strong> Include screenshots if possible (you can attach them via email).
            </p>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
