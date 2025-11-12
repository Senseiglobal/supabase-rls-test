import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Search, HelpCircle, Book, MessageCircle, Mail } from "lucide-react";

const Help = () => {
  const faqs = [
    {
      question: "How do I connect my music platforms?",
      answer: "Navigate to Account Settings > Connected Platforms and click the 'Connect' button next to your desired platform. You'll be redirected to authorize AURA to access your account data securely."
    },
    {
      question: "What AI insights does AURA provide?",
      answer: "AURA analyzes your audience data, streaming patterns, and industry trends to provide personalized recommendations on release timing, playlist strategies, promotional opportunities, and audience growth tactics."
    },
    {
      question: "How often are analytics updated?",
      answer: "Analytics are updated in real-time for Pro users, daily for Creator plan users, and weekly for Free plan users. You can manually refresh your dashboard at any time."
    },
    {
      question: "Can I export my reports?",
      answer: "Yes! All reports can be downloaded as PDF or CSV files. Go to the Reports section and click the download button next to any report."
    },
    {
      question: "How do I invite team members?",
      answer: "Team collaboration is available on Creator and Pro plans. Go to Settings > Team and click 'Invite Member' to send an invitation via email."
    },
    {
      question: "Is my data secure?",
      answer: "Absolutely. We use bank-level encryption (AES-256) to protect your data and never share your information with third parties without your explicit consent."
    },
  ];

  return (
    <div className="min-h-screen">
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-screen-2xl">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 text-foreground">Help Center</h1>
          <p className="text-xl text-foreground/70 max-w-2xl mx-auto">
            Find answers to common questions and get support
          </p>
        </div>

        {/* Search */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground/50" />
            <Input 
              placeholder="Search for help..." 
              className="pl-12 h-14 text-lg"
            />
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="p-6 card-urban card-hover text-center cursor-pointer">
            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
              <Book className="h-6 w-6 text-accent" />
            </div>
            <h3 className="font-semibold mb-2 text-foreground">Documentation</h3>
            <p className="text-sm text-foreground/70">Complete guides and tutorials</p>
          </Card>

          <Card className="p-6 card-urban card-hover text-center cursor-pointer">
            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="h-6 w-6 text-accent" />
            </div>
            <h3 className="font-semibold mb-2 text-foreground">Live Chat</h3>
            <p className="text-sm text-foreground/70">Chat with our support team</p>
          </Card>

          <Card className="p-6 card-urban card-hover text-center cursor-pointer">
            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
              <Mail className="h-6 w-6 text-accent" />
            </div>
            <h3 className="font-semibold mb-2 text-foreground">Email Support</h3>
            <p className="text-sm text-foreground/70">Get help via email</p>
          </Card>
        </div>

        {/* FAQs */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-6 text-foreground flex items-center gap-2">
            <HelpCircle className="h-8 w-8 text-accent" />
            Frequently Asked Questions
          </h2>
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, idx) => (
              <AccordionItem key={idx} value={`item-${idx}`} className="card-urban border-none">
                <AccordionTrigger className="px-6 hover:no-underline text-left">
                  <span className="font-semibold text-foreground">{faq.question}</span>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6 text-foreground/70">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* Contact */}
        <Card className="p-12 card-urban border-accent/20 text-center mt-12">
          <h3 className="text-2xl font-bold mb-4 text-foreground">Still need help?</h3>
          <p className="text-foreground/70 mb-6">
            Our support team is here 24/7 to assist you
          </p>
          <Button size="lg">
            Contact Support
          </Button>
        </Card>
      </div>
      <Footer />
    </div>
  );
};

export default Help;
