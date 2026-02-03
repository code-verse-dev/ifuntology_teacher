import { useEffect, useState } from "react";
import DashboardWithSidebarLayout from "@/components/layout/DashboardWithSidebarLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
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
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Users,
    Wallet,
    Plus,
    Search,
    BookOpen,
    Printer,
    Award,
    FileText,
    Pencil,
    GraduationCap,
    Download,
    Star,
    Info,
    MessageSquare,
    TrendingUp,
    CheckCircle2
} from "lucide-react";
import { cn } from "@/lib/utils";

// --- Mock Data ---

const batches = [
    { id: 1, name: "Spring 2024 - Grade 5", created: "1/15/2025", total: 15, active: 14, status: "Active" },
    { id: 2, name: "Spring 2024 - Grade 6", created: "1/15/2025", total: 12, active: 12, status: "Active" },
];

const studentsList = [
    { id: 1, name: "Emma Johnson", email: "emma.j@schocl.edu", batch: "Spring 2024 - Grade 5", books: 3, certs: 2, status: true },
    { id: 2, name: "Liam Chen", email: "liam.c@school.edu", batch: "Spring 2024 - Grade 5", books: 2, certs: 1, status: true },
];

const gradeBooks = [
    { id: 1, title: "The Magical Forest", author: "Emma Johnson", date: "12/24/2025", pages: 24, words: 3200, status: "Excellent", feedback: "Outstanding creativity and storytelling! The character development was particularly impressive." },
    { id: 2, title: "My Pet Dragon", author: "Sophia Matinez", date: "12/24/2025", pages: 16, words: 2100, status: "Pending Review", feedback: null },
];

const certificates = [
    { id: 1, title: "Excellence in Writing", student: "Emma Johnson", book: "The Magical Forest", date: "12/15/2025" },
    { id: 2, title: "Creative Storyteller", student: "Emma Johnson", book: "The Magical Forest", date: "12/15/2025" },
    { id: 3, title: "Aspiring Author", student: "Myles Wilson", book: "The Magical Forest", date: "12/15/2025" },
];

const lessonPlans = [
    { id: 1, title: "Introduction to Funtology", grade: "3rd Grade", downloads: "245 Downloads" },
    { id: 2, title: "Introduction to Funtology", grade: "4th Grade", downloads: "245 Downloads" },
    { id: 3, title: "Introduction to Funtology", grade: "5th Grade", downloads: "245 Downloads" },
    { id: 4, title: "Introduction to Funtology", grade: "6th Grade", downloads: "245 Downloads" },
    { id: 5, title: "Introduction to Funtology", grade: "7th Grade", downloads: "245 Downloads" },
    { id: 6, title: "Introduction to Funtology", grade: "8th Grade", downloads: "245 Downloads" },
];

const assignments = [
    { id: 1, title: "Creative Writing Prompts - Winter 2024", subtitle: "50 prompts for grades 3-8" },
    { id: 2, title: "Skintology Guide", subtitle: "Comprehensive guide for students" },
];

const assessments = [
    { id: 1, title: "Module 1: Intro to Funtology", type: "Quiz", attempts: 24, passRate: 84, avgScore: 92, passingScore: 70 },
    { id: 2, title: "Module 2: Intro to Funtology", type: "Quiz", attempts: 24, passRate: 88, avgScore: 92, passingScore: 70 },
    { id: 3, title: "Module 1: Intro to Funtology", type: "Test", attempts: 24, passRate: 84, avgScore: 92, passingScore: 70 },
    { id: 4, title: "Final Exam: Complete Course Assessment", type: "Exam", attempts: 24, passRate: 75, avgScore: 92, passingScore: 70 },
];

const topAssessments = [
    { id: 1, title: "Module 1: Nail Anatomy Quiz", course: "Nailtology", passRate: 92 },
    { id: 2, title: "Final Exam: Complete Skintology Course Assessment", course: "Skintology", passRate: 92 },
];

const printOrders = [
    { id: 1, title: "The Magical Forest", student: "Emma Johnson", date: "12/24/2025", pages: 24, words: 3200, status: "Processing", cost: 89.99, quantity: "10 Copies", format: "Paperback", isbn: "978-1-234567-89-0", address: "123 Main St, Springfield, IL 62701" },
    { id: 2, title: "Adventures in Space", student: "Emma Johnson", date: "12/24/2025", pages: 24, words: 3200, status: "Pending Payment", cost: 44.99, quantity: "05 Copies", format: "Paperback", isbn: "Not Assigned", address: "123 Main St, Springfield, IL 62701" },
];

export default function WriteToRead() {
    const [activeTab, setActiveTab] = useState("students");
    const [isCreateBatchOpen, setIsCreateBatchOpen] = useState(false);
    const [isGradeModalOpen, setIsGradeModalOpen] = useState(false);
    const [isModifyOrderOpen, setIsModifyOrderOpen] = useState(false);
    const [selectedBook, setSelectedBook] = useState<any>(null);
    const [selectedOrder, setSelectedOrder] = useState<any>(null);

    useEffect(() => {
        document.title = "Write to Read Platform • iFuntology Teacher";
    }, []);

    return (
        <DashboardWithSidebarLayout>
            <div className="mx-auto w-full space-y-6 pb-12">
                <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Write to Read Platform</h1>

                {/* Subscription Status Card */}
                <Card className="rounded-[2rem] border-none bg-white dark:bg-slate-900 p-8 shadow-sm overflow-hidden relative">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
                        <div className="space-y-2 text-left">
                            <div className="flex items-center gap-2">
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Subscription Status</h2>
                                <Badge className="bg-green-500 hover:bg-green-600 text-white border-none rounded-full px-3 py-0.5 text-[10px] font-bold uppercase">Active</Badge>
                            </div>
                            <p className="text-sm font-medium text-slate-500">Yearly Plan • Renews on 1/15/2025</p>
                        </div>
                        <Button className="rounded-full bg-lime-600 hover:bg-lime-700 text-white font-bold px-8 h-12 border-none">
                            Manage Subscription
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-[1.5rem] p-6 flex items-center gap-5 border border-slate-100 dark:border-slate-800/50">
                            <div className="h-14 w-14 rounded-2xl bg-orange-100 dark:bg-orange-500/10 flex items-center justify-center text-orange-500">
                                <Users className="h-7 w-7" />
                            </div>
                            <div className="text-left">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Students Used</p>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">27/50</p>
                            </div>
                        </div>

                        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-[1.5rem] p-6 flex items-center gap-5 border border-slate-100 dark:border-slate-800/50">
                            <div className="h-14 w-14 rounded-2xl bg-blue-100 dark:bg-blue-500/10 flex items-center justify-center text-blue-500">
                                <Wallet className="h-7 w-7" />
                            </div>
                            <div className="text-left">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Price</p>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">$499 / year</p>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Main Tabs */}
                <Tabs defaultValue="students" value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="bg-transparent border-b border-slate-100 dark:border-slate-800 w-full justify-start rounded-none h-auto p-0 mb-8 overflow-x-auto gap-10 flex-nowrap scrollbar-hide">
                        {[
                            { id: "students", label: "Students & Batches", icon: Users },
                            { id: "grade", label: "Grade Books", icon: BookOpen },
                            { id: "print", label: "Print Orders", icon: Printer },
                            { id: "certs", label: "Certificates", icon: Award },
                            { id: "resources", label: "Resources", icon: FileText },
                            { id: "story", label: "Story Builder", icon: Pencil },
                            { id: "quizzes", label: "Quizzes,Tests & Exams", icon: GraduationCap },
                        ].map((t) => (
                            <TabsTrigger
                                key={t.id}
                                value={t.id}
                                className="bg-transparent border-b-2 border-transparent data-[state=active]:border-orange-500 data-[state=active]:text-orange-500 text-slate-400 rounded-none h-auto py-4 px-0 font-bold transition-all text-xs flex items-center gap-2 whitespace-nowrap shadow-none"
                            >
                                <t.icon className="h-4 w-4" />
                                {t.label}
                            </TabsTrigger>
                        ))}
                    </TabsList>

                    {/* 1. Students & Batches Tab */}
                    <TabsContent value="students" className="space-y-8 mt-0 outline-none">
                        <div className="space-y-6 text-left">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    <Users className="h-5 w-5 text-lime-600" />
                                    My Batches
                                </h3>
                                <Button
                                    className="rounded-full bg-lime-600 hover:bg-lime-700 text-white font-bold h-11 px-6 border-none"
                                    onClick={() => setIsCreateBatchOpen(true)}
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Create New Batch
                                </Button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {batches.map((batch) => (
                                    <div key={batch.id} className="rounded-[2rem] bg-gradient-to-br from-[#0f4c64] to-[#1c5d76] p-7 text-white shadow-lg space-y-4 text-left">
                                        <div className="flex justify-between items-start">
                                            <h4 className="text-lg font-bold leading-tight">{batch.name}</h4>
                                            <Badge className="bg-green-500/20 text-green-400 border-none rounded-full px-3 text-[10px] font-bold">Active</Badge>
                                        </div>
                                        <p className="text-xs text-white/60 font-medium lowercase">Created {batch.created}</p>
                                        <div className="pt-4 space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-white/70">Total Students</span>
                                                <span className="font-bold">{batch.total}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-white/70">Active</span>
                                                <span className="font-bold text-green-400">{batch.active}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-6 text-left">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <Users className="h-5 w-5 text-lime-600" />
                                Students
                            </h3>
                            <Card className="rounded-[2rem] border-none bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="border-b border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                                                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Student Name</th>
                                                <th className="px-6 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Email</th>
                                                <th className="px-6 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Batch</th>
                                                <th className="px-6 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Book Written</th>
                                                <th className="px-6 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Certificate</th>
                                                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                                            {studentsList.map((student) => (
                                                <tr key={student.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                                                    <td className="px-8 py-5">
                                                        <span className="text-sm font-bold text-slate-900 dark:text-white">{student.name}</span>
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        <span className="text-sm text-slate-500 font-medium">{student.email}</span>
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        <span className="text-sm text-slate-500 font-medium">{student.batch}</span>
                                                    </td>
                                                    <td className="px-6 py-5 text-center">
                                                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{student.books}</span>
                                                    </td>
                                                    <td className="px-6 py-5 text-center">
                                                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{student.certs}</span>
                                                    </td>
                                                    <td className="px-8 py-5 text-right">
                                                        <div className="flex items-center justify-end gap-3 font-bold text-xs">
                                                            <Switch defaultChecked={student.status} className="data-[state=checked]:bg-lime-500" />
                                                            <span className={cn(student.status ? "text-slate-600 dark:text-slate-400" : "text-slate-400")}>Active</span>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* 2. Grade Books Tab */}
                    <TabsContent value="grade" className="space-y-6 mt-0 outline-none text-left">
                        {gradeBooks.map((book) => (
                            <Card key={book.id} className="rounded-[2rem] border-none bg-white dark:bg-slate-900 p-8 shadow-sm space-y-6">
                                <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                                    <div className="flex items-start gap-4">
                                        <div className="h-12 w-12 rounded-2xl bg-lime-50 dark:bg-lime-500/10 flex items-center justify-center text-lime-500 shrink-0">
                                            <BookOpen className="h-6 w-6" />
                                        </div>
                                        <div className="space-y-1">
                                            <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                                                {book.title} <span className="text-slate-400 font-normal"> - by {book.author}</span>
                                            </h3>
                                            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Submitted: {book.date}</p>
                                        </div>
                                    </div>
                                    <Badge
                                        className={cn(
                                            "rounded-lg px-3 py-1 text-[10px] font-bold uppercase tracking-wide border-none",
                                            book.status === "Excellent" ? "bg-green-100 text-green-600 dark:bg-green-500/10 dark:text-green-400" : "bg-orange-100 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400"
                                        )}
                                    >
                                        {book.status}
                                    </Badge>
                                </div>
                                <div className="flex gap-3">
                                    <Badge className="bg-orange-500 hover:bg-orange-600 text-white border-none rounded-full px-4 h-8 font-bold text-xs">{book.pages} Pages</Badge>
                                    <Badge className="bg-orange-600 hover:bg-orange-700 text-white border-none rounded-full px-4 h-8 font-bold text-xs">{book.words} words</Badge>
                                </div>
                                {book.feedback && (
                                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 relative">
                                        <div className="flex items-start gap-3">
                                            <MessageSquare className="h-5 w-5 text-orange-500 mt-1 shrink-0" />
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-bold text-orange-500 uppercase tracking-widest">Your Feedback:</p>
                                                <p className="text-sm text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                                                    {book.feedback}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <div className="flex flex-wrap gap-4">
                                    <Button variant="outline" className="rounded-full border-slate-200 dark:border-slate-800 h-11 px-8 font-bold text-sm">Read Book</Button>
                                    <Button
                                        className="rounded-full bg-lime-600 hover:bg-lime-700 text-white font-bold h-11 px-8 border-none shadow-none"
                                        onClick={() => { setSelectedBook(book); setIsGradeModalOpen(true); }}
                                    >
                                        Update Grade
                                    </Button>
                                    {book.status === "Excellent" && (
                                        <Button className="rounded-full bg-orange-500 hover:bg-orange-600 text-white font-bold h-11 px-8 border-none shadow-none">
                                            Print Requested
                                        </Button>
                                    )}
                                </div>
                            </Card>
                        ))}
                    </TabsContent>

                    {/* 3. Print Orders Tab */}
                    <TabsContent value="print" className="space-y-6 mt-0 outline-none text-left">
                        <div className="flex justify-between items-center px-4">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">Book Print Orders</h3>
                            <Button className="rounded-full bg-lime-600 hover:bg-lime-700 text-white font-bold h-11 px-6 border-none gap-2">
                                <Download className="h-4 w-4" />
                                Export Orders
                            </Button>
                        </div>
                        {printOrders.map((order) => (
                            <Card key={order.id} className="rounded-[2rem] border-none bg-white dark:bg-slate-900 p-8 shadow-sm space-y-6">
                                <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                                    <div className="flex items-start gap-4">
                                        <div className="h-12 w-12 rounded-2xl bg-lime-50 dark:bg-lime-500/10 flex items-center justify-center text-lime-500 shrink-0">
                                            <BookOpen className="h-6 w-6" />
                                        </div>
                                        <div className="space-y-1">
                                            <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                                                {order.title} <Badge className={cn("ml-2 rounded-lg px-2 text-[10px] uppercase", order.status === "Processing" ? "bg-blue-100 text-blue-600" : "bg-orange-100 text-orange-600")}>{order.status}</Badge>
                                            </h3>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase">Student: {order.student} <span className="mx-2">•</span> Order Date: {order.date}</p>
                                        </div>
                                    </div>
                                    <p className="text-2xl font-black text-lime-600">${order.cost.toFixed(2)} <span className="text-[10px] text-slate-400 block text-right font-bold uppercase tracking-widest">Total Cost</span></p>
                                </div>
                                <div className="flex gap-3">
                                    <Badge className="bg-orange-500 text-white rounded-full px-4 h-8 font-bold text-xs">{order.pages} Pages</Badge>
                                    <Badge className="bg-orange-600 text-white rounded-full px-4 h-8 font-bold text-xs">{order.words} words</Badge>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {[
                                        { label: "Quantity", value: order.quantity },
                                        { label: "Format", value: order.format },
                                        { label: "Pages", value: order.pages },
                                        { label: "ISBN", value: order.isbn },
                                    ].map((item, idx) => (
                                        <div key={idx} className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 text-left border border-slate-100 dark:border-slate-800/50">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.label}</p>
                                            <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight">{item.value}</p>
                                        </div>
                                    ))}
                                </div>
                                <div className="bg-orange-50/30 dark:bg-orange-500/5 rounded-2xl p-5 flex items-center justify-between border border-orange-100/50 dark:border-orange-500/10">
                                    <div className="flex items-center gap-4 text-left">
                                        <div className="h-5 w-5 text-orange-500"><TrendingUp className="h-5 w-5 rotate-45" /></div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-bold text-orange-500 uppercase tracking-widest">Shipping Address</p>
                                            <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">{order.address}</p>
                                        </div>
                                    </div>
                                    <TrendingUp className="h-4 w-4 text-slate-300" />
                                </div>
                                <div className="flex gap-4">
                                    {order.status === "Pending Payment" && (
                                        <Button className="rounded-full bg-lime-600 hover:bg-lime-700 text-white h-11 px-8 font-bold">Pay Now</Button>
                                    )}
                                    <Button
                                        variant="outline"
                                        className="rounded-full bg-lime-600 text-white h-11 px-8 font-bold border-none hover:bg-lime-700 transition-colors"
                                        onClick={() => {
                                            setSelectedOrder(order);
                                            setIsModifyOrderOpen(true);
                                        }}
                                    >
                                        Modify Order
                                    </Button>

                                    <Button className="rounded-full bg-red-600 hover:bg-red-700 text-white h-11 px-8 font-bold border-none">Remove ISBN</Button>
                                </div>
                            </Card>
                        ))}
                    </TabsContent>

                    {/* 4. Certificates Tab */}
                    <TabsContent value="certs" className="space-y-8 mt-0 outline-none text-left">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Student Certificates</h3>
                            <Button className="rounded-full bg-lime-600 hover:bg-lime-700 text-white font-bold h-11 px-6 gap-2 border-none">
                                <Download className="h-4 w-4" /> Download All
                            </Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {certificates.map((cert) => (
                                <Card key={cert.id} className="rounded-[2rem] border-none bg-white dark:bg-slate-900 p-6 shadow-sm flex items-center justify-between group text-left">
                                    <div className="flex items-center gap-5">
                                        <div className="h-16 w-16 rounded-2xl bg-orange-500 flex items-center justify-center text-white shrink-0">
                                            <FileText className="h-8 w-8" />
                                        </div>
                                        <div className="space-y-1">
                                            <h4 className="font-bold text-slate-900 dark:text-white leading-tight">{cert.title}</h4>
                                            <p className="text-sm font-medium text-slate-500">{cert.student}</p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pt-1 leading-tight">
                                                Book: {cert.book} <span className="mx-2">•</span> Awarded: {cert.date}
                                            </p>
                                        </div>
                                    </div>
                                    <Button size="icon" variant="ghost" className="h-10 w-10 rounded-xl bg-slate-50 dark:bg-slate-800 text-lime-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Download className="h-5 w-5" />
                                    </Button>
                                </Card>
                            ))}
                        </div>
                    </TabsContent>

                    {/* 5. Resources Tab */}
                    <TabsContent value="resources" className="space-y-8 mt-0 outline-none text-left">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">Lesson Plans (Grades 3-12)</h3>
                            <Button className="rounded-full bg-lime-600 hover:bg-lime-700 text-white font-bold h-11 px-6 gap-2 border-none">
                                <Download className="h-4 w-4" /> Download All
                            </Button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {lessonPlans.map((lp) => (
                                <Card key={lp.id} className="rounded-[2rem] border-none bg-white dark:bg-slate-900 p-6 shadow-sm flex items-center justify-between group">
                                    <div className="flex items-center gap-4">
                                        <div className="h-14 w-14 rounded-2xl bg-orange-500 flex items-center justify-center text-white shrink-0 shadow-lg shadow-orange-500/20">
                                            <FileText className="h-7 w-7" />
                                        </div>
                                        <div className="space-y-1">
                                            <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">{lp.title}</h4>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-tight">{lp.grade}</p>
                                            <p className="text-[10px] font-medium text-slate-400 leading-tight">{lp.downloads}</p>
                                        </div>
                                    </div>
                                    <Button size="icon" variant="ghost" className="h-10 w-10 text-lime-500">
                                        <Download className="h-5 w-5" />
                                    </Button>
                                </Card>
                            ))}
                        </div>
                        <div className="space-y-6 pt-6">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">Writing Assignments (Admin Provided)</h3>
                            <div className="space-y-4">
                                {assignments.map((item) => (
                                    <Card key={item.id} className="rounded-[1.5rem] border-none bg-slate-50 dark:bg-slate-800/50 p-6 flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <FileText className="h-5 w-5 text-orange-500" />
                                            <div className="text-left">
                                                <h4 className="text-sm font-bold text-orange-500 leading-tight">{item.title}</h4>
                                                <p className="text-xs text-slate-500 font-medium">{item.subtitle}</p>
                                            </div>
                                        </div>
                                        <Button className="rounded-full bg-lime-600 hover:bg-lime-700 text-white h-9 px-8 font-bold border-none text-xs">View</Button>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    </TabsContent>

                    {/* 6. Story Builder Tab */}
                    <TabsContent value="story" className="mt-0 outline-none text-left">
                        <Card className="rounded-[2.5rem] border-none bg-white dark:bg-slate-900 p-8 md:p-12 shadow-sm space-y-10">
                            <div className="space-y-2">
                                <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white leading-tight">Personal Story Builder</h3>
                                <p className="text-sm text-slate-500 font-medium">Create your own stories using our interactive story builder tool.</p>
                            </div>
                            <div className="grid gap-8 max-w-4xl">
                                <div className="space-y-3">
                                    <Label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                                        Story Title <span className="text-red-500">*</span>
                                    </Label>
                                    <Input placeholder="Enter Title" className="h-14 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border-none px-6 text-sm font-medium" />
                                </div>
                                <div className="space-y-3">
                                    <Label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                                        Genre <span className="text-red-500">*</span>
                                    </Label>
                                    <Select defaultValue="adventure">
                                        <SelectTrigger className="h-14 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border-none px-6 text-sm font-medium">
                                            <SelectValue placeholder="Select Genre" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl border-none shadow-2xl">
                                            <SelectItem value="adventure">Adventure</SelectItem>
                                            <SelectItem value="mystery">Mystery</SelectItem>
                                            <SelectItem value="fantasy">Fantasy</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-3">
                                    <Label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                                        Story Content <span className="text-red-500">*</span>
                                    </Label>
                                    <Textarea placeholder="Write content...." className="min-h-[400px] rounded-[2rem] bg-slate-50 dark:bg-slate-800/50 border-none p-8 text-sm font-medium resize-none" />
                                </div>
                                <div className="flex gap-4 pt-4">
                                    <Button variant="outline" className="h-14 px-12 rounded-full border-slate-200 dark:border-slate-800 font-extrabold text-slate-600 dark:text-slate-400">Preview</Button>
                                    <Button className="h-14 px-12 rounded-full bg-lime-600 hover:bg-lime-700 text-white font-extrabold border-none shadow-lg shadow-lime-500/10">Save Draft</Button>
                                </div>
                            </div>
                        </Card>
                    </TabsContent>

                    {/* 7. Quizzes Tab */}
                    <TabsContent value="quizzes" className="mt-0 outline-none">
                        <Tabs defaultValue="assessments" className="w-full">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8 text-left">
                                <div className="space-y-2">
                                    <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white leading-tight">Quizzes, Tests & Exams</h3>
                                    <p className="text-sm text-slate-500 font-medium">Manage assessments and track student performance.</p>
                                </div>
                                <div className="flex items-center gap-3 w-full md:w-auto">
                                    <Select defaultValue="all">
                                        <SelectTrigger className="h-11 rounded-full bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 w-[180px] font-bold text-xs">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl">
                                            <SelectItem value="all">All Courses</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Button className="rounded-full bg-lime-600 hover:bg-lime-700 text-white font-bold h-11 px-6 border-none gap-2 flex-1 md:flex-none">
                                        <TrendingUp className="h-4 w-4" /> Export Report
                                    </Button>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                                {[
                                    { label: "Total Quizzes", value: 3, icon: FileText, color: "blue" },
                                    { label: "Total Tests", value: 1, icon: FileText, color: "purple" },
                                    { label: "Total Exams", value: 1, icon: Star, color: "orange" },
                                    { label: "Total Attempts", value: 90, icon: TrendingUp, color: "green" },
                                    { label: "Avg Pass Rate", value: "89%", icon: CheckCircle2, color: "emerald", extra: true },
                                ].map((stat, i) => (
                                    <Card key={i} className="rounded-2xl border-none bg-white dark:bg-slate-900 p-5 flex items-center justify-between shadow-sm relative">
                                        <div className="text-left space-y-1">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-tight">{stat.label}</p>
                                            <div className="flex items-center gap-2">
                                                <p className={cn("text-xl font-bold leading-tight", stat.extra ? "text-green-500" : "text-slate-900 dark:text-white")}>{stat.value}</p>
                                                {stat.extra && <TrendingUp className="h-4 w-4 text-green-500" />}
                                            </div>
                                        </div>
                                        <stat.icon className={cn("h-6 w-6 opacity-30",
                                            stat.color === "blue" ? "text-blue-500" :
                                                stat.color === "purple" ? "text-purple-500" :
                                                    stat.color === "orange" ? "text-orange-500" :
                                                        "text-green-500")}
                                        />
                                    </Card>
                                ))}
                            </div>

                            <TabsList className="bg-transparent h-auto p-0 mb-6 justify-start w-full gap-8 border-b border-slate-100 dark:border-slate-800 rounded-none overflow-x-auto">
                                {["All Assessments", "Quizzes", "Tests", "Exams", "Analytics"].map((sub) => (
                                    <TabsTrigger key={sub} value={sub.toLowerCase().replace(" ", "-")} className="bg-transparent border-b-2 border-transparent data-[state=active]:border-orange-500 data-[state=active]:text-orange-500 text-slate-400 rounded-none h-auto py-3 px-0 font-bold transition-all text-xs shadow-none">
                                        {sub}
                                    </TabsTrigger>
                                ))}
                            </TabsList>

                            <TabsContent value="all-assessments" className="space-y-4 mt-0">
                                {assessments.map((a) => (
                                    <Card key={a.id} className="rounded-[2rem] border-none bg-white dark:bg-slate-900 p-6 md:p-8 shadow-sm space-y-6 text-left relative overflow-hidden">
                                        <div className="flex items-start gap-4">
                                            <div className="h-10 w-10 text-lime-500 mt-1"><BookOpen className="h-7 w-7" /></div>
                                            <div className="space-y-1 pr-24">
                                                <h4 className="text-lg font-bold text-slate-900 dark:text-white leading-tight flex items-center gap-3">
                                                    {a.title} <Badge className="bg-blue-50 text-blue-500 border-none rounded-lg px-2 text-[10px] font-bold">{a.type}</Badge>
                                                </h4>
                                                <div className="flex gap-4 text-[10px] font-bold text-orange-500 uppercase tracking-widest">
                                                    <span>Funtology</span> <span>Module 1</span> <span>10 questions</span> <span>15 mins</span>
                                                </div>
                                            </div>
                                            <Button className="absolute top-8 right-8 rounded-full bg-lime-600 hover:bg-lime-700 text-white font-bold h-10 px-6 border-none text-xs">Export Results</Button>
                                        </div>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            {[
                                                { label: "Total Attempts", val: a.attempts },
                                                { label: "Average Score", val: a.passRate + "%" },
                                                { label: "Pass Rate", val: a.avgScore + "%" },
                                                { label: "Passing Score", val: a.passingScore + "%" },
                                            ].map((m, i) => (
                                                <div key={i} className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-5 text-left border border-slate-100 dark:border-slate-800/50">
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-tight">{m.label}</p>
                                                    <p className="text-xl font-bold text-slate-900 dark:text-white leading-tight">{m.val}</p>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-[11px] font-bold">
                                                <span className="text-slate-400 uppercase tracking-widest">Pass Rate Progress</span>
                                                <span className="text-slate-900 dark:text-white">{a.passRate}%</span>
                                            </div>
                                            <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                <div className="h-full bg-lime-500 transition-all" style={{ width: `${a.passRate}%` }} />
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </TabsContent>

                            <TabsContent value="analytics" className="mt-0 outline-none text-left">
                                <Card className="rounded-[2rem] border-none bg-white dark:bg-slate-900 p-8 md:p-10 shadow-sm space-y-10">
                                    <div className="space-y-6">
                                        <h4 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">Performance Overview</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                            <div className="space-y-6">
                                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Assessment Type Distribution</p>
                                                <div className="space-y-5">
                                                    {[
                                                        { label: "Exams", val: 3, total: 5, color: "bg-lime-500" },
                                                        { label: "Tests", val: 3, total: 5, color: "bg-green-500" },
                                                        { label: "Quizzes", val: 3, total: 5, color: "bg-emerald-500" },
                                                    ].map((dist, i) => (
                                                        <div key={i} className="space-y-2">
                                                            <div className="flex justify-between text-[10px] font-bold">
                                                                <span className="text-slate-700 dark:text-slate-300">{dist.label}</span>
                                                                <span className="text-slate-900 dark:text-white">0{dist.val}</span>
                                                            </div>
                                                            <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                                <div className={cn("h-full rounded-full transition-all", dist.color)} style={{ width: `${(dist.val / dist.total) * 100}%` }} />
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-1 gap-4">
                                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Overall Statistics</p>
                                                <div className="flex gap-4">
                                                    <Card className="flex-1 rounded-2xl border-none bg-slate-50 dark:bg-slate-800/50 p-6 flex flex-col justify-between">
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Attempts</p>
                                                        <div className="flex items-end justify-between">
                                                            <p className="text-3xl font-bold text-slate-900 dark:text-white">90</p>
                                                            <TrendingUp className="h-6 w-6 text-green-500 mb-1" />
                                                        </div>
                                                    </Card>
                                                    <Card className="flex-1 rounded-2xl border-none bg-slate-50 dark:bg-slate-800/50 p-6 flex flex-col justify-between">
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Avg Pass Rate</p>
                                                        <div className="flex items-end justify-between">
                                                            <p className="text-3xl font-bold text-emerald-500">89%</p>
                                                            <CheckCircle2 className="h-6 w-6 text-emerald-500 mb-1" />
                                                        </div>
                                                    </Card>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-6">
                                        <h4 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">Top Performing Assessments</h4>
                                        <div className="space-y-4">
                                            {topAssessments.map((a) => (
                                                <div key={a.id} className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 space-y-4">
                                                    <div className="flex items-start gap-4 pr-24 relative">
                                                        <FileText className="h-5 w-5 text-orange-500 mt-1 shrink-0" />
                                                        <div className="text-left space-y-1">
                                                            <h5 className="text-sm font-bold text-orange-500 leading-tight">{a.title}</h5>
                                                            <p className="text-xs text-slate-400 font-medium">{a.course}</p>
                                                        </div>
                                                        <div className="absolute top-0 right-0 text-right">
                                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Pass Rate</p>
                                                            <p className="text-sm font-bold text-slate-900 dark:text-white">{a.passRate}%</p>
                                                        </div>
                                                    </div>
                                                    <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                        <div className="h-full bg-green-500 transition-all" style={{ width: `${a.passRate}%` }} />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </TabsContent>
                </Tabs>
            </div>

            {/* Modals remain same as per design */}
            <Dialog open={isCreateBatchOpen} onOpenChange={setIsCreateBatchOpen}>
                <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto rounded-[2.5rem] bg-white dark:bg-slate-900 p-8 md:p-12 border-none shadow-2xl custom-scrollbar">

                    <DialogHeader className="text-left space-y-4">
                        <DialogTitle className="text-2xl font-extrabold text-slate-900 dark:text-white leading-tight">Create New Batch & Invite Students</DialogTitle>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Minimum 10 students for first batch, minimum 2 students for subsequent batches.</p>
                    </DialogHeader>
                    <div className="space-y-8 mt-6">
                        <div className="space-y-3 text-left">
                            <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">Batch Name <span className="text-red-500">*</span></Label>
                            <Input placeholder="Spring 2024- Grade 7" className="rounded-2xl bg-slate-50 dark:bg-slate-800/50 border-none h-14 px-6 text-sm font-medium" />
                        </div>
                        <div className="space-y-3 text-left">
                            <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">Student Information <span className="text-red-500">*</span></Label>
                            <p className="text-[10px] font-medium text-slate-400">Enter student details in the format: First Name, Last Name, Email (one per line)</p>
                            <Textarea placeholder="John, Smith, john@email.com\nLiam, Chen, liam@email.com" className="min-h-[180px] rounded-[2rem] bg-slate-50 dark:bg-slate-800/50 border-none p-6 resize-none text-sm font-medium" />
                        </div>
                        <div className="bg-orange-50/50 dark:bg-orange-950/10 border border-orange-100 dark:border-orange-900/30 rounded-2xl p-5 flex items-start gap-4">
                            <div className="h-10 w-10 flex items-center justify-center bg-white dark:bg-slate-800 rounded-xl text-orange-500 shrink-0"><Info className="h-5 w-5" /></div>
                            <p className="text-xs text-orange-600 font-bold leading-relaxed pt-1">Students will receive email invitations with login credentials to access the Write to Read Platform.</p>
                        </div>
                        <div className="flex gap-4 pt-4">
                            <Button variant="outline" className="flex-1 rounded-full border-slate-200 dark:border-slate-800 h-14 font-extrabold text-slate-600 dark:text-slate-400" onClick={() => setIsCreateBatchOpen(false)}>Cancel</Button>
                            <Button className="flex-1 rounded-full bg-lime-500 hover:bg-lime-600 text-white font-extrabold h-14 border-none shadow-lg">Send Invitations</Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Modify Print Order Modal */}
            <Dialog open={isModifyOrderOpen} onOpenChange={setIsModifyOrderOpen}>
                <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto rounded-[2.5rem] bg-white dark:bg-slate-900 p-8 md:p-12 border-none shadow-2xl custom-scrollbar">

                    <DialogHeader className="text-left space-y-2">
                        <DialogTitle className="text-2xl font-extrabold text-slate-900 dark:text-white leading-tight">Modify Print Order</DialogTitle>
                        <p className="text-xs font-medium text-slate-400">Update order details, quantities, and shipping information.</p>
                    </DialogHeader>

                    <div className="space-y-6 mt-8">
                        <div className="space-y-3 text-left">
                            <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">Quantity <span className="text-red-500">*</span></Label>
                            <Input defaultValue={selectedOrder?.quantity.split(' ')[0]} className="rounded-2xl bg-slate-50 dark:bg-slate-800/50 border-none h-14 px-6 text-sm font-medium" />
                        </div>

                        <div className="space-y-3 text-left">
                            <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">Shipping Address <span className="text-red-500">*</span></Label>
                            <Input defaultValue={selectedOrder?.address} className="rounded-2xl bg-slate-50 dark:bg-slate-800/50 border-none h-14 px-6 text-sm font-medium" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-3 text-left">
                                <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">Print Format <span className="text-red-500">*</span></Label>
                                <Select defaultValue={selectedOrder?.format.toLowerCase()}>
                                    <SelectTrigger className="rounded-2xl bg-slate-50 dark:bg-slate-800/50 border-none h-14 px-6 text-sm font-medium">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl border-none shadow-2xl">
                                        <SelectItem value="paperback">Paperback</SelectItem>
                                        <SelectItem value="hardcover">Hardcover</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-3 text-left">
                                <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">ISBN (Optional)</Label>
                                <Input defaultValue={selectedOrder?.isbn !== "Not Assigned" ? selectedOrder?.isbn : ""} className="rounded-2xl bg-slate-50 dark:bg-slate-800/50 border-none h-14 px-6 text-sm font-medium" />
                            </div>
                        </div>

                        <div className="flex gap-4 pt-6">
                            <Button
                                variant="outline"
                                className="flex-1 rounded-full border-slate-200 dark:border-slate-800 h-14 font-extrabold text-slate-600 dark:text-slate-400"
                                onClick={() => setIsModifyOrderOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button className="flex-1 rounded-full bg-lime-500 hover:bg-lime-600 text-white font-extrabold h-14 border-none shadow-lg shadow-lime-500/10">
                                Update Order
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Grade Modal */}
            <Dialog open={isGradeModalOpen} onOpenChange={setIsGradeModalOpen}>
                <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto rounded-[2.5rem] bg-white dark:bg-slate-900 p-8 md:p-12 border-none shadow-2xl custom-scrollbar">
                    <DialogHeader className="text-left space-y-2">
                        <DialogTitle className="text-2xl font-extrabold text-slate-900 dark:text-white leading-tight">
                            Grade Book: {selectedBook?.title}
                        </DialogTitle>
                        <p className="text-xs font-medium text-slate-400">By {selectedBook?.author}</p>
                    </DialogHeader>

                    <div className="space-y-8 mt-8">
                        <div className="space-y-4 text-left">
                            <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                Grade <span className="text-red-500">*</span>
                            </Label>
                            <div className="grid grid-cols-3 gap-4">
                                {[
                                    { label: "Fair", icon: Star, count: 1, color: "orange" },
                                    { label: "Good", icon: Star, count: 2, color: "blue" },
                                    { label: "Excellent", icon: Star, count: 3, color: "green" },
                                ].map((g) => (
                                    <button
                                        key={g.label}
                                        className={cn(
                                            "flex flex-col items-center gap-3 p-5 rounded-3xl border-2 transition-all group",
                                            g.color === "orange" ? "bg-orange-50/50 border-transparent hover:border-orange-500 dark:bg-orange-500/10" :
                                                g.color === "blue" ? "bg-blue-50/50 border-transparent hover:border-blue-500 dark:bg-blue-500/10" :
                                                    "bg-green-50/50 border-transparent hover:border-green-500 dark:bg-green-500/10"
                                        )}
                                    >
                                        <div className={cn(
                                            "flex gap-1",
                                            g.color === "orange" ? "text-orange-500" :
                                                g.color === "blue" ? "text-blue-500" :
                                                    "text-green-500"
                                        )}>
                                            {Array.from({ length: g.count }).map((_, i) => (
                                                <Star key={i} className="h-5 w-5 fill-current" />
                                            ))}
                                        </div>
                                        <span className={cn(
                                            "text-base font-bold",
                                            g.color === "orange" ? "text-orange-600" :
                                                g.color === "blue" ? "text-blue-600" :
                                                    "text-green-600"
                                        )}>{g.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-3 text-left">
                            <Label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                Feedback & Comments <span className="text-red-500">*</span>
                            </Label>
                            <Textarea
                                placeholder="Lorem ipsum"
                                className="min-h-[140px] rounded-3xl bg-slate-50 dark:bg-slate-800/50 border-none p-6 resize-none text-sm font-medium"
                            />
                        </div>

                        <div className="bg-orange-50/50 dark:bg-orange-950/10 border border-orange-100 dark:border-orange-900/30 rounded-2xl p-5 flex items-start gap-4">
                            <div className="h-10 w-10 flex items-center justify-center bg-white dark:bg-slate-800 rounded-xl text-orange-500 shrink-0 shadow-sm">
                                <Info className="h-5 w-5" />
                            </div>
                            <p className="text-[11px] text-orange-600 font-bold leading-relaxed pt-1">
                                Your feedback will help the student improve their writing skills and guide them on their authorship journey.
                            </p>
                        </div>

                        <div className="flex gap-4 pt-2">
                            <Button
                                variant="outline"
                                className="flex-1 rounded-full border-slate-200 dark:border-slate-800 h-14 font-extrabold text-slate-600 dark:text-slate-400"
                                onClick={() => setIsGradeModalOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button className="flex-1 rounded-full bg-lime-500 hover:bg-lime-600 text-white font-extrabold h-14 border-none shadow-lg shadow-lime-500/20">
                                Submit Grade
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

        </DashboardWithSidebarLayout>
    );
}
