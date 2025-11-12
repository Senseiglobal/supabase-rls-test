import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Shield, Eye, Lock, Users, FileText, CheckCircle2, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface TermsAndConditionsProps {
  isOpen: boolean;
  onAccept: () => void;
  onDecline: () => void;
  trigger?: "signup" | "data_input" | "platform_connect";
}

export const TermsAndConditions = ({ 
  isOpen, 
  onAccept, 
  onDecline, 
  trigger = "signup" 
}: TermsAndConditionsProps) => {
  const [hasScrolled, setHasScrolled] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [agreedToPrivacy, setAgreedToPrivacy] = useState(false);
  const [agreedToDataUsage, setAgreedToDataUsage] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canProceed = agreedToTerms && agreedToPrivacy && agreedToDataUsage && hasScrolled;

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = event.currentTarget;
    const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;
    
    if (scrollPercentage >= 0.9) {
      setHasScrolled(true);
    }
  };

  const handleAccept = async () => {
    if (!canProceed) return;
    
    setIsSubmitting(true);
    
    try {
      // Record user's acceptance in localStorage
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const now = new Date().toISOString();
        localStorage.setItem(`terms_accepted_${user.id}`, "true");
        localStorage.setItem(`terms_version_${user.id}`, "1.0");
        localStorage.setItem(`terms_accepted_at_${user.id}`, now);
        localStorage.setItem(`privacy_policy_accepted_${user.id}`, "true");
        localStorage.setItem(`data_usage_consent_${user.id}`, "true");
      }

      toast.success("Terms and conditions accepted successfully!");
      onAccept();
    } catch (error) {
      console.error("Error accepting terms:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTriggerMessage = () => {
    switch (trigger) {
      case "signup":
        return "Before creating your account, please review and accept our terms.";
      case "data_input":
        return "Before uploading content or connecting platforms, please confirm your data usage preferences.";
      case "platform_connect":
        return "Before connecting external platforms, please review how we handle your data.";
      default:
        return "Please review our terms and conditions.";
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop with dimmer */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" />
      
      {/* Terms Modal */}
      <Card className="relative w-full max-w-4xl mx-4 max-h-[90vh] shadow-2xl border-2 border-accent/20 animate-in slide-in-from-bottom-4 zoom-in-95 duration-300">
        <CardHeader className="pb-4 border-b border-border">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <CardTitle className="text-2xl font-bold text-foreground flex items-center gap-2">
                <Shield className="h-6 w-6 text-accent" />
                Terms & Conditions
              </CardTitle>
              <CardDescription className="text-base">
                {getTriggerMessage()}
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onDecline}
              className="text-muted-foreground hover:text-destructive"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {/* Privacy Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-success/10 border border-success/20">
              <Lock className="h-5 w-5 text-success" />
              <div>
                <p className="font-semibold text-success">Your Data, Your Control</p>
                <p className="text-xs text-muted-foreground">We only use your content for your benefit</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-accent/10 border border-accent/20">
              <Eye className="h-5 w-5 text-accent" />
              <div>
                <p className="font-semibold text-accent">No Third-Party Sharing</p>
                <p className="text-xs text-muted-foreground">Your content stays private to you</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/10 border border-primary/20">
              <Users className="h-5 w-5 text-primary" />
              <div>
                <p className="font-semibold text-primary">AI-Powered Insights</p>
                <p className="text-xs text-muted-foreground">Personal recommendations only</p>
              </div>
            </div>
          </div>

          {/* Terms Content */}
          <ScrollArea 
            className="h-[400px] w-full rounded-lg border border-border p-4 bg-muted/30"
            onScrollCapture={handleScroll}
          >
            <div className="space-y-6 text-sm">
              <section>
                <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  1. Data Usage & Privacy
                </h3>
                <div className="space-y-3 text-muted-foreground">
                  <p>
                    <strong className="text-foreground">Your Content Ownership:</strong> You retain full ownership of all content, music, and data you upload or connect to Aura Manager. We never claim rights to your creative work.
                  </p>
                  <p>
                    <strong className="text-foreground">Purpose-Limited Use:</strong> We use your data exclusively for:
                  </p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Generating personalized AI insights and recommendations</li>
                    <li>Analyzing your music performance and audience engagement</li>
                    <li>Creating custom marketing strategies and release plans</li>
                    <li>Providing industry benchmarking and trend analysis</li>
                  </ul>
                  <p>
                    <strong className="text-foreground">No Third-Party Sharing:</strong> Your content and data are never shared, sold, or provided to third parties without your explicit consent. This includes record labels, streaming platforms, or other artists.
                  </p>
                  <p>
                    <strong className="text-foreground">Data Security:</strong> All data is encrypted in transit and at rest. We use enterprise-grade security measures to protect your information.
                  </p>
                </div>
              </section>

              <section>
                <h3 className="text-lg font-bold text-foreground mb-3">2. Platform Integrations</h3>
                <div className="space-y-3 text-muted-foreground">
                  <p>
                    When you connect external platforms (Spotify, Instagram, TikTok, etc.), we only access data necessary for providing insights:
                  </p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Public profile information and follower counts</li>
                    <li>Engagement metrics and performance data</li>
                    <li>Recently played tracks and playlists (with your permission)</li>
                    <li>Content performance analytics</li>
                  </ul>
                  <p>
                    You can disconnect any platform at any time, and we will stop accessing new data immediately.
                  </p>
                </div>
              </section>

              <section>
                <h3 className="text-lg font-bold text-foreground mb-3">3. AI Processing & Insights</h3>
                <div className="space-y-3 text-muted-foreground">
                  <p>
                    Our AI systems analyze your data to provide personalized recommendations. This processing:
                  </p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>Occurs on secure servers with no human access to your raw data</li>
                    <li>Generates insights that belong entirely to you</li>
                    <li>Does not train models that could benefit other users</li>
                    <li>Can be opted out of at any time through your account settings</li>
                  </ul>
                </div>
              </section>

              <section>
                <h3 className="text-lg font-bold text-foreground mb-3">4. Account & Subscription Terms</h3>
                <div className="space-y-3 text-muted-foreground">
                  <p>
                    <strong className="text-foreground">Free Tier:</strong> Limited platform connections and basic insights.
                  </p>
                  <p>
                    <strong className="text-foreground">Paid Tiers:</strong> Enhanced features, unlimited connections, and advanced AI insights. Subscriptions auto-renew and can be cancelled anytime.
                  </p>
                  <p>
                    <strong className="text-foreground">Data Retention:</strong> If you delete your account, all personal data is permanently removed within 30 days.
                  </p>
                </div>
              </section>

              <section>
                <h3 className="text-lg font-bold text-foreground mb-3">5. Contact & Updates</h3>
                <div className="space-y-3 text-muted-foreground">
                  <p>
                    For questions about data usage or privacy, contact us at{" "}
                    <a href="mailto:privacy@auramanager.app" className="text-accent hover:underline">
                      privacy@auramanager.app
                    </a>
                  </p>
                  <p>
                    We will notify you of any material changes to these terms through the app or email.
                  </p>
                </div>
              </section>

              <div className="mt-6 p-4 bg-accent/10 rounded-lg border border-accent/20">
                <p className="text-sm text-foreground font-semibold">
                  📅 Last Updated: November 8, 2025
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Version 1.0 - Initial Terms & Privacy Policy
                </p>
              </div>
            </div>
          </ScrollArea>

          {/* Scroll Indicator */}
          {!hasScrolled && (
            <div className="mt-2 text-center">
              <Badge variant="outline" className="text-xs">
                Please scroll to read all terms
              </Badge>
            </div>
          )}

          {/* Agreement Checkboxes */}
          <div className="mt-6 space-y-4">
            <div className="flex items-start space-x-2">
              <Checkbox
                id="terms"
                checked={agreedToTerms}
                onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
                className="mt-1"
              />
              <label htmlFor="terms" className="text-sm text-foreground cursor-pointer">
                I have read and agree to the <strong>Terms and Conditions</strong>
              </label>
            </div>

            <div className="flex items-start space-x-2">
              <Checkbox
                id="privacy"
                checked={agreedToPrivacy}
                onCheckedChange={(checked) => setAgreedToPrivacy(checked as boolean)}
                className="mt-1"
              />
              <label htmlFor="privacy" className="text-sm text-foreground cursor-pointer">
                I agree to the <strong>Privacy Policy</strong> and understand how my data is used
              </label>
            </div>

            <div className="flex items-start space-x-2">
              <Checkbox
                id="dataUsage"
                checked={agreedToDataUsage}
                onCheckedChange={(checked) => setAgreedToDataUsage(checked as boolean)}
                className="mt-1"
              />
              <label htmlFor="dataUsage" className="text-sm text-foreground cursor-pointer">
                I consent to AI analysis of my content for <strong>personalized insights only</strong>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <Button
              variant="outline"
              onClick={onDecline}
              className="flex-1"
              disabled={isSubmitting}
            >
              <X className="h-4 w-4 mr-2" />
              Decline
            </Button>
            <Button
              onClick={handleAccept}
              disabled={!canProceed || isSubmitting}
              className="flex-1 bg-gradient-to-r from-accent to-accent-hover"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Accepting...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Accept & Continue
                </>
              )}
            </Button>
          </div>

          {/* Help Text */}
          <p className="text-xs text-muted-foreground text-center mt-4">
            By accepting, you confirm that you are 16 years or older and have the right to agree to these terms.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default TermsAndConditions;