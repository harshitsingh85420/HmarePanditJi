export default function NotFound() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 text-center">
            <span className="text-6xl mb-6">🔍</span>
            <h2 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">Page not found</h2>
            <p className="text-lg text-gray-500 mb-8 max-w-md">
                The page you're looking for doesn't exist or has been moved.
            </p>
            <a
                href="/search"
                className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 rounded-xl font-bold transition shadow-md flex items-center gap-2"
            >
                Explore our services &rarr;
            </a>
        </div>
    );
}
