function CommunityBanner() {
    return (
        <div className="bg-primary text-white rounded-xl p-6 md:p-8 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 shadow-lg shadow-primary/20">
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="relative z-10">
                <h3 className="text-xl font-bold mb-2">Upcoming Community Gathering</h3>
                <p className="max-w-xl text-sm md:text-base opacity-90">
                    Don&apos;t forget the monthly RT meeting scheduled for this Saturday at 19:00 WIB at the Community Hall.
                </p>
            </div>
            <div className="relative z-10 flex gap-3 w-full md:w-auto">
                <button className="bg-white/20 hover:bg-white/30 text-white border border-white/40 px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors flex-1 md:flex-none text-center backdrop-blur-sm">
                    Dismiss
                </button>
                <button className="bg-white text-primary px-5 py-2.5 rounded-lg text-sm font-bold shadow-sm hover:bg-green-50 transition-colors flex-1 md:flex-none text-center">
                    View Details
                </button>
            </div>
        </div>
    )
}

export default CommunityBanner
