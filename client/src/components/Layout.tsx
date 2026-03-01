import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Flame, LogOut, Menu, UserCircle, Package, History, Info, Phone, FileCheck } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export function Layout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();

  const handleLogout = async () => {
    await logout();
    setLocation("/");
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-50 w-full border-b border-white/20 bg-white/60 backdrop-blur-xl shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="bg-primary p-2 rounded-xl text-white shadow-lg shadow-primary/20">
              <Flame className="h-5 w-5" />
            </div>
            <span className="font-display font-bold text-xl tracking-tight text-foreground">
              IndaneSewa
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            {!user && (
              <>
                <Link href="/track" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                  Track Order
                </Link>
                <Link href="/about" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                  About
                </Link>
                <Link href="/contact" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                  Contact
                </Link>
                <Link href="/vendor-kyc" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                  Become a Vendor
                </Link>
              </>
            )}

            {user?.role === "customer" && (
              <>
                <Link href="/customer" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                  Order History
                </Link>
                <Link href="/customer/book" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                  Book Cylinder
                </Link>
              </>
            )}

            {user?.role === "vendor" && (
              <>
                <Link href="/vendor" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                  Orders
                </Link>
                <Link href="/vendor/requests" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                  Inventory & Requests
                </Link>
              </>
            )}

            {user?.role === "admin" && (
              <>
                <Link href="/admin" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                  All Bookings
                </Link>
                <Link href="/admin/kyc" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                  Vendor KYC
                </Link>
                <Link href="/admin/requests" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                  Vendor Requests
                </Link>
              </>
            )}
          </nav>

          <div className="flex items-center gap-4">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 rounded-full px-3 gap-2 hover:bg-primary/5">
                    <UserCircle className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium hidden sm:inline-block">{user.name || user.username}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 glass rounded-xl">
                  <DropdownMenuItem className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive" onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button onClick={() => setLocation("/login")} className="rounded-xl shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5">
                Sign In
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      <footer className="border-t bg-white py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-muted-foreground text-sm">
          <p>&copy; {new Date().getFullYear()} IndaneSewa - M/S Sarvat Indane Sewa. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
