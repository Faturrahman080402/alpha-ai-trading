import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useProfile, useUpdateProfile } from "@/hooks/useProfile";
import { usePortfolio, useResetDemoBalance } from "@/hooks/usePortfolio";
import { useAuth } from "@/hooks/useAuth";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const DEMO_BALANCE_AMOUNT = 100000;

const TradingModeSwitch = () => {
  const { user } = useAuth();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: portfolio } = usePortfolio();
  const updateProfile = useUpdateProfile();
  const resetDemoBalance = useResetDemoBalance();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const isDemo = profile?.trading_mode === "demo";

  const handleModeSwitch = async (checked: boolean) => {
    const newMode = checked ? "demo" : "real";
    
    try {
      await updateProfile.mutateAsync({ trading_mode: newMode });
      toast.success(`Switched to ${newMode === "demo" ? "Demo" : "Real"} Account`, {
        description: newMode === "demo" 
          ? "You're now trading with virtual funds" 
          : "You're now trading with real funds",
      });
    } catch (error) {
      toast.error("Failed to switch mode");
    }
  };

  const handleResetDemoBalance = async () => {
    if (!portfolio) return;
    
    try {
      await resetDemoBalance.mutateAsync({
        portfolioId: portfolio.id,
        amount: DEMO_BALANCE_AMOUNT,
      });
      toast.success("Demo Balance Reset", {
        description: `Your demo balance has been reset to $${DEMO_BALANCE_AMOUNT.toLocaleString()}`,
      });
      setIsConfirmOpen(false);
    } catch (error) {
      toast.error("Failed to reset demo balance");
    }
  };

  if (!user) {
    return null;
  }

  if (profileLoading) {
    return (
      <Card className="p-4 bg-gradient-to-br from-card to-secondary/20 border-border">
        <div className="flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm text-muted-foreground">Loading...</span>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 bg-gradient-to-br from-card to-secondary/20 border-border">
      <div className="space-y-4">
        {/* Mode Switch */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Label htmlFor="trading-mode" className="text-sm font-medium">
              Account Mode
            </Label>
            <Badge 
              variant={isDemo ? "secondary" : "default"}
              className={isDemo ? "bg-yellow-500/20 text-yellow-500 border-yellow-500/50" : "bg-success/20 text-success border-success/50"}
            >
              {isDemo ? "Demo" : "Real"}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-xs ${!isDemo ? "text-success font-medium" : "text-muted-foreground"}`}>
              Real
            </span>
            <Switch
              id="trading-mode"
              checked={isDemo}
              onCheckedChange={handleModeSwitch}
              disabled={updateProfile.isPending}
            />
            <span className={`text-xs ${isDemo ? "text-yellow-500 font-medium" : "text-muted-foreground"}`}>
              Demo
            </span>
          </div>
        </div>

        {/* Warning for Real Mode */}
        {!isDemo && (
          <div className="flex items-start gap-2 p-2 rounded-md bg-danger/10 border border-danger/20">
            <AlertTriangle className="w-4 h-4 text-danger mt-0.5 shrink-0" />
            <p className="text-xs text-danger">
              Real trading mode active. All trades use actual funds.
            </p>
          </div>
        )}

        {/* Demo Balance Info & Reset */}
        {isDemo && portfolio && (
          <div className="flex items-center justify-between pt-2 border-t border-border">
            <div>
              <p className="text-xs text-muted-foreground">Demo Balance</p>
              <p className="text-lg font-bold font-mono">
                ${portfolio.demo_balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="gap-2"
                >
                  <RefreshCw className="w-3 h-3" />
                  Reset Balance
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Reset Demo Balance?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will reset your demo balance to ${DEMO_BALANCE_AMOUNT.toLocaleString()}. 
                    Your demo trading history will be preserved but your current demo balance will be replaced.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleResetDemoBalance}
                    disabled={resetDemoBalance.isPending}
                  >
                    {resetDemoBalance.isPending ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : null}
                    Reset to ${DEMO_BALANCE_AMOUNT.toLocaleString()}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </div>
    </Card>
  );
};

export default TradingModeSwitch;
