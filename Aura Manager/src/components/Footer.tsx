import { Twitter, Instagram, Youtube, Github, ChevronUp, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import BrandLogo from "@/components/BrandLogo";

export function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    product: [
      { name: "Pricing", href: "/pricing" },
      { name: "Help", href: "/help" },
      { name: "Privacy Policy", href: "/privacy" },
      { name: "Terms & Conditions", href: "/terms" },
    ],
  };

  const socialLinks = [
    { icon: Twitter, href: "https://twitter.com", label: "Twitter" },
    { icon: Instagram, href: "https://instagram.com", label: "Instagram" },
    { icon: Youtube, href: "https://youtube.com", label: "YouTube" },
    { icon: Github, href: "https://github.com", label: "GitHub" },
  ];

  return (
    <footer
      className="border-t border-border/50 bg-card/50 backdrop-blur-sm mt-20 select-none"
      onClick={() => {
        // Scroll to top when footer bottom bar clicked
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }}
      role="contentinfo"
    >
      <div className="container mx-auto px-4 py-12 md:py-16">
        {/* Main Footer Content */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-8">
          {/* Brand Section */}
          <div className="max-w-sm">
            <Link to="/" className="flex items-center gap-2 mb-4 hover-scale group">
              <BrandLogo size={32} showText={false} aria-label="Aura Manager" />
              <span className="text-2xl font-bold bg-gradient-to-r from-accent to-accent-hover bg-clip-text text-transparent">Aura</span>
            </Link>
            <p className="text-foreground/70 text-sm mb-4">
              Your AI-Powered Artist Manager. Get personalized creative direction, release strategies, and audience insights 24/7.
            </p>
            
            {/* Social Links */}
            <div className="flex gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-lg bg-secondary/50 flex items-center justify-center hover:bg-accent/20 hover:scale-110 transition-all duration-200 border border-border/30 hover:border-accent/50"
                  aria-label={social.label}
                >
                  <social.icon className="h-4 w-4 text-foreground/70 hover:text-accent" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="flex gap-12">
            <div className="animate-fade-in">
              <h3 className="font-bold text-foreground mb-4 text-sm uppercase tracking-wide">Quick Links</h3>
              <ul className="space-y-3">
                {footerLinks.product.map((link) => (
                  <li key={link.name}>
                    <Link 
                      to={link.href} 
                      className="text-sm text-foreground/70 hover:text-accent transition-colors duration-200 hover:translate-x-1 inline-block"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="hidden md:block animate-fade-in">
              <h3 className="font-bold text-foreground mb-4 text-sm uppercase tracking-wide">Compliance</h3>
              <ul className="space-y-3">
                <li className="flex items-center gap-2 text-sm text-foreground/70">
                  <ShieldCheck className="h-4 w-4 text-accent" /> GDPR Ready
                </li>
                <li className="flex items-center gap-2 text-sm text-foreground/70">
                  <ShieldCheck className="h-4 w-4 text-accent" /> CCPA Aware
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border/50 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-foreground/60">
          <button
            type="button"
            className="group flex items-center gap-2 text-xs text-foreground/60 hover:text-accent"
            aria-label="Scroll to top"
            onClick={(e) => {
              e.stopPropagation();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            <ChevronUp className="h-4 w-4 transition-transform group-hover:-translate-y-1" />
            Back to top
          </button>
          <p className="text-xs">© {currentYear} AURA. All rights reserved.</p>
          <p className="text-xs">Built with ❤️ for artists worldwide</p>
        </div>
      </div>
    </footer>
  );
}
