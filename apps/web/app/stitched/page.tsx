import Link from "next/link";
import { getStitchedScreens } from "./_lib/stitched-screens";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function StitchedScreensIndexPage() {
    const screens = await getStitchedScreens();

    return (
        <section className="mx-auto w-full max-w-7xl px-4 py-8 md:px-8">
            <div className="mb-8 rounded-2xl border border-orange-200 bg-orange-50 p-6">
                <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">Stitched UI Screens</h1>
                <p className="mt-2 text-sm text-gray-700 md:text-base">
                    {screens.length} screens loaded from <code>ui/stitch_hmarepanditji_landing_page</code>.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {screens.map((screen) => (
                    <article
                        key={screen.slug}
                        className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
                    >
                        <h2 className="line-clamp-2 text-base font-semibold text-gray-900">{screen.displayName}</h2>
                        <p className="mt-1 break-all text-xs text-gray-500">{screen.folderName}</p>
                        <div className="mt-4 flex items-center gap-3">
                            <Link
                                href={`/stitched/${screen.slug}`}
                                className="rounded-md bg-orange-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-orange-700"
                            >
                                Open Preview
                            </Link>
                            <Link
                                href={`/stitched/${screen.slug}/raw`}
                                target="_blank"
                                rel="noreferrer"
                                className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                            >
                                Open Raw
                            </Link>
                        </div>
                    </article>
                ))}
            </div>
        </section>
    );
}
