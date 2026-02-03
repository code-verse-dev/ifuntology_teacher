import { useEffect } from "react";
import DashboardWithSidebarLayout from "@/components/layout/DashboardWithSidebarLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Users,
    DollarSign,
    Link as LinkIcon,
    Copy,
    LayoutList,
    Wallet,
    CheckCircle2
} from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { AlertCircle, X } from "lucide-react";

export default function AffiliateProgram() {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isAlertOpen, setIsAlertOpen] = useState(false);

    useEffect(() => {
        document.title = "Affiliate Program • iFuntology Teacher";
    }, []);

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success("Affiliate link copied to clipboard!");
    };

    return (
        <DashboardWithSidebarLayout>
            <div className="mx-auto w-full space-y-6 pb-10">
                <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Affiliate Program</h1>

                {/* Top Statistics Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="p-4 rounded-2xl border-none shadow-sm bg-white dark:bg-slate-900">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 text-orange-600 mb-3">
                            <Users className="h-5 w-5" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs text-muted-foreground font-medium">Pending Subscribers</p>
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">05</h3>
                        </div>
                    </Card>
                    <Card className="p-4 rounded-2xl border-none shadow-sm bg-white dark:bg-slate-900">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 text-orange-600 mb-3">
                            <Users className="h-5 w-5" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs text-muted-foreground font-medium">Active Subscribers</p>
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">02</h3>
                        </div>
                    </Card>
                    <Card className="p-4 rounded-2xl border-none shadow-sm bg-white dark:bg-slate-900">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600 mb-3">
                            <DollarSign className="h-5 w-5" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs text-muted-foreground font-medium">Total Commission</p>
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">$499</h3>
                        </div>
                    </Card>
                    <Card className="p-4 rounded-2xl border-none shadow-sm bg-white dark:bg-slate-900">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600 mb-3">
                            <DollarSign className="h-5 w-5" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs text-muted-foreground font-medium">Withdrawable Amount</p>
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">$499</h3>
                        </div>
                    </Card>
                </div>

                {/* Affiliate Link Section */}
                <Card className="p-6 rounded-3xl border-none shadow-sm bg-white dark:bg-slate-900">
                    <h2 className="text-lg font-bold mb-4">Your Affiliate Link</h2>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="flex-1 relative">
                            <Input
                                readOnly
                                value="https://ifuntology.com/ref/TEACHER123"
                                className="rounded-full bg-slate-50 dark:bg-slate-800 border-none h-12 pr-12 text-sm text-slate-600 dark:text-slate-300"
                            />
                        </div>
                        <Button
                            className="rounded-full bg-lime-600 hover:bg-lime-700 text-white px-8 h-12 gap-2"
                            onClick={() => copyToClipboard("https://ifuntology.com/ref/TEACHER123")}
                        >
                            <Copy className="h-4 w-4" />
                            Copy
                        </Button>
                    </div>
                </Card>

                {/* Subscribers & Analytics Table */}
                <Card className="p-6 rounded-3xl border-none shadow-sm bg-white dark:bg-slate-900 overflow-hidden">
                    <div className="flex items-center gap-2 mb-6 text-lg font-bold">
                        <Users className="h-5 w-5 text-lime-600" />
                        <h2>Subscribers & Analytics</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 dark:bg-slate-800/50">
                                <tr className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                    <th className="px-4 py-3 first:rounded-l-lg last:rounded-r-lg">Name</th>
                                    <th className="px-4 py-3 first:rounded-l-lg last:rounded-r-lg">Registration Date</th>
                                    <th className="px-4 py-3 first:rounded-l-lg last:rounded-r-lg">Subscriber Type</th>
                                    <th className="px-4 py-3 first:rounded-l-lg last:rounded-r-lg">Amount Paid</th>
                                    <th className="px-4 py-3 first:rounded-l-lg last:rounded-r-lg">Commission Earned</th>
                                    <th className="px-4 py-3 first:rounded-l-lg last:rounded-r-lg text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                <tr className="text-sm">
                                    <td className="px-4 py-4 font-medium">Emma Johnson</td>
                                    <td className="px-4 py-4 text-slate-500">12/07/2025</td>
                                    <td className="px-4 py-4 text-slate-500">Course</td>
                                    <td className="px-4 py-4 font-semibold text-slate-700 dark:text-slate-300">$5,000</td>
                                    <td className="px-4 py-4 font-semibold text-slate-900 dark:text-white">$500</td>
                                    <td className="px-4 py-4 text-center">
                                        <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200 dark:bg-green-900/10 dark:text-green-400 dark:border-green-900 font-normal rounded-full px-4">
                                            Active
                                        </Badge>
                                    </td>
                                </tr>
                                <tr className="text-sm">
                                    <td className="px-4 py-4 font-medium">Liam Chen</td>
                                    <td className="px-4 py-4 text-slate-500">15/07/2025</td>
                                    <td className="px-4 py-4 text-slate-500">Service</td>
                                    <td className="px-4 py-4 font-semibold text-slate-700 dark:text-slate-300">$2,000</td>
                                    <td className="px-4 py-4 font-semibold text-slate-900 dark:text-white">$200</td>
                                    <td className="px-4 py-4 text-center">
                                        <Badge variant="outline" className="bg-orange-50 text-orange-600 border-orange-200 dark:bg-orange-900/10 dark:text-orange-400 dark:border-orange-900 font-normal rounded-full px-4">
                                            Pending
                                        </Badge>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </Card>

                {/* Commission Summary Section */}
                <Card className="p-6 rounded-3xl border-none shadow-sm bg-white dark:bg-slate-900">
                    <div className="flex items-center gap-2 mb-4 text-lg font-bold text-slate-900 dark:text-white">
                        <DollarSign className="h-5 w-5 text-lime-600" />
                        <h2>Commission Summary</h2>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 max-w-2xl">
                            <div className="flex items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm">
                                <div className="h-10 w-10 flex items-center justify-center bg-orange-100 text-orange-600 rounded-xl">
                                    <DollarSign className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Approved</p>
                                    <p className="text-xl font-bold">$499</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm">
                                <div className="h-10 w-10 flex items-center justify-center bg-green-100 text-green-600 rounded-xl">
                                    <DollarSign className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Paid</p>
                                    <p className="text-xl font-bold">$499</p>
                                </div>
                            </div>
                        </div>
                        <p className="text-sm text-slate-500 font-medium">
                            Commission is auto-calculated at 10% on all products and services.
                        </p>
                    </div>
                </Card>

                {/* Withdrawals Section */}
                <Card className="p-6 rounded-3xl border-none shadow-sm bg-white dark:bg-slate-900">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white">
                            <Wallet className="h-5 w-5 text-lime-600" />
                            <h2>Withdrawals</h2>
                        </div>
                        <Button
                            className="rounded-full bg-lime-600 hover:bg-lime-700 text-white px-6"
                            onClick={() => setIsFormOpen(true)}
                        >
                            Request Withdrawal
                        </Button>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
                            <div className="flex items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm">
                                <div className="h-10 w-10 flex items-center justify-center bg-orange-100 text-orange-600 rounded-xl">
                                    <DollarSign className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Eligible Amount</p>
                                    <p className="text-xl font-bold">$499</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm">
                                <div className="h-10 w-10 flex items-center justify-center bg-green-100 text-green-600 rounded-xl">
                                    <DollarSign className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Last Withdrawal</p>
                                    <div className="flex items-center gap-1">
                                        <p className="text-xl font-bold">$499</p>
                                        <span className="text-[10px] font-bold text-slate-400">(Settled)</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Affiliate Compliance Form Dialog */}
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogContent className="sm:max-w-[600px] rounded-[2rem] p-8 border-none dark:bg-slate-900 overflow-hidden">
                    <DialogHeader className="mb-6">
                        <DialogTitle className="text-2xl font-bold">Affiliate Compliance Form</DialogTitle>
                        <DialogDescription className="text-slate-500 font-medium">
                            Update order details, quantities, and shipping information.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                Full Name <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                placeholder="Enter Name"
                                className="rounded-full bg-slate-50 dark:bg-slate-800 border-none h-12"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                Tax Details <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                placeholder="Enter Details"
                                className="rounded-full bg-slate-50 dark:bg-slate-800 border-none h-12"
                            />
                        </div>
                    </div>

                    <div className="space-y-2 mb-6">
                        <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                            Address <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            placeholder="123 Main St, Springfield, IL 62701"
                            className="rounded-full bg-slate-50 dark:bg-slate-800 border-none h-12"
                        />
                    </div>

                    <div className="space-y-2 mb-8">
                        <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                            Bank Account <span className="text-red-500">*</span>
                        </Label>
                        <Select>
                            <SelectTrigger className="rounded-full bg-slate-50 dark:bg-slate-800 border-none h-12 text-slate-500">
                                <SelectValue placeholder="Select Bank" />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl border-none shadow-xl">
                                <SelectItem value="bank1">Bank of America</SelectItem>
                                <SelectItem value="bank2">Chase</SelectItem>
                                <SelectItem value="bank3">Wells Fargo</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex gap-4">
                        <Button
                            variant="outline"
                            className="flex-1 rounded-full border-slate-200 dark:border-slate-800 h-12 font-bold"
                            onClick={() => setIsFormOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            className="flex-1 rounded-full bg-gradient-to-r from-lime-500 to-green-600 hover:from-lime-600 hover:to-green-700 text-white font-bold h-12 border-none"
                            onClick={() => {
                                setIsFormOpen(false);
                                setIsAlertOpen(true);
                            }}
                        >
                            Submit
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* System Alert Dialog */}
            <Dialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
                <DialogContent className="sm:max-w-[450px] rounded-[2rem] p-10 border-none dark:bg-slate-900 text-center">
                    <div className="flex flex-col items-center gap-6">
                        <div className="h-20 w-20 flex items-center justify-center bg-red-600 text-white rounded-full">
                            <span className="text-5xl font-bold">!</span>
                        </div>

                        <div className="space-y-2">
                            <h2 className="text-2xl font-bold dark:text-white">System Alert</h2>
                            <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                                Your withdrawal request is under admin review.
                            </p>
                        </div>

                        <Button
                            className="w-full rounded-full bg-gradient-to-r from-lime-500 to-green-600 hover:from-lime-600 hover:to-green-700 text-white font-bold h-12 border-none"
                            onClick={() => setIsAlertOpen(false)}
                        >
                            Okay
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </DashboardWithSidebarLayout>
    );
}
