// ─────────────────────────────────────────────────────────────
// CLIENT-SIDE DOWNSCALE — because the phone is the constraint.
//
// THE PERSONA IS THE SPEC: a 45-70 year old पंडित जी on a Galaxy A12, on
// temple wifi. That phone's camera writes 12-megapixel JPEGs of 4-6 MB. The
// server accepts 8 MB, so the upload would SUCCEED — and take a minute, or
// stall, on a connection nobody chose. A feature that works on a desk and
// hangs in a temple has not shipped.
//
// SIZE LOGIC, STATED:
//   · LONG EDGE 1024px. A profile photo renders at 92px on his own screen and
//     at ~44px on a customer's search card. 1024 is already ~10x the largest
//     surface, which leaves room for a future 2x retina crop without going
//     back to him for another photo.
//   · SCALE = min(1, 1024 / longEdge) — NEVER UPSCALE. A small photo stays
//     exactly as it is; enlarging it would add bytes and invent detail.
//   · JPEG q0.82, then ONE retry at q0.6 if the result still exceeds
//     TARGET_BYTES. Two attempts, not a loop: a loop on a slow phone is a
//     freeze with no explanation, and the second attempt already lands a
//     1024px photo comfortably under the cap.
//   · The output is ALWAYS JPEG, whatever came in. HEIC/PNG/WebP all leave as
//     JPEG, which is what makes the size predictable.
//
// WHAT THIS DOES NOT DO, said plainly rather than engineered around:
//   · EXIF ORIENTATION. `createImageBitmap` honours EXIF on modern Chrome and
//     Android WebView, which is the target; on a browser that does not, a
//     photo shot in portrait could land rotated. Accepted, and named.
//   · EXIF STRIPPING IS A SIDE EFFECT, not a promise: re-encoding through a
//     canvas drops the metadata, including GPS. Good, but incidental — do not
//     cite this module as a privacy control.
//   · HEIC DECODE. If the browser cannot decode it, this throws and the caller
//     shows the failure. Android writes JPEG by default; iPhone HEIC is a
//     known tail case, not a silent one.
// ─────────────────────────────────────────────────────────────

/** The long edge we aim for. See the header for why 1024 and not 2048. */
export const MAX_EDGE = 1024;
/** Comfortably under the server's 8 MB image cap, with headroom for slow uplinks. */
export const TARGET_BYTES = 900 * 1024;

const QUALITY_FIRST = 0.82;
const QUALITY_RETRY = 0.6;

export interface DownscaleResult {
  file: File;
  /** Bytes before and after, so the caller can SAY what it did rather than imply it. */
  originalBytes: number;
  bytes: number;
  width: number;
  height: number;
  /** False when the source was already small enough to leave alone. */
  resized: boolean;
}

/** min(1, MAX_EDGE / longEdge) — pure, so the scale law is testable without a DOM. */
export function scaleFor(width: number, height: number, maxEdge: number = MAX_EDGE): number {
  const longEdge = Math.max(width, height);
  if (!Number.isFinite(longEdge) || longEdge <= 0) return 1;
  return Math.min(1, maxEdge / longEdge);
}

/** The target pixel box for a source of these dimensions. Never upscales. */
export function targetSize(
  width: number,
  height: number,
  maxEdge: number = MAX_EDGE,
): { width: number; height: number } {
  const s = scaleFor(width, height, maxEdge);
  // round, not floor: flooring a 1023.6 edge loses a pixel for no reason, and
  // Math.max(1, …) keeps a degenerate 1-pixel source from becoming 0 and
  // throwing inside drawImage.
  return { width: Math.max(1, Math.round(width * s)), height: Math.max(1, Math.round(height * s)) };
}

function canvasToBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("canvas produced no image"))),
      "image/jpeg",
      quality,
    );
  });
}

async function decode(file: File): Promise<ImageBitmap | HTMLImageElement> {
  if (typeof createImageBitmap === "function") {
    // imageOrientation:"from-image" is what applies EXIF rotation where the
    // browser supports it. Older WebViews ignore the option rather than throw.
    try {
      return await createImageBitmap(file, { imageOrientation: "from-image" } as ImageBitmapOptions);
    } catch {
      /* fall through to the <img> path — an old WebView, or an undecodable format */
    }
  }
  const url = URL.createObjectURL(file);
  try {
    return await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("this image could not be read"));
      img.src = url;
    });
  } finally {
    URL.revokeObjectURL(url);
  }
}

/**
 * Downscale a picked image to a JPEG suitable for a slow uplink.
 *
 * Throws on an undecodable file. The caller must show that failure by name —
 * a silent fallback to the original bytes would be the 6 MB upload this module
 * exists to prevent, wearing a helpful face.
 */
export async function downscaleImage(file: File, maxEdge: number = MAX_EDGE): Promise<DownscaleResult> {
  const source = await decode(file);
  const width = "width" in source ? source.width : 0;
  const height = "height" in source ? source.height : 0;
  if (!width || !height) throw new Error("this image could not be read");

  const target = targetSize(width, height, maxEdge);
  const canvas = document.createElement("canvas");
  canvas.width = target.width;
  canvas.height = target.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("this device could not process the image");
  ctx.drawImage(source as CanvasImageSource, 0, 0, target.width, target.height);
  if ("close" in source && typeof source.close === "function") source.close();

  let blob = await canvasToBlob(canvas, QUALITY_FIRST);
  // ONE retry, not a loop. See the header: a loop on a slow phone is a freeze.
  if (blob.size > TARGET_BYTES) {
    blob = await canvasToBlob(canvas, QUALITY_RETRY);
  }

  return {
    file: new File([blob], "photo.jpg", { type: "image/jpeg", lastModified: Date.now() }),
    originalBytes: file.size,
    bytes: blob.size,
    width: target.width,
    height: target.height,
    resized: target.width !== width || target.height !== height,
  };
}
