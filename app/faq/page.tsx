import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Search, HelpCircle, FileText, Tent, DollarSign, Briefcase, Wrench } from "lucide-react";
import Link from "next/link";

export default function FAQPage() {
    return (
        <div className="flex flex-col min-h-screen bg-background text-foreground">
            {/* Header / Search Hero */}
            <section className="flex flex-col items-center py-10 px-4 md:px-10 lg:px-40">
                <div className="max-w-[1024px] w-full flex flex-col gap-10">
                    <div className="flex flex-col items-center text-center gap-6 py-8">
                        <div className="flex flex-col gap-3 max-w-2xl">
                            <h1 className="text-4xl md:text-5xl font-black leading-tight tracking-tight text-primary">Frequently Asked Questions</h1>
                            <p className="text-lg text-muted-foreground">Everything you need to know about the Jianshan Summer Camp application process and experience.</p>
                        </div>
                        <div className="w-full max-w-xl relative">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                <Input
                                    className="pl-10 h-14 rounded-xl text-base bg-card shadow-sm border-input"
                                    placeholder="How can we help you? Search for keywords..."
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-8 lg:gap-16 items-start">
                        {/* Sidebar Nav */}
                        <aside className="w-full md:w-64 shrink-0 md:sticky md:top-24">
                            <nav className="flex flex-col gap-2">
                                <Link href="#application" className="flex items-center justify-between p-3 rounded-lg bg-primary text-primary-foreground font-bold text-sm shadow-md">
                                    <span>Application Process</span>
                                    <ArrowIcon />
                                </Link>
                                <Link href="#camp-life" className="flex items-center justify-between p-3 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground font-medium text-sm transition-all">
                                    <span>Camp Life & Activities</span>
                                </Link>
                                <Link href="#fees" className="flex items-center justify-between p-3 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground font-medium text-sm transition-all">
                                    <span>Fees & Scholarships</span>
                                </Link>
                                <Link href="#logistics" className="flex items-center justify-between p-3 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground font-medium text-sm transition-all">
                                    <span>Logistics</span>
                                </Link>
                                <Link href="#tech" className="flex items-center justify-between p-3 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground font-medium text-sm transition-all">
                                    <span>Technical Support</span>
                                </Link>
                            </nav>

                            <div className="hidden md:flex mt-8 flex-col gap-4 p-5 bg-muted/50 rounded-xl border border-primary/10">
                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                    <HelpCircle className="text-primary h-6 w-6" />
                                </div>
                                <div>
                                    <p className="font-bold text-primary">Still have questions?</p>
                                    <p className="text-xs text-muted-foreground mt-1">Can't find the answer you're looking for? Please chat to our friendly team.</p>
                                </div>
                                <button className="w-full py-2 px-4 bg-accent hover:bg-accent/90 text-primary-foreground text-sm font-bold rounded-lg transition-colors shadow-sm">
                                    Get in touch
                                </button>
                            </div>
                        </aside>

                        {/* Content */}
                        <div className="flex-1 flex flex-col gap-10 w-full mb-20">
                            {/* Section 1 */}
                            <section id="application" className="scroll-mt-24">
                                <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-primary">
                                    <FileText className="text-accent h-6 w-6" />
                                    Application Process
                                </h3>
                                <Accordion type="single" collapsible className="w-full flex flex-col gap-3">
                                    <FAQItem value="item-1" question="What is the deadline for submitting the application?">
                                        The application deadline for the 2024 Summer Camp is May 15th. However, we encourage early applications as spots are filled on a rolling basis. Late applications will be considered only if space permits.
                                    </FAQItem>
                                    <FAQItem value="item-2" question="Can I save my application and finish it later?">
                                        Yes, our system automatically saves your progress as you complete each section. You can log out and return to complete your application at any time before the final submission deadline.
                                    </FAQItem>
                                    <FAQItem value="item-3" question="What documents do I need to upload?">
                                        You will need to upload a recent passport-sized photo, a copy of your school ID or passport, your most recent academic transcript, and a short personal statement (PDF format preferred).
                                    </FAQItem>
                                </Accordion>
                            </section>

                            {/* Section 2 */}
                            <section id="camp-life" className="scroll-mt-24">
                                <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-primary">
                                    <Tent className="text-accent h-6 w-6" />
                                    Camp Life & Activities
                                </h3>
                                <Accordion type="single" collapsible className="w-full flex flex-col gap-3">
                                    <FAQItem value="item-4" question="What does a typical day look like?">
                                        A typical day starts with breakfast at 8:00 AM, followed by morning workshops. After lunch, we have outdoor team-building activities or electives. Evenings usually feature social events, guest speakers, or free time.
                                    </FAQItem>
                                    <FAQItem value="item-5" question="Are electronic devices allowed?">
                                        We encourage a "digital detox" environment to help students connect with nature and each other. While phones are allowed in dorms during free time, they are not permitted during workshops or scheduled activities.
                                    </FAQItem>
                                </Accordion>
                            </section>

                            {/* Section 3 */}
                            <section id="fees" className="scroll-mt-24">
                                <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-primary">
                                    <DollarSign className="text-accent h-6 w-6" />
                                    Fees & Scholarships
                                </h3>
                                <Accordion type="single" collapsible className="w-full flex flex-col gap-3">
                                    <FAQItem value="item-6" question="Is financial aid available?">
                                        Yes, we offer need-based scholarships. You can indicate your interest in financial aid within the main application form. Additional documentation regarding family income may be required.
                                    </FAQItem>
                                    <FAQItem value="item-7" question="What payment methods do you accept?">
                                        We accept major credit cards (Visa, Mastercard), PayPal, and direct bank transfers. Detailed payment instructions are provided upon acceptance into the program.
                                    </FAQItem>
                                </Accordion>
                            </section>

                            {/* Section 4 */}
                            <section id="logistics" className="scroll-mt-24">
                                <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-primary">
                                    <Briefcase className="text-accent h-6 w-6" />
                                    Logistics
                                </h3>
                                <Accordion type="single" collapsible className="w-full flex flex-col gap-3">
                                    <FAQItem value="item-8" question="What kind of accommodation is provided?">
                                        Students stay in shared dormitory-style rooms (2-4 students per room) separated by gender. Bathrooms are shared but private stalls are available. Bedding is provided.
                                    </FAQItem>
                                    <FAQItem value="item-9" question="I have dietary restrictions. Can you accommodate them?">
                                        Absolutely. Our cafeteria provides vegetarian, vegan, gluten-free, and halal options daily. Please specify your dietary needs in the health section of your application form so our kitchen staff can prepare accordingly.
                                    </FAQItem>
                                </Accordion>
                            </section>

                            {/* Section 5 */}
                            <section id="tech" className="scroll-mt-24">
                                <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-primary">
                                    <Wrench className="text-accent h-6 w-6" />
                                    Technical Support
                                </h3>
                                <Accordion type="single" collapsible className="w-full flex flex-col gap-3">
                                    <FAQItem value="item-10" question="I forgot my password. How do I reset it?">
                                        Go to the Login page and click "Forgot Password?". Enter your registered email address, and we will send you a link to reset your password. If you don't see the email, check your spam folder.
                                    </FAQItem>
                                </Accordion>
                            </section>

                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

function FAQItem({ value, question, children }: { value: string, question: string, children: React.ReactNode }) {
    return (
        <AccordionItem value={value} className="bg-card border rounded-lg px-4 md:px-5 data-[state=open]:ring-1 data-[state=open]:ring-primary/20">
            <AccordionTrigger className="hover:no-underline font-semibold text-foreground text-left py-4 md:py-5">
                {question}
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground text-sm leading-relaxed pb-5 pt-0">
                <div className="pt-2">{children}</div>
            </AccordionContent>
        </AccordionItem>
    )
}

function ArrowIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="m9 18 6-6-6-6" /></svg>
    )
}
