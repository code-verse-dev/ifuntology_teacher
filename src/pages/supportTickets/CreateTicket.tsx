import { useEffect, useRef, useState } from "react";
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
    Info,
    X,
    Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { useCreateTicketMutation } from "@/redux/services/apiSlices/ticketSlice";

export default function CreateTicket() {
    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [subject, setSubject] = useState("");
    const [priority, setPriority] = useState("");
    const [description, setDescription] = useState("");
    const [component, setComponent] = useState("");
    const [file, setFile] = useState<File | null>(null);

    const [createTicket, { isLoading }] = useCreateTicketMutation();

    useEffect(() => {
        document.title = "Create Support Ticket • iFuntology Teacher";
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.files?.[0] ?? null;
        if (selected) {
            const allowed = ["image/png", "image/jpeg", "image/jpg", "application/pdf"];
            if (!allowed.includes(selected.type)) {
                toast.error("Only PNG, JPG and PDF files are allowed.");
                return;
            }
            if (selected.size > 10 * 1024 * 1024) {
                toast.error("File must be under 10 MB.");
                return;
            }
            setFile(selected);
        }
    };

    const handleSubmit = async () => {
        if (!subject.trim()) return toast.error("Subject is required.");
        if (!priority) return toast.error("Priority is required.");
        if (!description.trim()) return toast.error("Description is required.");
        if (!component) return toast.error("Component is required.");

        const formData = new FormData();
        formData.append("subject", subject.trim());
        formData.append("priority", priority);
        formData.append("description", description.trim());
        formData.append("component", component);
        if (file) formData.append("file", file);

        try {
            const res: any = await createTicket({ data: formData }).unwrap();
            if (res?.status) {
                toast.message(res?.message || "Ticket submitted successfully.");
                navigate("/support-tickets");
            } else {
                toast.error(res?.message || "Failed to submit ticket.");
            }
        } catch (err: any) {
            toast.error(err?.data?.message || err?.message || "Failed to submit ticket.");
        } 
    };

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
                            <Select value={component} onValueChange={setComponent}>
                                <SelectTrigger className="rounded-full bg-slate-50 dark:bg-slate-800 border-none h-12 text-slate-500">
                                    <SelectValue placeholder="Select component" />
                                </SelectTrigger>
                                <SelectContent className="rounded-2xl border-none shadow-xl">
                                    <SelectItem value="lms">LMS Platform</SelectItem>
                                    <SelectItem value="enrichment_store">Enrichment Store</SelectItem>
                                    <SelectItem value="payments_billing">Payments &amp; Billing</SelectItem>
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
                                    placeholder="Enter subject"
                                    className="rounded-full bg-slate-50 dark:bg-slate-800 border-none h-12 px-6"
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                    Priority <span className="text-red-500">*</span>
                                </Label>
                                <Select value={priority} onValueChange={setPriority}>
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
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>

                        {/* Attachment */}
                        <div className="space-y-2">
                            <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                Attachment (Optional)
                            </Label>

                            {file ? (
                                <div className="flex items-center justify-between rounded-2xl bg-slate-50 dark:bg-slate-800 px-5 py-4 border border-slate-100 dark:border-slate-700">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <UploadCloud className="h-5 w-5 text-lime-600 shrink-0" />
                                        <div className="min-w-0">
                                            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate">{file.name}</p>
                                            <p className="text-[10px] text-slate-400">{(file.size / 1024).toFixed(1)} KB</p>
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7 text-slate-400 hover:text-red-500 shrink-0"
                                        onClick={() => { setFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            ) : (
                                <div
                                    className="border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-[2rem] p-10 flex flex-col items-center justify-center gap-3 bg-slate-50/50 dark:bg-slate-800/10 hover:bg-slate-50 transition-colors cursor-pointer"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <UploadCloud className="h-10 w-10 text-slate-300" />
                                    <div className="text-center">
                                        <p className="text-sm font-bold text-slate-500">Click to upload screenshots or documents</p>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">PNG, JPG, PDF up to 10MB</p>
                                    </div>
                                </div>
                            )}

                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".png,.jpg,.jpeg,.pdf"
                                className="hidden"
                                onChange={handleFileChange}
                            />
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row gap-4 pt-4">
                            <Button
                                variant="outline"
                                className="flex-1 rounded-full border-slate-200 dark:border-slate-800 h-12 font-bold text-slate-600 dark:text-slate-400"
                                disabled={isLoading}
                                onClick={() => navigate("/support-tickets")}
                            >
                                Cancel
                            </Button>
                            <Button
                                className="flex-1 rounded-full bg-gradient-to-r from-lime-500 to-green-600 hover:from-lime-600 hover:to-green-700 text-white font-bold h-12 border-none shadow-lg shadow-lime-500/20"
                                disabled={isLoading}
                                onClick={handleSubmit}
                            >
                                {isLoading ? (
                                    <span className="flex items-center gap-2">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Submitting…
                                    </span>
                                ) : "Submit Ticket"}
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
