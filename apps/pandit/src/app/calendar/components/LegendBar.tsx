export default function LegendBar() {
    return (
        <div className="p-3 border-t border-slate-200 bg-slate-50 flex flex-wrap gap-4 text-xs font-medium text-slate-600">
            <div className="flex items-center"><span className="w-3 h-3 rounded-sm bg-amber-200 mr-2 border border-amber-300"></span> बुकिंग</div>
            <div className="flex items-center"><span className="w-3 h-3 rounded-sm bg-red-200 mr-2 border border-red-300"></span> ब्लॉक</div>
            <div className="flex items-center"><span className="w-3 h-3 rounded-sm bg-white mr-2 border border-slate-300"></span> उपलब्ध</div>
            <div className="flex items-center"><span className="w-3 h-3 rounded-sm bg-white mr-2 ring-1 ring-inset ring-amber-500"></span> आज</div>
        </div>
    );
}
