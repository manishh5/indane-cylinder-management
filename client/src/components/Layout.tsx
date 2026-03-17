import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Flame, LogOut, UserCircle, LayoutDashboard } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export function Layout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const [location, setLocation] = useLocation();

  const handleLogout = async () => {
    await logout();
    setLocation("/");
  };

  const navLink = (href: string, label: string) => (
    <Link
      key={href}
      href={href}
      className={`text-sm font-medium transition-colors pb-0.5 ${location === href ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"}`}
    >
      {label}
    </Link>
  );

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-50 w-full border-b border-white/20 bg-white/70 backdrop-blur-xl shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="bg-primary p-2 rounded-xl text-white shadow-lg shadow-primary/20">
              <Flame className="h-5 w-5" />
            </div>
            <div>
              <span className="font-display font-bold text-lg tracking-tight text-foreground">IndaneSewa</span>
            </div>
          </Link>

          {/* Nav */}
          <nav className="hidden md:flex items-center gap-6">
            {!user && (
              <>
                {navLink("/quick-book", "Quick Book")}
                {navLink("/track", "Track Order")}
                {navLink("/about", "About")}
                {navLink("/contact", "Contact")}
                {navLink("/vendor-kyc", "Become a Vendor")}
              </>
            )}

            {user?.role === "customer" && (
              <>
                {navLink("/customer", "My Orders")}
                {navLink("/customer/book", "Book Cylinder")}
                {navLink("/track", "Track Order")}
              </>
            )}

            {user?.role === "vendor" && (
              <>
                {navLink("/vendor", "Dashboard")}
              </>
            )}

            {user?.role === "admin" && (
              <>
                {navLink("/admin", "Dashboard")}
              </>
            )}
          </nav>

          {/* User menu */}
          <div className="flex items-center gap-3">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 rounded-full px-3 gap-2 hover:bg-primary/5" data-testid="user-menu">
                    <UserCircle className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium hidden sm:inline-block max-w-[120px] truncate">{user.name || user.username}</span>
                    <span className="hidden sm:inline-block text-xs bg-primary/10 text-primary rounded-full px-2 py-0.5 capitalize">{user.role}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52 glass rounded-xl">
                  <div className="px-3 py-2 text-xs text-muted-foreground">Signed in as <strong>{user.username}</strong></div>
                  <DropdownMenuSeparator />
                  {user.role === "customer" && (
                    <DropdownMenuItem asChild className="cursor-pointer">
                      <Link href="/customer"><LayoutDashboard className="mr-2 h-4 w-4" />My Orders</Link>
                    </DropdownMenuItem>
                  )}
                  {user.role === "vendor" && (
                    <DropdownMenuItem asChild className="cursor-pointer">
                      <Link href="/vendor"><LayoutDashboard className="mr-2 h-4 w-4" />Dashboard</Link>
                    </DropdownMenuItem>
                  )}
                  {user.role === "admin" && (
                    <DropdownMenuItem asChild className="cursor-pointer">
                      <Link href="/admin"><LayoutDashboard className="mr-2 h-4 w-4" />Admin Panel</Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive" onClick={handleLogout} data-testid="logout-button">
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="ghost" onClick={() => setLocation("/login")} className="rounded-xl" data-testid="button-login">
                  Sign In
                </Button>
                <Button onClick={() => setLocation("/register")} className="rounded-xl shadow-md" data-testid="button-signup">
                  Register
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      <footer className="border-t bg-white/80 py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-2 text-muted-foreground text-sm">
          <p>&copy; {new Date().getFullYear()} IndaneSewa — M/S Sarvat Indane Sewa. All rights reserved.</p>
          <p>Jaswantpuri Sarvat, Muzaffarnagar 251001 | +91-9355241824</p>
        </div>
      </footer>
    </div>
  );
}
