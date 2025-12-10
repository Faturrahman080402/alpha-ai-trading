import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Settings as SettingsIcon, Shield, Bell, TrendingUp, Loader2 } from "lucide-react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useProfile, useUpdateProfile } from "@/hooks/useProfile";
import { toast } from "sonner";

const Settings = () => {
  const { user, loading: authLoading } = useAuth();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const updateProfile = useUpdateProfile();

  const [tradingMode, setTradingMode] = useState<"demo" | "real">("demo");
  const [riskTolerance, setRiskTolerance] = useState(5);
  const [notifications, setNotifications] = useState({
    priceAlerts: true,
    tradeExecuted: true,
    aiPredictions: true,
    dailySummary: false,
  });

  useEffect(() => {
    if (profile) {
      setTradingMode(profile.trading_mode || "demo");
      setRiskTolerance(profile.risk_tolerance || 5);
    }
  }, [profile]);

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const handleSave = async () => {
    try {
      await updateProfile.mutateAsync({
        trading_mode: tradingMode,
        risk_tolerance: riskTolerance,
      });
      toast.success("Settings saved successfully");
    } catch (error) {
      toast.error("Failed to save settings");
    }
  };

  const getRiskLabel = (value: number) => {
    if (value <= 2) return "Very Conservative";
    if (value <= 4) return "Conservative";
    if (value <= 6) return "Moderate";
    if (value <= 8) return "Aggressive";
    return "Very Aggressive";
  };

  const getRiskColor = (value: number) => {
    if (value <= 2) return "text-success";
    if (value <= 4) return "text-success";
    if (value <= 6) return "text-yellow-500";
    if (value <= 8) return "text-orange-500";
    return "text-danger";
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link to="/">
                <ArrowLeft className="w-5 h-5" />
              </Link>
            </Button>
            <div className="flex items-center gap-2">
              <SettingsIcon className="w-5 h-5 text-primary" />
              <h1 className="text-xl font-bold">Settings</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="space-y-6">
          {/* Trading Mode */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Trading Mode</h2>
                <p className="text-sm text-muted-foreground">
                  Choose between demo and real trading
                </p>
              </div>
            </div>

            <RadioGroup
              value={tradingMode}
              onValueChange={(value) => setTradingMode(value as "demo" | "real")}
              className="space-y-3"
            >
              <div className="flex items-center space-x-3 p-4 rounded-lg border border-border hover:bg-secondary/50 transition-colors">
                <RadioGroupItem value="demo" id="demo" />
                <Label htmlFor="demo" className="flex-1 cursor-pointer">
                  <div className="font-medium">Demo Mode</div>
                  <div className="text-sm text-muted-foreground">
                    Practice trading with virtual funds ($100,000)
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-4 rounded-lg border border-border hover:bg-secondary/50 transition-colors">
                <RadioGroupItem value="real" id="real" />
                <Label htmlFor="real" className="flex-1 cursor-pointer">
                  <div className="font-medium">Real Mode</div>
                  <div className="text-sm text-muted-foreground">
                    Trade with real funds from your portfolio
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </Card>

          {/* Risk Tolerance */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-danger/20 flex items-center justify-center">
                <Shield className="w-5 h-5 text-danger" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Risk Tolerance</h2>
                <p className="text-sm text-muted-foreground">
                  Set your preferred risk level for AI recommendations
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Level: {riskTolerance}/10</span>
                <span className={`text-sm font-medium ${getRiskColor(riskTolerance)}`}>
                  {getRiskLabel(riskTolerance)}
                </span>
              </div>
              <Slider
                value={[riskTolerance]}
                onValueChange={(value) => setRiskTolerance(value[0])}
                min={1}
                max={10}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Conservative</span>
                <span>Aggressive</span>
              </div>
            </div>
          </Card>

          {/* Notification Preferences */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                <Bell className="w-5 h-5 text-yellow-500" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Notifications</h2>
                <p className="text-sm text-muted-foreground">
                  Manage your notification preferences
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between py-2">
                <div>
                  <Label htmlFor="priceAlerts" className="font-medium">Price Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified when prices hit your targets
                  </p>
                </div>
                <Switch
                  id="priceAlerts"
                  checked={notifications.priceAlerts}
                  onCheckedChange={(checked) =>
                    setNotifications((prev) => ({ ...prev, priceAlerts: checked }))
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between py-2">
                <div>
                  <Label htmlFor="tradeExecuted" className="font-medium">Trade Executed</Label>
                  <p className="text-sm text-muted-foreground">
                    Notifications when trades are opened or closed
                  </p>
                </div>
                <Switch
                  id="tradeExecuted"
                  checked={notifications.tradeExecuted}
                  onCheckedChange={(checked) =>
                    setNotifications((prev) => ({ ...prev, tradeExecuted: checked }))
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between py-2">
                <div>
                  <Label htmlFor="aiPredictions" className="font-medium">AI Predictions</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive alerts for high-confidence AI signals
                  </p>
                </div>
                <Switch
                  id="aiPredictions"
                  checked={notifications.aiPredictions}
                  onCheckedChange={(checked) =>
                    setNotifications((prev) => ({ ...prev, aiPredictions: checked }))
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between py-2">
                <div>
                  <Label htmlFor="dailySummary" className="font-medium">Daily Summary</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive a daily trading performance summary
                  </p>
                </div>
                <Switch
                  id="dailySummary"
                  checked={notifications.dailySummary}
                  onCheckedChange={(checked) =>
                    setNotifications((prev) => ({ ...prev, dailySummary: checked }))
                  }
                />
              </div>
            </div>
          </Card>

          {/* Save Button */}
          <Button
            onClick={handleSave}
            className="w-full"
            size="lg"
            disabled={updateProfile.isPending}
          >
            {updateProfile.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Settings"
            )}
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Settings;
