const months = [
    { label: 'Jan', height: 60, fill: 85 },
    { label: 'Feb', height: 65, fill: 70 },
    { label: 'Mar', height: 80, fill: 90 },
    { label: 'Apr', height: 55, fill: 60 },
    { label: 'May', height: 75, fill: 88 },
    { label: 'Jun', height: 90, fill: 95 },
    { label: 'Jul', height: 85, fill: 82 },
]

function IPLChart() {
    return (
        <div className="bg-surface-light dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 h-full">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-bold text-text-main dark:text-white">IPL Payment Overview</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Monthly breakdown for 2023</p>
                </div>
                <select className="text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 focus:ring-primary px-3 py-1.5">
                    <option>Last 6 Months</option>
                    <option>Year to Date</option>
                    <option>Last Year</option>
                </select>
            </div>

            {/* Bar Chart Visual */}
            <div className="relative h-64 w-full flex items-end gap-2 md:gap-4 px-2">
                {/* Grid Lines */}
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="border-t border-slate-100 dark:border-slate-800 w-full h-px"></div>
                    ))}
                </div>

                {/* Bars */}
                {months.map((month) => (
                    <div key={month.label} className="flex-1 flex flex-col items-center z-10 group cursor-pointer" style={{ height: '100%' }}>
                        <div className="flex-1 w-full flex items-end">
                            <div
                                className="w-full bg-primary/20 dark:bg-primary/10 rounded-t-sm relative overflow-hidden"
                                style={{ height: `${month.height}%` }}
                            >
                                <div
                                    className="absolute bottom-0 w-full bg-primary rounded-t-sm group-hover:bg-primary/90 transition-colors"
                                    style={{ height: `${month.fill}%` }}
                                ></div>
                            </div>
                        </div>
                        <span className="text-xs font-medium text-slate-500 mt-2 flex-shrink-0">{month.label}</span>
                    </div>
                ))}
            </div>

            <div className="flex items-center justify-center gap-6 mt-6 text-sm">
                <div className="flex items-center gap-2">
                    <span className="size-3 rounded-full bg-primary"></span>
                    <span className="text-slate-600 dark:text-slate-300">Paid On Time</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="size-3 rounded-full bg-primary/20"></span>
                    <span className="text-slate-600 dark:text-slate-300">Late Payment</span>
                </div>
            </div>
        </div>
    )
}

export default IPLChart
