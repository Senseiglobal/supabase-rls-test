import { useState } from "react";
import { CreditCard, Plus, Trash2, FileText, Download, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useNotification, NotificationContainer } from "@/components/NotificationToast";

interface PaymentMethod {
  id: string;
  type: string;
  last4: string;
  expiryDate: string;
  isDefault: boolean;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  date: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue';
  description: string;
}

const Billing = () => {
  const { toast } = useToast();
  const { notifications, removeNotification, success, error, info } = useNotification();
  const [paypalConnected, setPaypalConnected] = useState(false);
  
  // DEMO DATA - Replace with Supabase data later
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    {
      id: '1',
      type: 'Visa',
      last4: '4242',
      expiryDate: '12/25',
      isDefault: true,
    },
  ]);

  // DEMO DATA - Replace with Supabase invoices later
  const [invoices] = useState<Invoice[]>([
    {
      id: '1',
      invoiceNumber: 'INV-001',
      date: '2024-01-15',
      amount: 29.99,
      status: 'paid',
      description: 'Pro Plan - Monthly',
    },
    {
      id: '2',
      invoiceNumber: 'INV-002',
      date: '2024-02-15',
      amount: 29.99,
      status: 'paid',
      description: 'Pro Plan - Monthly',
    },
  ]);

  const [open, setOpen] = useState(false);

  const handleAddPaymentMethod = () => {
    toast({
      title: "Payment method added",
      description: "Your new payment method has been saved successfully.",
    });
    setOpen(false);
  };

  const handleRemovePaymentMethod = (id: string) => {
    setPaymentMethods(prev => prev.filter(pm => pm.id !== id));
    toast({
      title: "Payment method removed",
      description: "The payment method has been removed from your account.",
    });
  };

  const handleDownloadInvoice = (invoiceNumber: string) => {
    toast({
      title: "Downloading invoice",
      description: `Invoice ${invoiceNumber} is being downloaded.`,
    });
  };

  const handleConnectPayPal = async () => {
    try {
      info("Connecting PayPal", "Redirecting you to PayPal to authorize access...", 0);
      
      // In a real implementation, you would:
      // 1. Get PayPal authorization URL from your backend
      // 2. Redirect user to PayPal
      // 3. Handle the callback and store the auth token
      
      // For now, we'll simulate the connection
      setTimeout(() => {
        removeNotification(info.id || "");
        setPaypalConnected(true);
        success(
          "PayPal Connected!",
          "Your PayPal account has been successfully connected to Aura Manager.",
          4000
        );
      }, 2000);
    } catch (err) {
      error(
        "Connection Failed",
        err instanceof Error ? err.message : "Failed to connect PayPal account",
        5000
      );
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-success text-success-foreground';
      case 'pending':
        return 'bg-warning text-warning-foreground';
      case 'overdue':
        return 'bg-danger text-danger-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <>
      <NotificationContainer notifications={notifications} onRemove={removeNotification} />
      <div className="min-h-screen w-full">
      <div className="w-full px-4 py-6 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Billing & Payments</h1>
            <p className="text-muted-foreground mt-2">
              Manage your payment methods and view invoices
            </p>
          </div>

          {/* Payment Methods Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Payment Methods</CardTitle>
                  <CardDescription>Manage your saved payment methods</CardDescription>
                </div>
                <Dialog open={open} onOpenChange={setOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Payment Method
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Add Payment Method</DialogTitle>
                      <DialogDescription>
                        Add a new credit or debit card to your account
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="card-number">Card Number</Label>
                        <Input id="card-number" placeholder="1234 5678 9012 3456" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="expiry">Expiry Date</Label>
                          <Input id="expiry" placeholder="MM/YY" />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="cvv">CVV</Label>
                          <Input id="cvv" placeholder="123" type="password" />
                        </div>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="name">Cardholder Name</Label>
                        <Input id="name" placeholder="John Doe" />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleAddPaymentMethod}>Add Card</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {paymentMethods.map((method) => (
                  <div
                    key={method.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 border rounded-lg gap-4 hover:border-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="p-2 bg-accent/10 rounded-lg">
                        <CreditCard className="h-6 w-6 text-accent" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium whitespace-nowrap">
                            {method.type} •••• {method.last4}
                          </p>
                          {method.isDefault && (
                            <Badge variant="secondary">Default</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          Expires {method.expiryDate}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 sm:flex-shrink-0">
                      {!method.isDefault && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 sm:flex-initial"
                          onClick={() => {
                            setPaymentMethods(prev => 
                              prev.map(pm => 
                                pm.id === method.id 
                                  ? { ...pm, isDefault: true }
                                  : { ...pm, isDefault: false }
                              )
                            );
                            toast({
                              title: "Default payment method updated",
                              description: "This card is now your default payment method.",
                            });
                          }}
                        >
                          Set as Default
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemovePaymentMethod(method.id)}
                      >
                        <Trash2 className="h-4 w-4 sm:mr-0 mr-2" />
                        <span className="sm:hidden">Remove</span>
                      </Button>
                    </div>
                  </div>
                ))}
                
                {/* PayPal Option */}
                <div className={`mt-4 p-4 rounded-lg transition-all ${
                  paypalConnected 
                    ? "border-2 border-green-200 bg-green-50 dark:bg-green-950/30" 
                    : "border-2 border-dashed hover:border-accent/50"
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg ${
                        paypalConnected 
                          ? "bg-green-100 dark:bg-green-900/50" 
                          : "bg-blue-50 dark:bg-blue-950/30"
                      }`}>
                        {paypalConnected ? (
                          <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                        ) : (
                          <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                            <path fill="#00457C" d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944 3.72a.768.768 0 0 1 .759-.632h8.548c2.276 0 4.139.557 5.39 1.611 1.108.934 1.609 2.157 1.609 3.718 0 2.407-1.023 4.168-3.125 5.378-1.21.697-2.85 1.048-4.875 1.048H9.43a.768.768 0 0 0-.759.632l-1.595 6.862Z"/>
                            <path fill="#0079C1" d="M19.088 7.917c0 2.407-1.023 4.168-3.125 5.378-1.21.697-2.85 1.048-4.875 1.048H9.43a.768.768 0 0 0-.759.632l-1.595 6.862h3.923a.67.67 0 0 0 .662-.564l.027-.145.528-3.348.034-.184a.67.67 0 0 1 .662-.564h.417c3.786 0 6.75-1.538 7.616-5.987.361-1.855.174-3.403-.785-4.492a3.719 3.719 0 0 0-1.072-.884Z"/>
                          </svg>
                        )}
                      </div>
                      <div>
                        <p className="font-medium">PayPal</p>
                        <p className="text-sm text-muted-foreground">
                          {paypalConnected ? "Connected" : "Connect your PayPal account"}
                        </p>
                      </div>
                    </div>
                    <Button 
                      variant={paypalConnected ? "outline" : "default"}
                      size="sm"
                      title={paypalConnected ? "PayPal is connected" : "Connect your PayPal account"}
                      onClick={handleConnectPayPal}
                      disabled={paypalConnected}
                    >
                      {paypalConnected ? (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Connected
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4 mr-2" />
                          Connect
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Invoices Section */}
          <Card>
            <CardHeader>
              <CardTitle>Invoice History</CardTitle>
              <CardDescription>View and download your past invoices</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {invoices.map((invoice, index) => (
                  <div key={invoice.id}>
                    <div className="flex items-center justify-between py-3">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <FileText className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{invoice.invoiceNumber}</p>
                            <Badge className={getStatusColor(invoice.status)}>
                              {invoice.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {invoice.description} • {new Date(invoice.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <p className="font-semibold">${invoice.amount.toFixed(2)}</p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownloadInvoice(invoice.invoiceNumber)}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </div>
                    {index < invoices.length - 1 && <Separator />}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      </div>
    </>
  );
};

export default Billing;
