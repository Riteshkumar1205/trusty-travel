import { useLocation, useNavigate } from "react-router-dom";
import { Home, Package, Users, Navigation, User } from "lucide-react";

interface NavItem {
  icon: React.ReactNode;
  label: string;
  path: string;
}

const navItems: NavItem[] = [
  { icon: <Home className="h-5 w-5" />, label: "Home", path: "/" },
  { icon: <Package className="h-5 w-5" />, label: "Send", path: "/dashboard/sender" },
  { icon: <Navigation className="h-5 w-5" />, label: "Track", path: "/tracking" },
  { icon: <Users className="h-5 w-5" />, label: "Travel", path: "/dashboard/traveler" },
  { icon: <User className="h-5 w-5" />, label: "Profile", path: "/profile" },
];

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-t border-border/50 pb-safe md:hidden">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-all ${
              isActive(item.path)
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <div className={`p-1.5 rounded-xl transition-all ${
              isActive(item.path) ? "bg-primary/20" : ""
            }`}>
              {item.icon}
            </div>
            <span className="text-[10px] font-medium">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;
