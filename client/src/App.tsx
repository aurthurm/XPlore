import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { useEffect } from "react";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";
import MainNav from "@/components/MainNav";

// Pages
import Home from "@/pages/Home";
import BusinessDetails from "@/pages/BusinessDetails";
import BusinessDashboard from "@/pages/BusinessDashboard";
import BusinessClaim from "@/pages/BusinessClaim";
import Itineraries from "@/pages/Itineraries";
import ItineraryDetails from "@/pages/ItineraryDetails";
import ItineraryMap from "@/pages/ItineraryMap";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";

function Router() {
  // Seed initial data on app start
  useEffect(() => {
    fetch('/api/seed-data')
      .then(res => res.json())
      .then(data => {
        console.log('Seed data response:', data);
      })
      .catch(err => {
        console.error('Error seeding data:', err);
      });
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <MainNav />
      <main className="flex-1">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/business/:id" component={BusinessDetails} />
          <Route path="/auth" component={AuthPage} />
          <ProtectedRoute path="/dashboard" component={BusinessDashboard} />
          <ProtectedRoute path="/claim/:id?" component={BusinessClaim} />
          <ProtectedRoute path="/itineraries" component={Itineraries} />
          <ProtectedRoute path="/itinerary/:id" component={ItineraryDetails} />
          <ProtectedRoute path="/itinerary/:id/map" component={ItineraryMap} />
          <Route component={NotFound} />
        </Switch>
      </main>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
