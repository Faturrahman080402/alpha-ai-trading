import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { 
  ArrowDownToLine, 
  ArrowUpFromLine, 
  Wallet, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Loader2,
  AlertTriangle
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { usePortfolio } from "@/hooks/usePortfolio";
import { useProfile } from "@/hooks/useProfile";
import { useTransactions, useDeposit, useWithdraw, Transaction } from "@/hooks/useTransactions";
import { format } from "date-fns";

const WalletManager = () => {
  const { user } = useAuth();
  const { data: portfolio } = usePortfolio();
  const { data: profile } = useProfile();
  const { data: transactions } = useTransactions();
  const deposit = useDeposit();
  const withdraw = useWithdraw();

  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [showDepositConfirm, setShowDepositConfirm] = useState(false);
  const [showWithdrawConfirm, setShowWithdrawConfirm] = useState(false);

  const isDemo = profile?.trading_mode === "demo";
  const balance = isDemo ? portfolio?.demo_balance : portfolio?.balance;

  const handleDeposit = () => {
    if (!portfolio) return;
    deposit.mutate({
      amount: Number(depositAmount),
      isDemo: isDemo ?? true,
      portfolioId: portfolio.id,
    }, {
      onSuccess: () => {
        setDepositAmount("");
        setShowDepositConfirm(false);
      }
    });
  };

  const handleWithdraw = () => {
    if (!portfolio || !balance) return;
    withdraw.mutate({
      amount: Number(withdrawAmount),
      isDemo: isDemo ?? true,
      portfolioId: portfolio.id,
      currentBalance: balance,
    }, {
      onSuccess: () => {
        setWithdrawAmount("");
        setShowWithdrawConfirm(false);
      }
    });
  };

  const getStatusIcon = (status: Transaction["status"]) => {
    switch (status) {
      case "success":
        return <CheckCircle2 className="w-4 h-4 text-success" />;
      case "failed":
        return <XCircle className="w-4 h-4 text-danger" />;
      case "processing":
        return <Loader2 className="w-4 h-4 text-warning animate-spin" />;
      default:
        return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: Transaction["status"]) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      success: "default",
      failed: "destructive",
      processing: "secondary",
      pending: "outline"
    };
    return (
      <Badge variant={variants[status]} className="capitalize">
        {status}
      </Badge>
    );
  };

  if (!user) {
    return (
      <Card className="p-6 bg-card border-border">
        <div className="text-center py-8">
          <Wallet className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Sign in to manage your wallet</p>
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card className="p-6 bg-card border-border">
        <div className="flex items-center gap-2 mb-4">
          <Wallet className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Wallet</h3>
          {isDemo && <Badge variant="secondary" className="text-xs">Demo</Badge>}
        </div>

        <Tabs defaultValue="deposit" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="deposit">Deposit</TabsTrigger>
            <TabsTrigger value="withdraw">Withdraw</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="deposit" className="space-y-4 mt-4">
            <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-lg p-4 border border-blue-500/20">
              <div className="flex items-center gap-2 mb-2">
                <img 
                  src="https://upload.wikimedia.org/wikipedia/commons/7/72/Logo_dana_blue.svg" 
                  alt="DANA" 
                  className="h-6"
                />
                <span className="font-semibold text-blue-400">DANA E-Wallet</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Top up your trading balance via DANA
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Amount (USD)</label>
              <Input
                type="number"
                placeholder="Enter amount"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                min="1"
              />
              <div className="flex gap-2">
                {[50, 100, 500, 1000].map((amount) => (
                  <Button
                    key={amount}
                    variant="outline"
                    size="sm"
                    onClick={() => setDepositAmount(amount.toString())}
                    className="flex-1"
                  >
                    ${amount}
                  </Button>
                ))}
              </div>
            </div>

            <Button 
              className="w-full" 
              disabled={!depositAmount || Number(depositAmount) <= 0}
              onClick={() => setShowDepositConfirm(true)}
            >
              <ArrowDownToLine className="w-4 h-4 mr-2" />
              Deposit via DANA
            </Button>
          </TabsContent>

          <TabsContent value="withdraw" className="space-y-4 mt-4">
            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-sm text-muted-foreground mb-1">Available Balance</p>
              <p className="text-2xl font-bold font-mono">
                ${(balance ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
            </div>

            {!isDemo && (
              <div className="flex items-start gap-2 p-3 bg-warning/10 border border-warning/20 rounded-lg">
                <AlertTriangle className="w-4 h-4 text-warning mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-warning">Real Money Withdrawal</p>
                  <p className="text-muted-foreground">
                    Minimum: $10 • Processing: 1-3 business days
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Amount (USD)</label>
              <Input
                type="number"
                placeholder="Enter amount"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                min="10"
                max={balance ?? 0}
              />
              <div className="flex gap-2">
                {[25, 50, 100].map((percent) => (
                  <Button
                    key={percent}
                    variant="outline"
                    size="sm"
                    onClick={() => setWithdrawAmount(Math.floor((balance ?? 0) * percent / 100).toString())}
                    className="flex-1"
                  >
                    {percent}%
                  </Button>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setWithdrawAmount(Math.floor(balance ?? 0).toString())}
                  className="flex-1"
                >
                  Max
                </Button>
              </div>
            </div>

            <Button 
              className="w-full" 
              variant="outline"
              disabled={!withdrawAmount || Number(withdrawAmount) < 10 || Number(withdrawAmount) > (balance ?? 0)}
              onClick={() => setShowWithdrawConfirm(true)}
            >
              <ArrowUpFromLine className="w-4 h-4 mr-2" />
              Withdraw to DANA
            </Button>
          </TabsContent>

          <TabsContent value="history" className="mt-4">
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {transactions && transactions.length > 0 ? (
                transactions.map((tx) => (
                  <div 
                    key={tx.id} 
                    className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      {getStatusIcon(tx.status)}
                      <div>
                        <p className="font-medium capitalize flex items-center gap-2">
                          {tx.type}
                          {tx.is_demo && <Badge variant="outline" className="text-xs">Demo</Badge>}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(tx.created_at), "MMM d, yyyy HH:mm")}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-mono font-medium ${tx.type === "deposit" ? "text-success" : "text-danger"}`}>
                        {tx.type === "deposit" ? "+" : "-"}${tx.amount.toLocaleString()}
                      </p>
                      {getStatusBadge(tx.status)}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Clock className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">No transactions yet</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </Card>

      {/* Deposit Confirmation Dialog */}
      <Dialog open={showDepositConfirm} onOpenChange={setShowDepositConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deposit</DialogTitle>
            <DialogDescription>
              You are about to deposit funds via DANA e-wallet.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="flex justify-between p-4 bg-muted/50 rounded-lg">
              <span className="text-muted-foreground">Amount</span>
              <span className="font-bold font-mono">${Number(depositAmount).toLocaleString()}</span>
            </div>
            <div className="flex justify-between p-4 bg-muted/50 rounded-lg">
              <span className="text-muted-foreground">Payment Method</span>
              <span className="font-medium">DANA</span>
            </div>
            <div className="flex justify-between p-4 bg-muted/50 rounded-lg">
              <span className="text-muted-foreground">Account Type</span>
              <Badge variant={isDemo ? "secondary" : "default"}>
                {isDemo ? "Demo" : "Real"}
              </Badge>
            </div>
            
            {isDemo && (
              <p className="text-sm text-muted-foreground text-center">
                This is a simulated deposit for demo trading purposes.
              </p>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDepositConfirm(false)}>
              Cancel
            </Button>
            <Button onClick={handleDeposit} disabled={deposit.isPending}>
              {deposit.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                "Confirm Deposit"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Withdraw Confirmation Dialog */}
      <Dialog open={showWithdrawConfirm} onOpenChange={setShowWithdrawConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Withdrawal</DialogTitle>
            <DialogDescription>
              You are about to withdraw funds to your DANA wallet.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="flex justify-between p-4 bg-muted/50 rounded-lg">
              <span className="text-muted-foreground">Amount</span>
              <span className="font-bold font-mono">${Number(withdrawAmount).toLocaleString()}</span>
            </div>
            <div className="flex justify-between p-4 bg-muted/50 rounded-lg">
              <span className="text-muted-foreground">Destination</span>
              <span className="font-medium">DANA Wallet</span>
            </div>
            <div className="flex justify-between p-4 bg-muted/50 rounded-lg">
              <span className="text-muted-foreground">Balance After</span>
              <span className="font-mono">
                ${((balance ?? 0) - Number(withdrawAmount)).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>
            
            {!isDemo && (
              <div className="p-3 bg-warning/10 border border-warning/20 rounded-lg">
                <p className="text-sm text-warning">
                  Real withdrawals are processed within 1-3 business days.
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowWithdrawConfirm(false)}>
              Cancel
            </Button>
            <Button onClick={handleWithdraw} disabled={withdraw.isPending} variant="destructive">
              {withdraw.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                "Confirm Withdrawal"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default WalletManager;
