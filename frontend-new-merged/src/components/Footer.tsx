import { Music2, Mail, Twitter, Instagram, Youtube, Github } from "lucide-react";
import { Link } from "react-router-dom";

export function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    product: [
      { name: "Pricing", href: "/pricing" },
      { name: "Help", href: "/help" },
    ],
  };

  const socialLinks = [
    { icon: Twitter, href: "https://twitter.com", label: "Twitter" },
    { icon: Instagram, href: "https://instagram.com", label: "Instagram" },
    { icon: Youtube, href: "https://youtube.com", label: "YouTube" },
    { icon: Github, href: "https://github.com", label: "GitHub" },
  ];

  return (
    <footer className="border-t border-border/50 bg-card/50 backdrop-blur-sm mt-20">
      <div className="container mx-auto px-4 py-12 md:py-16">
        {/* Main Footer Content */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-8">
          {/* Brand Section */}
          <div className="max-w-sm">
            <Link to="/" className="flex items-center gap-3 mb-4 hover-scale group">
              <div className="w-10 h-10 bg-gradient-to-br from-accent to-sedimentary-base rounded-lg flex items-center justify-center transition-all duration-300 group-hover:shadow-[var(--shadow-accent)]">
                <Music2 className="h-6 w-6 text-foreground" />
              </div>
              <span className="text-2xl font-bold brand-text">AURA</span>
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
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border/50 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-foreground/60">
          <p>© {currentYear} AURA. All rights reserved.</p>
          <p className="text-xs">
            Built with ❤️ for artists worldwide
          </p>
        </div>
      </div>
    </footer>
  );
}
