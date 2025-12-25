import { DBApplication } from "@/lib/db-service";
import { Users, FileText, CheckCircle, Clock, CreditCard } from "lucide-react";

interface DashboardStatsProps {
    applications: DBApplication[];
}

export function DashboardStats({ applications }: DashboardStatsProps) {
    const total = applications.length;

    // "Submitted" - anyone who is not in draft mode
    const submitted = applications.filter(app => app.status !== 'draft').length;

    // "Pending Review" - status is 'submitted' or 'under_review'
    const pendingReview = applications.filter(app =>
        app.status === 'submitted' || app.status === 'under_review'
    ).length;

    // "Enrolled"
    const enrolled = applications.filter(app => app.status === 'enrolled').length;

    // "Paid" - Placeholder
    const paid = 0;

    const stats = [
        {
            title: "Registered",
            value: total,
            icon: Users,
            description: "Total registered users",
            color: 'bg-blue-500',
            lightColor: 'bg-blue-50',
            textColor: 'text-blue-600'
        },
        {
            title: "Submitted",
            value: submitted,
            icon: FileText,
            description: "Completed form submission",
            color: 'bg-purple-500',
            lightColor: 'bg-purple-50',
            textColor: 'text-purple-600'
        },
        {
            title: "Reviewing",
            value: pendingReview,
            icon: Clock,
            description: "Needs attention",
            color: 'bg-amber-500',
            lightColor: 'bg-amber-50',
            textColor: 'text-amber-600'
        },
        {
            title: "Enrolled",
            value: enrolled,
            icon: CheckCircle,
            description: "Students joined",
            color: 'bg-green-500',
            lightColor: 'bg-green-50',
            textColor: 'text-green-600'
        },
        {
            title: "Tuition Paid",
            value: paid,
            icon: CreditCard,
            description: "Payment confirmed",
            color: 'bg-indigo-500',
            lightColor: 'bg-indigo-50',
            textColor: 'text-indigo-600'
        },
    ];

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                    <div
                        key={index}
                        className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-slate-700">{stat.title}</h3>
                            <div className={`${stat.lightColor} ${stat.textColor} p-2.5 rounded-full group-hover:scale-110 transition-transform duration-300`}>
                                <Icon className="w-5 h-5" />
                            </div>
                        </div>
                        <div className="mb-1">
                            <div className="text-3xl font-bold text-slate-900">{stat.value}</div>
                        </div>
                        <p className="text-slate-500 text-xs">{stat.description}</p>
                    </div>
                );
            })}
        </div>
    );
}
