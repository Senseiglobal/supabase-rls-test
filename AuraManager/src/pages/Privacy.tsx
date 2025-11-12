import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card } from "@/components/ui/card";

const Privacy = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 text-foreground">Privacy Policy</h1>
          <p className="text-foreground/70">Last updated: November 8, 2025</p>
        </div>

        <Card className="p-8 space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">1. Information We Collect</h2>
            <div className="space-y-4 text-foreground/80">
              <p>
                When you use AuraManager, we collect the following information to provide our services:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Account Information:</strong> Email address, display name, and profile picture</li>
                <li><strong>Social Media Data:</strong> Public posts, engagement metrics, and audience insights from connected platforms</li>
                <li><strong>Usage Data:</strong> How you interact with our application and features you use</li>
                <li><strong>Technical Data:</strong> IP address, browser type, and device information for security and functionality</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">2. How We Use Your Information</h2>
            <div className="space-y-4 text-foreground/80">
              <p>We use your information exclusively for your benefit:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Personalized Insights:</strong> Generate AI-powered recommendations based on your content performance</li>
                <li><strong>Content Analytics:</strong> Provide detailed analytics about your social media presence</li>
                <li><strong>Platform Integration:</strong> Connect and sync data from your social media accounts</li>
                <li><strong>Service Improvement:</strong> Enhance our AI algorithms and user experience</li>
                <li><strong>Security:</strong> Protect your account and prevent unauthorized access</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">3. Data Sharing and Third Parties</h2>
            <div className="space-y-4 text-foreground/80">
              <p>
                <strong>We do not sell, rent, or share your personal data with third parties for marketing purposes.</strong>
              </p>
              <p>We only share data in these limited circumstances:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Service Providers:</strong> Trusted partners who help us operate our service (e.g., cloud hosting, analytics)</li>
                <li><strong>Legal Requirements:</strong> When required by law or to protect our rights and users' safety</li>
                <li><strong>Business Transfers:</strong> In case of merger or acquisition (users will be notified)</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">4. Your Rights and Control</h2>
            <div className="space-y-4 text-foreground/80">
              <p>You have complete control over your data:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Access:</strong> View all data we have about you</li>
                <li><strong>Correction:</strong> Update or correct your information</li>
                <li><strong>Deletion:</strong> Delete your account and all associated data</li>
                <li><strong>Portability:</strong> Export your data in a readable format</li>
                <li><strong>Opt-out:</strong> Disconnect social media platforms at any time</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">5. Data Security</h2>
            <div className="space-y-4 text-foreground/80">
              <p>
                We implement industry-standard security measures to protect your data:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Encryption in transit and at rest</li>
                <li>Regular security audits and updates</li>
                <li>Access controls and authentication</li>
                <li>Secure cloud infrastructure</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">6. Social Media Platform Data</h2>
            <div className="space-y-4 text-foreground/80">
              <p>
                When you connect social media accounts:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>We only access data you explicitly grant permission for</li>
                <li>We never post on your behalf without your direct action</li>
                <li>You can revoke access at any time through your account settings</li>
                <li>We comply with each platform's data usage policies</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">7. Cookies and Tracking</h2>
            <div className="space-y-4 text-foreground/80">
              <p>
                We use cookies and similar technologies to:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Keep you logged in securely</li>
                <li>Remember your preferences</li>
                <li>Analyze usage patterns to improve our service</li>
                <li>Provide personalized experiences</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">8. Data Retention</h2>
            <div className="space-y-4 text-foreground/80">
              <p>
                We retain your data only as long as necessary to provide our services or as required by law. 
                When you delete your account, we permanently remove your personal data within 30 days.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">9. International Data Transfers</h2>
            <div className="space-y-4 text-foreground/80">
              <p>
                Your data may be processed in countries other than your own. We ensure appropriate 
                safeguards are in place to protect your privacy rights.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">10. Changes to This Policy</h2>
            <div className="space-y-4 text-foreground/80">
              <p>
                We may update this privacy policy from time to time. We will notify you of any 
                material changes by email or through our service.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">11. Contact Us</h2>
            <div className="space-y-4 text-foreground/80">
              <p>
                If you have any questions about this privacy policy or your data, please contact us:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Email:</strong> privacy@auramanager.app</li>
                <li><strong>Website:</strong> https://auramanager.app</li>
              </ul>
            </div>
          </section>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default Privacy;