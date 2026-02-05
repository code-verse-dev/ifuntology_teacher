import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import DashboardWithSidebarLayout from "@/components/layout/DashboardWithSidebarLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
    GraduationCap,
    ArrowLeft,
    Video,
    FileText,
    CheckCircle2,
    Lock,
    Download
} from "lucide-react";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";

export default function CourseDetails() {
    const { id } = useParams();

    useEffect(() => {
        document.title = "Course Details • iFuntology Teacher";
    }, []);

    return (
        <DashboardWithSidebarLayout>
            <div className="mx-auto w-full max-w-7xl space-y-6">
                {/* Back Link */}
                <Link to="/my-courses" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit">
                    <ArrowLeft className="h-4 w-4" />
                    Back to Courses
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Course Info & Stats */}
                    <div className="space-y-6 lg:col-span-1">

                        {/* Course Info Card */}
                        <Card className="overflow-hidden rounded-3xl border-2 border-pink-200 bg-pink-50/50 dark:bg-slate-900/50 dark:border-pink-900/20 p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-pink-500 text-white shadow-sm">
                                        <GraduationCap className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Funtology</h2>
                                        <Badge className="bg-lime-500 hover:bg-lime-600 border-none text-white font-normal px-3">Active</Badge>
                                    </div>
                                </div>
                            </div>

                            {/* Course Image Placeholder */}
                            <div className="mb-4 overflow-hidden rounded-2xl bg-pink-200 h-48 w-full relative">
                                <img
                                    src="https://images.unsplash.com/photo-1522337660859-02fbefca4702?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                                    alt="Course Thumbnail"
                                    className="h-full w-full object-cover"
                                />
                            </div>

                            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                                Funtology Fundamentals is a great course for students to start developing their skills and knowledge in cosmetology. Funtology covers the basics of hair, makeup, and skincare, and includes interactive hands-on practice on mannequins to help students develop their technique.
                            </p>
                        </Card>

                        {/* Progress Card */}
                        <Card className="rounded-3xl border-none bg-slate-900 p-6 text-white shadow-lg">
                            <h3 className="text-lg font-bold mb-4">Your Progress</h3>

                            <div className="mb-2 flex justify-between text-sm">
                                <span className="text-slate-400">Avg Student Progress</span>
                                <span className="font-bold">68%</span>
                            </div>
                            <Progress value={68} className="h-2 bg-slate-700" indicatorClassName="bg-lime-500" />

                            <div className="mt-6 space-y-3">
                                <div className="flex justify-between text-sm py-2 border-b border-slate-800">
                                    <span className="text-slate-400">Modules Completed</span>
                                    <span className="font-medium">12/18</span>
                                </div>
                                <div className="flex justify-between text-sm py-2">
                                    <span className="text-slate-400">Student Certificates Issued</span>
                                    <span className="font-medium">2</span>
                                </div>
                            </div>
                        </Card>

                        {/* Students Card */}
                        <Card className="rounded-3xl border-none bg-slate-900 p-6 text-white shadow-lg">
                            <h3 className="text-lg font-bold mb-2">Students</h3>

                            <div className="flex justify-between items-center mb-6">
                                <span className="text-slate-400 text-sm">Enrolled Students</span>
                                <span className="text-2xl font-bold">24</span>
                            </div>

                            <Button className="w-full rounded-full bg-gradient-to-r from-lime-500 to-green-600 hover:from-lime-600 hover:to-green-700 text-white font-semibold py-6 shadow-lg shadow-lime-900/20">
                                View All Students
                            </Button>
                        </Card>

                    </div>

                    {/* Right Column: Modules Accordion */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card className="rounded-[2rem] border-none bg-white/50 dark:bg-slate-900/50 p-6 md:p-8 shadow-sm">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Course Modules</h2>

                            <Accordion type="single" collapsible defaultValue="module-1" className="space-y-4">

                                {/* Module 1: Active/Expanded */}
                                <AccordionItem value="module-1" className="border-none rounded-2xl bg-white dark:bg-secondary/10 shadow-sm px-2">
                                    <AccordionTrigger className="px-4 py-4 hover:no-underline [&[data-state=open]]:pb-2 dark:text-white">
                                        <div className="flex items-center gap-4 text-left">
                                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-pink-500 text-white">
                                                <CheckCircle2 className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="font-bold text-slate-900 dark:text-white">Module 1: Introduction to Cosmetology</h3>
                                                    <Badge className="bg-lime-500 hover:bg-lime-600 text-xs font-normal border-none">Completed</Badge>
                                                </div>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Understanding the fundamentals of hair, makeup and skincare.</p>
                                                <div className="flex gap-3 mt-1 text-[10px] text-slate-400">
                                                    <span>45 mins</span>
                                                    <span>4 lessons</span>
                                                </div>
                                            </div>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="px-4 pb-4 pt-2">
                                        <div className="space-y-3 pl-[3.5rem]">

                                            {/* Lesson 1 */}
                                            <div className="flex items-center justify-between rounded-xl bg-slate-50 dark:bg-slate-800/50 p-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-500">
                                                        <Video className="h-4 w-4" />
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <div className="text-sm font-semibold text-slate-900 dark:text-white">What is cosmetology?</div>
                                                            <CheckCircle2 className="h-3 w-3 text-lime-500" />
                                                        </div>
                                                        <div className="text-xs text-slate-500 dark:text-slate-400">15 mins</div>
                                                    </div>
                                                </div>
                                                <Button size="sm" className="rounded-full bg-orange-500 hover:bg-orange-600 text-white text-xs h-8 px-4">
                                                    View Lesson
                                                </Button>
                                            </div>

                                            {/* Lesson 2 */}
                                            <div className="flex items-center justify-between rounded-xl bg-slate-50 dark:bg-slate-800/50 p-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 text-orange-500">
                                                        <FileText className="h-4 w-4" />
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <div className="text-sm font-semibold text-slate-900 dark:text-white">Tools, hygiene, safety basics</div>
                                                            <CheckCircle2 className="h-3 w-3 text-lime-500" />
                                                        </div>
                                                        <div className="text-xs text-slate-500 dark:text-slate-400">15 mins</div>
                                                    </div>
                                                </div>
                                                <Button size="sm" className="rounded-full bg-lime-600 hover:bg-lime-700 text-white text-xs h-8 px-4 gap-1">
                                                    <Download className="h-3 w-3" />
                                                    Download
                                                </Button>
                                            </div>

                                            {/* Lesson 3 */}
                                            <div className="flex items-center justify-between rounded-xl bg-slate-50 dark:bg-slate-800/50 p-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-500">
                                                        <Video className="h-4 w-4" />
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <div className="text-sm font-semibold text-slate-900 dark:text-white">Funtology Theory</div>
                                                            <CheckCircle2 className="h-3 w-3 text-lime-500" />
                                                        </div>
                                                        <div className="text-xs text-slate-500 dark:text-slate-400">15 mins</div>
                                                    </div>
                                                </div>
                                                <Button size="sm" className="rounded-full bg-orange-500 hover:bg-orange-600 text-white text-xs h-8 px-4">
                                                    View Lesson
                                                </Button>
                                            </div>

                                            {/* Quiz */}
                                            <div className="flex items-center justify-between rounded-xl bg-slate-50 dark:bg-slate-800/50 p-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-pink-100 text-pink-500">
                                                        <CheckCircle2 className="h-4 w-4" />
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <div className="text-sm font-semibold text-slate-900 dark:text-white">Module Quiz</div>
                                                            <CheckCircle2 className="h-3 w-3 text-lime-500" />
                                                        </div>
                                                        <div className="text-xs text-slate-500 dark:text-slate-400">15 mins</div>
                                                    </div>
                                                </div>
                                                <Button size="sm" className="rounded-full bg-lime-600 hover:bg-lime-700 text-white text-xs h-8 px-4">
                                                    Preview Quiz
                                                </Button>
                                            </div>

                                        </div>
                                    </AccordionContent>
                                </AccordionItem>

                                {/* Module 2 */}
                                <AccordionItem value="module-2" className="border-none rounded-2xl bg-white dark:bg-secondary/10 shadow-sm px-2">
                                    <AccordionTrigger className="px-4 py-4 hover:no-underline dark:text-white">
                                        <div className="flex items-center gap-4 text-left">
                                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-pink-500 text-white">
                                                <CheckCircle2 className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="font-bold text-slate-900 dark:text-white">Module 2: Hair Fundamentals</h3>
                                                    <Badge className="bg-lime-500 hover:bg-lime-600 text-xs font-normal border-none">Completed</Badge>
                                                </div>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Understanding the fundamentals of child psychology and development.</p>
                                                <div className="flex gap-3 mt-1 text-[10px] text-slate-400">
                                                    <span>45 mins</span>
                                                    <span>4 lessons</span>
                                                </div>
                                            </div>
                                        </div>
                                    </AccordionTrigger>
                                </AccordionItem>

                                {/* Module 3 */}
                                <AccordionItem value="module-3" className="border-none rounded-2xl bg-white dark:bg-secondary/10 shadow-sm px-2">
                                    <AccordionTrigger className="px-4 py-4 hover:no-underline dark:text-white">
                                        <div className="flex items-center gap-4 text-left">
                                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-pink-500 text-white">
                                                <CheckCircle2 className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="font-bold text-slate-900 dark:text-white">Module 3: Makeup Fundamentals</h3>
                                                    <Badge className="bg-lime-500 hover:bg-lime-600 text-xs font-normal border-none">Completed</Badge>
                                                </div>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Understanding the fundamentals of child psychology and development.</p>
                                                <div className="flex gap-3 mt-1 text-[10px] text-slate-400">
                                                    <span>45 mins</span>
                                                    <span>4 lessons</span>
                                                </div>
                                            </div>
                                        </div>
                                    </AccordionTrigger>
                                </AccordionItem>

                                {/* Module 4 */}
                                <AccordionItem value="module-4" className="border-none rounded-2xl bg-white dark:bg-secondary/10 shadow-sm px-2 opacity-80">
                                    <AccordionTrigger className="px-4 py-4 hover:no-underline dark:text-white">
                                        <div className="flex items-center gap-4 text-left">
                                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-500 text-white">
                                                <Lock className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="font-bold text-slate-900 dark:text-white">Module 4: Skincare Basics</h3>
                                                    <Badge variant="secondary" className="bg-slate-600 text-white hover:bg-slate-700 text-xs font-normal border-none">Locked For Students</Badge>
                                                </div>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Understanding the fundamentals of child psychology and development.</p>
                                                <div className="flex gap-3 mt-1 text-[10px] text-slate-400">
                                                    <span>45 mins</span>
                                                    <span>4 lessons</span>
                                                </div>
                                            </div>
                                        </div>
                                    </AccordionTrigger>
                                </AccordionItem>

                            </Accordion>
                        </Card>
                    </div>

                </div>
            </div>
        </DashboardWithSidebarLayout>
    );
}
