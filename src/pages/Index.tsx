import { useState } from "react";
import { LoginPage } from "@/components/legal/LoginPage";
import { OnboardingFlow } from "@/components/legal/OnboardingFlow";
import { BillingPage } from "@/components/legal/BillingPage";
import { Dashboard } from "@/components/legal/Dashboard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Index = () => {
  const [currentView, setCurrentView] = useState<"login" | "onboarding" | "billing" | "dashboard">("login");

  const renderCurrentView = () => {
    switch (currentView) {
      case "login":
        return <LoginPage />;
      case "onboarding":
        return <OnboardingFlow />;
      case "billing":
        return <BillingPage />;
      case "dashboard":
        return <Dashboard />;
      default:
        return <LoginPage />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Demo Navigation - Only for preview purposes */}
      <div className="fixed top-4 left-4 z-50">
        <Card className="bg-card/95 backdrop-blur-sm shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Demo Navigation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              variant={currentView === "login" ? "legal" : "legal-ghost"}
              size="sm"
              className="w-full justify-start"
              onClick={() => setCurrentView("login")}
            >
              Login Page
            </Button>
            <Button
              variant={currentView === "onboarding" ? "legal" : "legal-ghost"}
              size="sm"
              className="w-full justify-start"
              onClick={() => setCurrentView("onboarding")}
            >
              Onboarding
            </Button>
            <Button
              variant={currentView === "billing" ? "legal" : "legal-ghost"}
              size="sm"
              className="w-full justify-start"
              onClick={() => setCurrentView("billing")}
            >
              Billing
            </Button>
            <Button
              variant={currentView === "dashboard" ? "legal" : "legal-ghost"}
              size="sm"
              className="w-full justify-start"
              onClick={() => setCurrentView("dashboard")}
            >
              Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>

      {renderCurrentView()}
    </div>
  );
};

export default Index;
