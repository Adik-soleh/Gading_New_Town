const stats = [
    {
        icon: 'groups',
        iconBg: 'bg-blue-50 dark:bg-blue-900/20',
        iconColor: 'text-blue-600 dark:text-blue-400',
        label: 'Total Residents',
        value: '1,240',
        badge: { text: '12%', icon: 'trending_up', color: 'text-primary bg-primary/10' },
    },
    {
        icon: 'home_work',
        iconBg: 'bg-green-50 dark:bg-green-900/20',
        iconColor: 'text-green-600 dark:text-green-400',
        label: 'Active KK',
        value: '315',
        badge: { text: '2%', icon: 'trending_up', color: 'text-primary bg-primary/10' },
    },
    {
        icon: 'account_balance_wallet',
        iconBg: 'bg-orange-50 dark:bg-orange-900/20',
        iconColor: 'text-orange-600 dark:text-orange-400',
        label: 'Unpaid IPL',
        value: 'Rp 15.0jt',
        badge: { text: 'Action', icon: 'priority_high', color: 'text-orange-600 bg-orange-100 dark:bg-orange-900/40' },
    },
    {
        icon: 'pending_actions',
        iconBg: 'bg-purple-50 dark:bg-purple-900/20',
        iconColor: 'text-purple-600 dark:text-purple-400',
        label: 'Pending Permits',
        value: '8',
        badge: { text: 'Stable', icon: 'remove', color: 'text-slate-500 bg-slate-100 dark:bg-slate-700/50' },
    },
]

function StatsCards() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat) => (
                <div
                    key={stat.label}
                    className="bg-surface-light dark:bg-surface-dark p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow"
                >
                    <div className="flex justify-between items-start mb-4">
                        <div className={`${stat.iconBg} p-2 rounded-lg ${stat.iconColor}`}>
                            <span className="material-symbols-outlined">{stat.icon}</span>
                        </div>
                        <span className={`flex items-center text-xs font-semibold ${stat.badge.color} px-2 py-1 rounded-full`}>
                            <span className="material-symbols-outlined text-[14px] mr-1">{stat.badge.icon}</span>
                            {stat.badge.text}
                        </span>
                    </div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.label}</p>
                    <h3 className="text-2xl font-bold text-text-main dark:text-white mt-1">{stat.value}</h3>
                </div>
            ))}
        </div>
    )
}

export default StatsCards
