import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Scale, Star, Zap, Crown } from "lucide-react";

const FEATURES = {
  basic: [
    "Up to 10 contract reviews per month",
    "Basic case dashboard",
    "Client notes system",
    "Basic billing tracker",
    "Email support"
  ],
  premium: [
    "Unlimited contract reviews",
    "Advanced AI risk detection",
    "Automated deadline alerts",
    "Advanced billing & time tracking",
    "Client portal access",
    "Priority support",
    "Custom document templates"
  ],
  enterprise: [
    "Everything in Premium",
    "Multi-user team access",
    "Custom integrations",
    "Advanced reporting & analytics",
    "Dedicated account manager",
    "API access",
    "Custom training sessions"
  ]
};

export const BillingPage = () => {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubscribe = async (planType: string) => {
    setSelectedPlan(planType);
    setIsProcessing(true);
    
    // This would normally integrate with Stripe
    console.log(`Subscribing to ${planType} plan`);
    
    setTimeout(() => {
      setIsProcessing(false);
      setSelectedPlan(null);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Scale className="h-12 w-12 text-legal-purple mr-4" />
            <h1 className="text-4xl font-bold">Day Break</h1>
          </div>
          <h2 className="text-3xl font-bold mb-4">Choose Your Plan</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Select the perfect plan for your legal practice. All plans include core features with flexible scalability.
          </p>
          
          {/* Discount Banner */}
          <div className="mt-6 inline-flex items-center bg-legal-purple/10 text-legal-purple px-4 py-2 rounded-full">
            <Star className="h-4 w-4 mr-2" />
            <span className="font-medium">Limited Time: $100 off your first month!</span>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {/* Basic Plan */}
          <Card className="relative bg-card shadow-card">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-2">
                <Zap className="h-8 w-8 text-legal-purple" />
              </div>
              <CardTitle className="text-2xl">Basic</CardTitle>
              <CardDescription>Perfect for solo practitioners</CardDescription>
              <div className="mt-4">
                <div className="text-4xl font-bold">$99</div>
                <div className="text-muted-foreground">/month</div>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 mb-6">
                {FEATURES.basic.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-success mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button
                variant="legal-outline"
                className="w-full"
                onClick={() => handleSubscribe("basic")}
                disabled={isProcessing}
              >
                {selectedPlan === "basic" && isProcessing ? "Processing..." : "Get Started"}
              </Button>
            </CardContent>
          </Card>

          {/* Premium Plan - Highlighted */}
          <Card className="relative bg-card shadow-card border-2 border-legal-purple">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <Badge className="bg-legal-purple text-legal-white px-4 py-1">
                Most Popular
              </Badge>
            </div>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-2">
                <Crown className="h-8 w-8 text-legal-purple" />
              </div>
              <CardTitle className="text-2xl">Premium</CardTitle>
              <CardDescription>For growing practices</CardDescription>
              <div className="mt-4">
                <div className="flex items-center justify-center gap-2">
                  <div className="text-2xl font-bold line-through text-muted-foreground">$300</div>
                  <div className="text-4xl font-bold text-legal-purple">$200</div>
                </div>
                <div className="text-muted-foreground">/month</div>
                <div className="text-sm text-legal-purple font-medium">$100 off first month!</div>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 mb-6">
                {FEATURES.premium.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-success mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button
                variant="legal"
                className="w-full"
                onClick={() => handleSubscribe("premium")}
                disabled={isProcessing}
              >
                {selectedPlan === "premium" && isProcessing ? "Processing..." : "Start Premium"}
              </Button>
            </CardContent>
          </Card>

          {/* Enterprise Plan */}
          <Card className="relative bg-card shadow-card">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-2">
                <Scale className="h-8 w-8 text-legal-purple" />
              </div>
              <CardTitle className="text-2xl">Enterprise</CardTitle>
              <CardDescription>For large firms and teams</CardDescription>
              <div className="mt-4">
                <div className="text-4xl font-bold">$499</div>
                <div className="text-muted-foreground">/month</div>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 mb-6">
                {FEATURES.enterprise.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-success mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button
                variant="legal-outline"
                className="w-full"
                onClick={() => handleSubscribe("enterprise")}
                disabled={isProcessing}
              >
                {selectedPlan === "enterprise" && isProcessing ? "Processing..." : "Contact Sales"}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Security & Trust */}
        <div className="text-center bg-card/50 rounded-lg p-8">
          <h3 className="text-xl font-semibold mb-4">Secure & Compliant</h3>
          <p className="text-muted-foreground mb-4">
            Your data is protected with enterprise-grade security and full compliance with legal industry standards.
          </p>
          <div className="flex justify-center items-center gap-6 text-sm text-muted-foreground">
            <span>✓ 256-bit SSL Encryption</span>
            <span>✓ SOC 2 Compliant</span>
            <span>✓ HIPAA Ready</span>
            <span>✓ 30-day Money Back Guarantee</span>
          </div>
        </div>
      </div>
    </div>
  );
};