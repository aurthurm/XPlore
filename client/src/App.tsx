import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { useEffect } from "react";

// Pages
import Home from "@/pages/Home";
import BusinessDetails from "@/pages/BusinessDetails";
import BusinessDashboard from "@/pages/BusinessDashboard";
import BusinessClaim from "@/pages/BusinessClaim";
import NotFound from "@/pages/not-found";

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
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/business/:id" component={BusinessDetails} />
      <Route path="/dashboard" component={BusinessDashboard} />
      <Route path="/claim/:id?" component={BusinessClaim} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
