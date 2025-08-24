import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Scale, Mail } from "lucide-react";
import heroImage from "@/assets/legal-hero-bg.jpg";

export const LoginPage = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // This would normally handle authentication
    setTimeout(() => setIsLoading(false), 2000);
  };

  const handleGoogleLogin = () => {
    // This would integrate with Google OAuth
    console.log("Google login clicked");
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Hero Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-legal-black/90 via-legal-black/80 to-legal-purple/20" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex min-h-screen">
        {/* Left Side - Branding */}
        <div className="hidden lg:flex lg:w-1/2 flex-col justify-center px-12 text-legal-white">
          <div className="max-w-md">
            <div className="flex items-center mb-8">
              <Scale className="h-12 w-12 text-legal-purple mr-4" />
              <h1 className="text-4xl font-bold">Day Break</h1>
            </div>
            <h2 className="text-3xl font-bold mb-6">
              Legal Practice Management
              <span className="text-legal-purple"> Redefined</span>
            </h2>
            <p className="text-xl text-legal-white/80 mb-8">
              Streamline your practice with AI-powered contract review, intelligent case management, and automated billing tracking.
            </p>
            <div className="space-y-4">
              <div className="flex items-center text-legal-white/70">
                <div className="w-2 h-2 bg-legal-purple rounded-full mr-3" />
                AI Contract Analysis & Risk Detection
              </div>
              <div className="flex items-center text-legal-white/70">
                <div className="w-2 h-2 bg-legal-purple rounded-full mr-3" />
                Automated Deadline Tracking
              </div>
              <div className="flex items-center text-legal-white/70">
                <div className="w-2 h-2 bg-legal-purple rounded-full mr-3" />
                Integrated Billing & Time Management
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center px-6">
          <Card className="w-full max-w-md bg-card/95 backdrop-blur-sm shadow-card border-border">
            <CardHeader className="text-center">
              <div className="flex items-center justify-center lg:hidden mb-4">
                <Scale className="h-8 w-8 text-legal-purple mr-2" />
                <h1 className="text-2xl font-bold">Day Break</h1>
              </div>
              <CardTitle className="text-2xl">Welcome Back</CardTitle>
              <CardDescription>
                Sign in to your legal practice dashboard
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="signin" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="signin">Sign In</TabsTrigger>
                  <TabsTrigger value="signup">Sign Up</TabsTrigger>
                </TabsList>
                
                <TabsContent value="signin">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email or Username</Label>
                      <Input
                        id="email"
                        type="text"
                        placeholder="Enter your email or username"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="Enter your password"
                        required
                      />
                    </div>
                    <Button
                      type="submit"
                      variant="legal"
                      className="w-full"
                      disabled={isLoading}
                    >
                      {isLoading ? "Signing In..." : "Sign In"}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="signup">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email</Label>
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="Enter your email"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Password</Label>
                      <Input
                        id="signup-password"
                        type="password"
                        placeholder="Create a password"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirm Password</Label>
                      <Input
                        id="confirm-password"
                        type="password"
                        placeholder="Confirm your password"
                        required
                      />
                    </div>
                    <Button
                      type="submit"
                      variant="legal"
                      className="w-full"
                      disabled={isLoading}
                    >
                      {isLoading ? "Creating Account..." : "Create Account"}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>

              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">or continue with</span>
                  </div>
                </div>
                <Button
                  variant="legal-outline"
                  className="w-full mt-4"
                  onClick={handleGoogleLogin}
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Google
                </Button>
              </div>

              <p className="text-center text-sm text-muted-foreground mt-6">
                By signing up, you agree to our Terms of Service and Privacy Policy
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};