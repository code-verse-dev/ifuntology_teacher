import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import DashboardWithSidebarLayout from "@/components/layout/DashboardWithSidebarLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
    ChevronLeft,
    Search,
    MessageSquare,
    GraduationCap
} from "lucide-react";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { useGetFaqsQuery } from "@/redux/services/apiSlices/faqSlice";

export default function LmsFaqs() {
    const navigate = useNavigate();
    const [search, setSearch] = useState("");
    const [keyword, setKeyword] = useState("");

    useEffect(() => {
        document.title = "Learning Management System FAQs • iFuntology Teacher";
    }, []);

    useEffect(() => {
        const t = setTimeout(() => setKeyword(search), 400);
        return () => clearTimeout(t);
    }, [search]);

    const { data: faqsData } = useGetFaqsQuery({
        module: "lms",
        keyword: keyword || undefined,
    });
    const faqs = faqsData?.data?.docs ?? [];

    return (
        <DashboardWithSidebarLayout>
            <div className="mx-auto w-full  space-y-6 pb-10">

                {/* Back Link */}
                <Link
                    to="/support-tickets"
                    className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-wider"
                >
                    <ChevronLeft className="h-4 w-4" />
                    Back to Tickets
                </Link>

                <Card className="rounded-[2.5rem] border-none bg-white dark:bg-slate-900 p-8 md:p-12 shadow-sm space-y-8">
                    <div className="space-y-2 text-left">
                        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Learning Management System - FAQs</h1>
                        <p className="text-sm text-slate-500 font-medium">Everything you need to know about managing your courses and students.</p>
                    </div>

                    {/* Search bar */}
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Search FAQs..."
                            className="w-full h-12 pl-12 pr-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl ring-offset-background placeholder:text-slate-400 focus-visible:ring-lime-500 transition-all font-medium"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    {/* FAQs Accordion */}
                    <Accordion type="single" collapsible className="space-y-4">
                        {faqs.map((faq: any, i: number) => (
                            <AccordionItem
                                key={faq._id ?? i}
                                value={`item-${i}`}
                                className="border border-slate-100 dark:border-slate-800 rounded-2xl px-5 transition-all data-[state=open]:border-lime-200 dark:data-[state=open]:border-lime-900/30 overflow-hidden"
                            >
                                <AccordionTrigger className="hover:no-underline py-5 text-left text-sm font-bold text-slate-900 dark:text-white group">
                                    <div className="flex gap-4 items-center w-full">
                                        <div className="h-6 w-6 rounded-full bg-lime-500 flex items-center justify-center text-[10px] text-white shrink-0">Q</div>
                                        <span className="flex-1">{faq.question}</span>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="pb-5 pt-0">
                                    <div className="flex gap-4 items-start pl-0">
                                        <div className="h-6 w-6 rounded-full bg-orange-500 flex items-center justify-center text-[10px] text-white shrink-0 mt-0.5 font-bold">A</div>
                                        <p className="text-xs text-slate-500 font-medium leading-relaxed flex-1">
                                            {faq.answer}
                                        </p>
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>

                    {/* Still need help */}
                    <div className="bg-lime-50/50 dark:bg-lime-900/10 border border-lime-100 dark:border-lime-900/30 rounded-[2rem] p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center text-lime-500 shadow-sm">
                                <MessageSquare className="h-6 w-6" />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Still need help?</h3>
                                <p className="text-xs text-slate-500 font-medium">Can't find the answer you're looking for? Our support team is here to help you.</p>
                            </div>
                        </div>
                        <div className="flex gap-3 shrink-0">
                            <Button
                                className="rounded-full bg-lime-600 hover:bg-lime-700 text-white font-bold h-11 px-6 border-none"
                                onClick={() => navigate("/support-tickets/create")}
                            >
                                Create Support Ticket
                            </Button>
                            <Button
                                variant="outline"
                                className="rounded-full bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold h-11 px-6 shadow-none"
                            >
                                Chat with Admin
                            </Button>
                        </div>
                    </div>
                </Card>
            </div>
        </DashboardWithSidebarLayout>
    );
}
