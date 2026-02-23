import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";

const STITCH_FOLDER = path.join("ui", "stitch_hmarepanditji_landing_page");

export interface StitchedScreen {
    folderName: string;
    slug: string;
    displayName: string;
    htmlPath: string;
    imagePath: string | null;
}

let resolvedRoot: string | null = null;
let stitchedScreensCache: Promise<StitchedScreen[]> | null = null;

function slugify(value: string): string {
    return value
        .toLowerCase()
        .replace(/&/g, "and")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .replace(/-+/g, "-");
}

function toDisplayName(value: string): string {
    return value
        .replace(/_/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

function getRootCandidates(): string[] {
    const cwd = process.cwd();
    return [
        path.resolve(cwd, STITCH_FOLDER),
        path.resolve(cwd, "..", STITCH_FOLDER),
        path.resolve(cwd, "..", "..", STITCH_FOLDER),
        path.resolve(cwd, "..", "..", "..", STITCH_FOLDER),
    ];
}

function resolveStitchRoot(): string {
    if (resolvedRoot) return resolvedRoot;

    for (const candidate of getRootCandidates()) {
        if (fs.existsSync(candidate)) {
            resolvedRoot = candidate;
            return candidate;
        }
    }

    throw new Error(`Stitched UI folder not found. Looked for ${STITCH_FOLDER} from ${process.cwd()}`);
}

async function loadStitchedScreens(): Promise<StitchedScreen[]> {
    const root = resolveStitchRoot();
    const entries = await fsp.readdir(root, { withFileTypes: true });
    const usedSlugs = new Set<string>();
    const screens: StitchedScreen[] = [];

    for (const entry of entries) {
        if (!entry.isDirectory()) continue;

        const folderName = entry.name;
        const htmlPath = path.join(root, folderName, "code.html");
        if (!fs.existsSync(htmlPath)) continue;

        const imagePathCandidate = path.join(root, folderName, "screen.png");
        const imagePath = fs.existsSync(imagePathCandidate) ? imagePathCandidate : null;

        const baseSlug = slugify(folderName);
        let slug = baseSlug || "screen";
        let suffix = 2;
        while (usedSlugs.has(slug)) {
            slug = `${baseSlug}-${suffix}`;
            suffix += 1;
        }
        usedSlugs.add(slug);

        screens.push({
            folderName,
            slug,
            displayName: toDisplayName(folderName),
            htmlPath,
            imagePath,
        });
    }

    return screens.sort((a, b) => a.displayName.localeCompare(b.displayName));
}

export async function getStitchedScreens(): Promise<StitchedScreen[]> {
    if (!stitchedScreensCache) {
        stitchedScreensCache = loadStitchedScreens();
    }
    return stitchedScreensCache;
}

export async function getStitchedScreenBySlug(slug: string): Promise<StitchedScreen | null> {
    const screens = await getStitchedScreens();
    return screens.find((screen) => screen.slug === slug) ?? null;
}

export async function getStitchedScreenHtml(slug: string): Promise<string | null> {
    const screen = await getStitchedScreenBySlug(slug);
    if (!screen) return null;
    return fsp.readFile(screen.htmlPath, "utf8");
}
