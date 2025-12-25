import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { 
  LayoutDashboard, 
  FolderKanban, 
  Users, 
  Settings, 
  LogOut,
  Layers
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

export function Sidebar() {
  const [location] = useLocation();
  const { user, tenant, logout } = useAuth();
  
  const isActive = (path: string) => location === path;

  const NavItem = ({ href, icon: Icon, label }: { href: string, icon: any, label: string }) => (
    <Link href={href}>
      <Button
        variant="ghost"
        className={cn(
          "w-full justify-start gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
          isActive(href) 
            ? "bg-primary/10 text-primary font-medium shadow-sm hover:bg-primary/15 hover:text-primary" 
            : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
        )}
      >
        <Icon className={cn("h-5 w-5", isActive(href) ? "text-primary" : "text-muted-foreground")} />
        {label}
      </Button>
    </Link>
  );

  return (
    <div className="flex flex-col h-screen w-64 bg-card border-r border-border/50 shadow-sm fixed left-0 top-0">
      <div className="p-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/25">
            <Layers className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-display font-bold text-lg leading-tight tracking-tight">NexTask</h1>
            <p className="text-xs text-muted-foreground font-medium truncate max-w-[120px]">
              {tenant?.name || "Workspace"}
            </p>
          </div>
        </div>
      </div>

      <div className="px-4 py-2">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-2">Menu</p>
        <div className="space-y-1">
          <NavItem href="/dashboard" icon={LayoutDashboard} label="Dashboard" />
          <NavItem href="/projects" icon={FolderKanban} label="Projects" />
          <NavItem href="/users" icon={Users} label="Team" />
        </div>
      </div>
      
      <div className="px-4 py-2 mt-auto">
        <Separator className="my-4 opacity-50" />
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-2">System</p>
        <div className="space-y-1">
          <NavItem href="/settings" icon={Settings} label="Settings" />
        </div>
        
        <div className="mt-4 p-3 rounded-xl bg-muted/30 border border-border/50 mb-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-xs">
              {user?.fullName.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium truncate">{user?.fullName}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full text-xs h-8 border-border/50 hover:bg-destructive/5 hover:text-destructive hover:border-destructive/20 transition-colors"
            onClick={() => logout()}
          >
            <LogOut className="h-3 w-3 mr-2" />
            Sign out
          </Button>
        </div>
      </div>
    </div>
  );
}
