import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ChevronRight, ChevronLeft, Scale } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

const LAWYER_TYPES = [
  "Corporate Law",
  "Criminal Defense",
  "Family Law",
  "Personal Injury",
  "Real Estate Law",
  "Immigration Law",
  "Tax Law",
  "Employment Law",
  "Intellectual Property",
  "Environmental Law",
  "Other"
];

const REFERRAL_SOURCES = [
  "Google Search",
  "Legal Conference",
  "Colleague Referral",
  "LinkedIn",
  "Legal Publication",
  "Bar Association",
  "Other"
];

interface OnboardingFlowProps {
  onComplete?: () => void;
}

export const OnboardingFlow = ({ onComplete }: OnboardingFlowProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    birthday: "",
    how_heard_about_us: "",
    about_yourself: "",
    lawyer_type: ""
  });
  const { toast } = useToast();

  const totalSteps = 5;
  const progress = (currentStep / totalSteps) * 100;

  useEffect(() => {
    // Check if user has already completed onboarding
    const checkProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();
        
        if (profile?.full_name) {
          // User already has profile data, skip onboarding
          onComplete?.();
        }
      }
    };
    checkProfile();
  }, [onComplete]);

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    setIsLoading(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication Error",
          description: "Please sign in to complete onboarding.",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          birthday: formData.birthday || null,
          how_heard_about_us: formData.how_heard_about_us,
          about_yourself: formData.about_yourself,
          lawyer_type: formData.lawyer_type
        })
        .eq('user_id', user.id);

      if (error) {
        toast({
          title: "Profile Update Failed",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Welcome to Day Break!",
        description: "Your profile has been completed successfully.",
      });
      
      onComplete?.();
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <Card className="w-full max-w-2xl bg-card shadow-card">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <Scale className="h-8 w-8 text-legal-purple mr-2" />
            <h1 className="text-2xl font-bold">Day Break</h1>
          </div>
          <CardTitle className="text-2xl">Welcome to Day Break</CardTitle>
          <p className="text-muted-foreground">
            Let's get you set up with a few quick questions
          </p>
          <div className="mt-4">
            <Progress value={progress} className="w-full" />
            <p className="text-sm text-muted-foreground mt-2">
              Step {currentStep} of {totalSteps}
            </p>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold mb-2">What's your name?</h3>
                <p className="text-muted-foreground">This will help us personalize your experience</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  placeholder="Enter your full name"
                  value={formData.full_name}
                  onChange={(e) => updateFormData("full_name", e.target.value)}
                />
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold mb-2">When's your birthday?</h3>
                <p className="text-muted-foreground">This helps us customize your dashboard</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="birthday">Date of Birth</Label>
                <Input
                  id="birthday"
                  type="date"
                  value={formData.birthday}
                  onChange={(e) => updateFormData("birthday", e.target.value)}
                />
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold mb-2">How did you hear about us?</h3>
                <p className="text-muted-foreground">This helps us understand our community better</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="referral">Referral Source</Label>
                <Select onValueChange={(value) => updateFormData("how_heard_about_us", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select how you found us" />
                  </SelectTrigger>
                  <SelectContent>
                    {REFERRAL_SOURCES.map((source) => (
                      <SelectItem key={source} value={source}>
                        {source}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold mb-2">Tell us about yourself</h3>
                <p className="text-muted-foreground">Share a bit about your legal practice and goals</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="about">About You</Label>
                <Textarea
                  id="about"
                  placeholder="Tell us about your practice, experience, or what you're looking to achieve with Day Break..."
                  value={formData.about_yourself}
                  onChange={(e) => updateFormData("about_yourself", e.target.value)}
                  rows={4}
                />
              </div>
            </div>
          )}

          {currentStep === 5 && (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold mb-2">What type of lawyer are you?</h3>
                <p className="text-muted-foreground">This helps us tailor features to your practice area</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="lawyerType">Practice Area</Label>
                <Select onValueChange={(value) => updateFormData("lawyer_type", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your primary practice area" />
                  </SelectTrigger>
                  <SelectContent>
                    {LAWYER_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <div className="flex justify-between pt-6">
            <Button
              variant="legal-outline"
              onClick={handlePrevious}
              disabled={currentStep === 1}
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>

            {currentStep < totalSteps ? (
              <Button
                variant="legal"
                onClick={handleNext}
              >
                Next
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button
                variant="legal"
                onClick={handleComplete}
                disabled={isLoading}
              >
                {isLoading ? "Completing Setup..." : "Complete Setup"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};