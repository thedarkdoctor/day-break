import { useState, useEffect } from "react";
import { LoginPage } from "@/components/legal/LoginPage";
import { OnboardingFlow } from "@/components/legal/OnboardingFlow";
import { BillingPage } from "@/components/legal/BillingPage";
import { Dashboard } from "@/components/legal/Dashboard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const AuthenticatedApp = () => {
  const { user, loading, signOut } = useAuth();
  const [currentView, setCurrentView] = useState<"onboarding" | "billing" | "dashboard">("onboarding");
  const [needsOnboarding, setNeedsOnboarding] = useState(true);

  useEffect(() => {
    const checkProfile = async () => {
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();
        
        if (profile?.full_name) {
          setNeedsOnboarding(false);
          setCurrentView("dashboard");
        }
      }
    };
    checkProfile();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-legal-purple mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage onAuthSuccess={() => window.location.reload()} />;
  }

  if (needsOnboarding && currentView === "onboarding") {
    return (
      <OnboardingFlow 
        onComplete={() => {
          setNeedsOnboarding(false);
          setCurrentView("dashboard");
        }} 
      />
    );
  }

  const handleSignOut = async () => {
    await signOut();
    window.location.reload();
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case "onboarding":
        return <OnboardingFlow onComplete={() => setCurrentView("dashboard")} />;
      case "billing":
        return <BillingPage onTeamJoin={() => setCurrentView("dashboard")} />;
      case "dashboard":
        return <Dashboard />;
      default:
        return <Dashboard />;
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
            <Button
              variant="legal-outline"
              size="sm"
              className="w-full justify-start"
              onClick={handleSignOut}
            >
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>

      {renderCurrentView()}
    </div>
  );
};

const Index = () => {
  return (
    <AuthProvider>
      <AuthenticatedApp />
    </AuthProvider>
  );
};

export default Index;
