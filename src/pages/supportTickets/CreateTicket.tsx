import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import DashboardWithSidebarLayout from "@/components/layout/DashboardWithSidebarLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    ChevronLeft,
    UploadCloud,
    Info
} from "lucide-react";

export default function CreateTicket() {
    const navigate = useNavigate();

    useEffect(() => {
        document.title = "Create Support Ticket • iFuntology Teacher";
    }, []);

    return (
        <DashboardWithSidebarLayout>
            <div className="mx-auto w-full max-w-5xl space-y-6 pb-10">

                {/* Back Link */}
                <Link
                    to="/support-tickets"
                    className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-wider"
                >
                    <ChevronLeft className="h-4 w-4" />
                    Back to Tickets
                </Link>

                <Card className="rounded-[2.5rem] border-none bg-white dark:bg-slate-900 p-8 md:p-12 shadow-sm space-y-8">
                    <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Create Support Ticket</h1>

                    <div className="space-y-6">
                        {/* Component Select */}
                        <div className="space-y-2">
                            <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                Which component is this ticket related to? <span className="text-red-500">*</span>
                            </Label>
                            <Select>
                                <SelectTrigger className="rounded-full bg-slate-50 dark:bg-slate-800 border-none h-12 text-slate-500">
                                    <SelectValue placeholder="Select component" />
                                </SelectTrigger>
                                <SelectContent className="rounded-2xl border-none shadow-xl">
                                    <SelectItem value="lms">LMS Platform</SelectItem>
                                    <SelectItem value="store">Enrichment Store</SelectItem>
                                    <SelectItem value="payment">Payments & Billing</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Subject & Priority */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                    Subject <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    placeholder="Enter Name"
                                    className="rounded-full bg-slate-50 dark:bg-slate-800 border-none h-12 px-6"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                    Priority <span className="text-red-500">*</span>
                                </Label>
                                <Select>
                                    <SelectTrigger className="rounded-full bg-slate-50 dark:bg-slate-800 border-none h-12 text-slate-500">
                                        <SelectValue placeholder="Select level" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-2xl border-none shadow-xl">
                                        <SelectItem value="low">Low</SelectItem>
                                        <SelectItem value="medium">Medium</SelectItem>
                                        <SelectItem value="high">High</SelectItem>
                                        <SelectItem value="urgent">Urgent</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                Description <span className="text-red-500">*</span>
                            </Label>
                            <Textarea
                                placeholder="Please provide detailed information about your issue..."
                                className="min-h-[150px] rounded-3xl bg-slate-50 dark:bg-slate-800 border-none p-6 resize-none"
                            />
                        </div>

                        {/* Attachment */}
                        <div className="space-y-2">
                            <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                Attachment (Optional)
                            </Label>
                            <div className="border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-[2rem] p-10 flex flex-col items-center justify-center gap-3 bg-slate-50/50 dark:bg-slate-800/10 hover:bg-slate-50 transition-colors cursor-pointer">
                                <UploadCloud className="h-10 w-10 text-slate-300" />
                                <div className="text-center">
                                    <p className="text-sm font-bold text-slate-500">Click to upload screenshots or documents</p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">PNG, JPG, PDF up to 10MB</p>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row gap-4 pt-4">
                            <Button
                                variant="outline"
                                className="flex-1 rounded-full border-slate-200 dark:border-slate-800 h-12 font-bold text-slate-600 dark:text-slate-400"
                                onClick={() => navigate("/support-tickets")}
                            >
                                Cancel
                            </Button>
                            <Button
                                className="flex-1 rounded-full bg-gradient-to-r from-lime-500 to-green-600 hover:from-lime-600 hover:to-green-700 text-white font-bold h-12 border-none shadow-lg shadow-lime-500/20"
                            >
                                Submit Ticket
                            </Button>
                        </div>

                        {/* Info Box */}
                        <div className="bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-2xl p-4 flex items-start gap-3">
                            <Info className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                            <div className="space-y-1">
                                <p className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">Need immediate assistance?</p>
                                <p className="text-xs text-blue-500/80 font-medium">For urgent issues, you can also chat with our support team directly or check our FAQs for quick solutions.</p>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        </DashboardWithSidebarLayout>
    );
}
