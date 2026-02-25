const activities = [
    {
        icon: 'person_add',
        iconBg: 'bg-blue-50 dark:bg-blue-900/20',
        iconColor: 'text-blue-600',
        title: 'New Resident Added',
        description: 'Ahmad family registered at Block C2-12',
        time: '2 hours ago',
    },
    {
        icon: 'payments',
        iconBg: 'bg-primary/10',
        iconColor: 'text-primary',
        title: 'IPL Payment Received',
        description: 'Siti Aminah paid for March & April',
        time: '4 hours ago',
    },
    {
        icon: 'engineering',
        iconBg: 'bg-orange-50 dark:bg-orange-900/20',
        iconColor: 'text-orange-600',
        title: 'Renovation Request',
        description: 'Block A5-08 submitted roof repair permit',
        time: 'Yesterday',
    },
    {
        icon: 'report_problem',
        iconBg: 'bg-purple-50 dark:bg-purple-900/20',
        iconColor: 'text-purple-600',
        title: 'New Report',
        description: 'Broken street light reported at Jl. Merpati',
        time: '2 days ago',
    },
]

function RecentActivity() {
    return (
        <div className="bg-surface-light dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-text-main dark:text-white">Recent Activity</h3>
                <a className="text-sm text-primary hover:text-primary/80 font-medium" href="#">View All</a>
            </div>
            <div className="flex-1 relative space-y-8 pl-2">
                {/* Vertical Line */}
                <div className="absolute left-[19px] top-2 bottom-2 w-px bg-slate-200 dark:bg-slate-700"></div>

                {activities.map((activity, index) => (
                    <div key={index} className="relative flex items-start gap-4">
                        <div className="relative z-10 bg-surface-light dark:bg-surface-dark">
                            <div className={`size-10 rounded-full ${activity.iconBg} flex items-center justify-center ${activity.iconColor} border border-white dark:border-surface-dark shadow-sm`}>
                                <span className="material-symbols-outlined text-[20px]">{activity.icon}</span>
                            </div>
                        </div>
                        <div className="flex-1 pt-1">
                            <p className="text-sm font-semibold text-text-main dark:text-white">{activity.title}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{activity.description}</p>
                            <span className="text-[10px] font-medium text-slate-400 mt-2 block">{activity.time}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default RecentActivity
