import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

// Pages
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import TrackOrder from "@/pages/TrackOrder";
import Contact from "@/pages/Contact";
import About from "@/pages/About";
import VendorKycPublic from "@/pages/VendorKycPublic";

// Customer Pages
import CustomerDashboard from "@/pages/customer/Dashboard";
import BookCylinder from "@/pages/customer/BookCylinder";

// Vendor Pages
import VendorDashboard from "@/pages/vendor/Dashboard";
import VendorRequests from "@/pages/vendor/Requests";

// Admin Pages
import AdminDashboard from "@/pages/admin/Dashboard";
import AdminKyc from "@/pages/admin/Kyc";
import AdminRequests from "@/pages/admin/Requests";

function Router() {
  return (
    <Switch>
      {/* Public Routes */}
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/track" component={TrackOrder} />
      <Route path="/contact" component={Contact} />
      <Route path="/about" component={About} />
      <Route path="/vendor-kyc" component={VendorKycPublic} />

      {/* Customer Routes */}
      <Route path="/customer" component={CustomerDashboard} />
      <Route path="/customer/book" component={BookCylinder} />

      {/* Vendor Routes */}
      <Route path="/vendor" component={VendorDashboard} />
      <Route path="/vendor/requests" component={VendorRequests} />

      {/* Admin Routes */}
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/kyc" component={AdminKyc} />
      <Route path="/admin/requests" component={AdminRequests} />

      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
