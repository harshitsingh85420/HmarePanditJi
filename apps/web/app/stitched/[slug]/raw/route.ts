import { NextResponse } from "next/server";
import { getStitchedScreenHtml } from "../../_lib/stitched-screens";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(
    _request: Request,
    { params }: { params: { slug: string } },
) {
    const html = await getStitchedScreenHtml(params.slug);

    if (!html) {
        return new NextResponse("Screen not found", {
            status: 404,
            headers: { "Content-Type": "text/plain; charset=utf-8" },
        });
    }

    return new NextResponse(html, {
        status: 200,
        headers: {
            "Content-Type": "text/html; charset=utf-8",
            "Cache-Control": "no-store",
        },
    });
}
