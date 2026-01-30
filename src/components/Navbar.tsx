import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageSelector from "@/components/LanguageSelector";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useLanguage();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
      <div className="container-wide">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-gold flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">स</span>
            </div>
            <span className="font-semibold text-lg tracking-tight text-foreground">SAARTHI</span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <NavLink href="#how-it-works">How It Works</NavLink>
            <NavLink href="#features">Features</NavLink>
            <NavLink href="#trust">Trust & Safety</NavLink>
            <NavLink href="#pricing">Pricing</NavLink>
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <LanguageSelector />
            <Button variant="ghost" size="sm">
              {t("nav.login")}
            </Button>
            <Button variant="hero" size="sm">
              {t("nav.getStarted")}
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
            <LanguageSelector />
            <button
              className="p-2 text-foreground"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-border/50">
            <div className="flex flex-col gap-4">
              <NavLink href="#how-it-works" mobile>How It Works</NavLink>
              <NavLink href="#features" mobile>Features</NavLink>
              <NavLink href="#trust" mobile>Trust & Safety</NavLink>
              <NavLink href="#pricing" mobile>Pricing</NavLink>
              <div className="flex gap-3 pt-4">
                <Button variant="ghost" size="sm" className="flex-1">
                  {t("nav.login")}
                </Button>
                <Button variant="hero" size="sm" className="flex-1">
                  {t("nav.getStarted")}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

const NavLink = ({ 
  href, 
  children, 
  mobile 
}: { 
  href: string; 
  children: React.ReactNode;
  mobile?: boolean;
}) => (
  <a
    href={href}
    className={`text-muted-foreground hover:text-foreground transition-colors link-underline ${
      mobile ? "text-base py-2" : "text-sm"
    }`}
  >
    {children}
  </a>
);

export default Navbar;
