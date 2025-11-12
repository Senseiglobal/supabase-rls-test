import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, Lock, Eye, Users } from "lucide-react";

const Terms = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-bold">Legal & Terms</h1>
      </div>

      <Card className="border border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-accent" /> Terms & Privacy
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

          <ScrollArea className="h-[60vh] rounded-lg border border-border p-4 bg-muted/30">
            <div className="space-y-6 text-sm">
              <section>
                <h3 className="text-lg font-bold text-foreground mb-3">1. Data Usage & Privacy</h3>
                <div className="space-y-3 text-muted-foreground">
                  <p><strong className="text-foreground">Your Content Ownership:</strong> You retain full ownership of all content, music, and data you upload or connect to Aura Manager. We never claim rights to your creative work.</p>
                  <p><strong className="text-foreground">Purpose-Limited Use:</strong> We use your data exclusively to generate personalized AI insights, analyze performance, and provide strategy recommendations.</p>
                  <p><strong className="text-foreground">No Third-Party Sharing:</strong> Your content and data are never shared or sold without your explicit consent.</p>
                  <p><strong className="text-foreground">Data Security:</strong> All data is encrypted in transit and at rest.</p>
                </div>
              </section>

              <section>
                <h3 className="text-lg font-bold text-foreground mb-3">2. Platform Integrations</h3>
                <div className="space-y-3 text-muted-foreground">
                  <p>When you connect platforms (Spotify, Instagram, etc.), we only access data necessary for insights. You can disconnect any platform at any time.</p>
                </div>
              </section>

              <section>
                <h3 className="text-lg font-bold text-foreground mb-3">3. AI Processing & Insights</h3>
                <div className="space-y-3 text-muted-foreground">
                  <p>Our AI processes your data securely to create insights that belong to you. This data does not train models that benefit others.</p>
                </div>
              </section>

              <section>
                <h3 className="text-lg font-bold text-foreground mb-3">4. Account & Subscription Terms</h3>
                <div className="space-y-3 text-muted-foreground">
                  <p>Free tier provides limited features; paid tiers include enhanced features and insights. Subscriptions auto-renew and can be cancelled anytime.</p>
                </div>
              </section>

              <section>
                <h3 className="text-lg font-bold text-foreground mb-3">5. Contact & Updates</h3>
                <div className="space-y-3 text-muted-foreground">
                  <p>Questions? Email <a href="mailto:privacy@auramanager.app" className="text-accent hover:underline">privacy@auramanager.app</a>.</p>
                  <p>We will notify you of material changes to these terms.</p>
                </div>
              </section>

              <div className="mt-6 p-4 bg-accent/10 rounded-lg border border-accent/20">
                <p className="text-sm text-foreground font-semibold">📅 Last Updated: November 8, 2025</p>
                <p className="text-xs text-muted-foreground mt-1">Version 1.0</p>
              </div>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default Terms;
