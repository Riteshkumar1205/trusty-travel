const Footer = () => {
  return (
    <footer className="relative z-10 border-t border-border/50 bg-card/30">
      <div className="container-wide py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-gold flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">स</span>
              </div>
              <span className="font-semibold text-lg text-foreground">SAARTHI</span>
            </div>
            <p className="text-muted-foreground text-sm mb-4">
              Guiding trust across distance.
            </p>
            <p className="text-muted-foreground text-xs italic">
              "You're not delivering a parcel. You're carrying someone's faith through time."
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-medium text-foreground mb-4 text-sm">Product</h4>
            <ul className="space-y-2">
              <FooterLink href="#">How It Works</FooterLink>
              <FooterLink href="#">Pricing</FooterLink>
              <FooterLink href="#">Safety</FooterLink>
              <FooterLink href="#">For Business</FooterLink>
            </ul>
          </div>

          <div>
            <h4 className="font-medium text-foreground mb-4 text-sm">Company</h4>
            <ul className="space-y-2">
              <FooterLink href="#">About Us</FooterLink>
              <FooterLink href="#">Careers</FooterLink>
              <FooterLink href="#">Press</FooterLink>
              <FooterLink href="#">Contact</FooterLink>
            </ul>
          </div>

          <div>
            <h4 className="font-medium text-foreground mb-4 text-sm">Legal</h4>
            <ul className="space-y-2">
              <FooterLink href="#">Privacy Policy</FooterLink>
              <FooterLink href="#">Terms of Service</FooterLink>
              <FooterLink href="#">Cookie Policy</FooterLink>
              <FooterLink href="#">Compliance</FooterLink>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-border/50 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-muted-foreground text-xs">
            © 2026 SAARTHI. All rights reserved. Made with bharosa in India.
          </p>
          <div className="flex items-center gap-4">
            <span className="badge-verified text-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-success mr-1.5" />
              All Systems Operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

const FooterLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <li>
    <a
      href={href}
      className="text-muted-foreground hover:text-foreground text-sm transition-colors"
    >
      {children}
    </a>
  </li>
);

export default Footer;
