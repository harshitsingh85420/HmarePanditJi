export function DocumentCard({ title, icon, actionText, onAction, description }: any) {
    return (
        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl bg-white hover:border-orange-200 transition-colors shadow-sm">
            <div className="flex items-center gap-4">
                <div className="text-3xl bg-orange-50/50 p-3 rounded-xl">{icon}</div>
                <div>
                    <h4 className="font-bold text-gray-900">{title}</h4>
                    {description && <p className="text-sm text-gray-500 mt-0.5">{description}</p>}
                </div>
            </div>
            <button onClick={onAction} className="px-5 py-2 text-sm font-bold text-orange-600 bg-orange-50 rounded-lg hover:bg-orange-100 transition whitespace-nowrap">
                {actionText}
            </button>
        </div>
    );
}
