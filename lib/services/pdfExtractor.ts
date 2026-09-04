import zlib from "zlib";
import { PDFParse } from "pdf-parse";

/**
 * Checks if a string looks predominantly like raw PDF syntax / stream dictionary markers
 * rather than human-readable CV / resume text.
 */
export function isRawPdfSyntax(text: string): boolean {
  if (!text || text.trim().length === 0) return true;
  const sample = text.slice(0, 1500).toLowerCase();

  const pdfMarkers = [
    "%pdf-",
    "/catalog",
    "/pages",
    "/type /page",
    "/filter /flatedecode",
    "/font",
    "/length",
    "endobj",
    "startxref",
    "trailer",
    "xref",
  ];

  let matches = 0;
  for (const marker of pdfMarkers) {
    if (sample.includes(marker)) matches++;
  }

  // If 3 or more PDF dictionary markers appear in the first 1500 chars, it's raw PDF code
  return matches >= 3;
}

/**
 * Robust Multi-Engine PDF Text Extractor
 * 1. Primary: Uses pdf-parse v2 (Mozilla PDF.js engine) to decompress Object Streams (/ObjStm),
 *    resolve /ToUnicode CMaps, TrueType/CID fonts, and multi-page text layouts.
 * 2. Secondary: Deep flate-stream parser for literal strings, array TJ tokens, and hex-encoded font glyphs.
 * 3. Sanitizes and strips raw PDF binary debris to ensure only real resume content reaches AI tools.
 */
export async function extractTextFromPDFBuffer(buffer: Buffer): Promise<string> {
  if (!buffer || buffer.length === 0) return "";

  // 1. Primary Engine: PDFParse (pdf-parse v2)
  try {
    const parser = new PDFParse({ data: buffer });
    try {
      const parsed = await parser.getText();
      if (parsed && typeof parsed.text === "string") {
        // Strip default page joiner comments like '-- 1 of 2 --'
        const rawText = parsed.text.replace(/--\s*\d+\s*of\s*\d+\s*--/gi, " ");
        const cleaned = sanitizeExtractedText(rawText);
        if (cleaned.length >= 25 && !isRawPdfSyntax(cleaned)) {
          return cleaned;
        }
      }
    } finally {
      try {
        await parser.destroy();
      } catch {
        // Ignore destroy error
      }
    }
  } catch (err) {
    console.warn("[PDFExtractor] Primary pdf-parse failed, attempting stream fallback:", err);
  }

  // 2. Secondary Engine: Decompress Flate streams and extract Tj / TJ operators
  const streamText = extractFromPdfStreams(buffer);
  if (streamText && streamText.length >= 25 && !isRawPdfSyntax(streamText)) {
    return sanitizeExtractedText(streamText);
  }

  // 3. Third Fallback: Extract continuous readable character tokens (excluding PDF structure syntax)
  const readableText = extractReadableWords(buffer);
  if (readableText && readableText.length >= 25 && !isRawPdfSyntax(readableText)) {
    return sanitizeExtractedText(readableText);
  }

  return "";
}

/**
 * Synchronous Fallback for pure stream extraction
 */
export function extractTextFromPDFBufferSync(buffer: Buffer): string {
  if (!buffer || buffer.length === 0) return "";
  const streamText = extractFromPdfStreams(buffer);
  if (streamText && streamText.length >= 25 && !isRawPdfSyntax(streamText)) {
    return sanitizeExtractedText(streamText);
  }
  const fallback = extractReadableWords(buffer);
  return sanitizeExtractedText(fallback);
}

/**
 * Internal stream decompressor for FlateDecode chunks
 */
function extractFromPdfStreams(buffer: Buffer): string {
  const extractedChunks: string[] = [];
  let pos = 0;

  while (pos < buffer.length) {
    const streamStart = buffer.indexOf("stream", pos);
    if (streamStart === -1) break;

    let dataStart = streamStart + 6;
    if (buffer[dataStart] === 0x0d) dataStart++;
    if (buffer[dataStart] === 0x0a) dataStart++;

    const streamEnd = buffer.indexOf("endstream", dataStart);
    if (streamEnd === -1) break;

    const streamData = buffer.subarray(dataStart, streamEnd);

    let decompressed: Buffer | null = null;
    try {
      decompressed = zlib.inflateSync(streamData);
    } catch {
      try {
        decompressed = zlib.inflateRawSync(streamData);
      } catch {
        decompressed = streamData;
      }
    }

    if (decompressed) {
      const streamStr = decompressed.toString("latin1");

      // 1. Literal text tokens: (Hello World) Tj
      const tjRegex = /\(([^()]*)\)\s*(?:Tj|'|")/g;
      let match: RegExpExecArray | null;
      while ((match = tjRegex.exec(streamStr)) !== null) {
        if (match[1] && match[1].trim()) {
          const cleaned = cleanPdfToken(match[1]);
          if (cleaned.trim()) extractedChunks.push(cleaned);
        }
      }

      // 2. Array text tokens: [(Hello) 20 (World)] TJ
      const arrayTjRegex = /\[(.*?)\]\s*TJ/g;
      let arrayMatch: RegExpExecArray | null;
      while ((arrayMatch = arrayTjRegex.exec(streamStr)) !== null) {
        const innerArray = arrayMatch[1];
        const innerStrings = innerArray.match(/\(([^()]*)\)/g);
        if (innerStrings && innerStrings.length > 0) {
          const combined = innerStrings
            .map((s) => cleanPdfToken(s.slice(1, -1)))
            .join("");
          if (combined.trim()) {
            extractedChunks.push(combined);
          }
        }
      }

      // 3. Hex-encoded strings: <00480065006C006C006F> Tj
      const hexTjRegex = /<([0-9a-fA-F\s]+)>\s*(?:Tj|'|"|TJ)/g;
      let hexMatch: RegExpExecArray | null;
      while ((hexMatch = hexTjRegex.exec(streamStr)) !== null) {
        const decoded = decodeHexPdfString(hexMatch[1]);
        if (decoded && decoded.trim()) {
          extractedChunks.push(decoded.trim());
        }
      }
    }

    pos = streamEnd + 9;
  }

  return extractedChunks.join(" ").trim();
}

/**
 * Decodes hex string from PDF font operator
 */
function decodeHexPdfString(rawHex: string): string {
  const hex = rawHex.replace(/\s+/g, "");
  if (hex.length < 2) return "";
  const paddedHex = hex.length % 2 !== 0 ? hex + "0" : hex;
  try {
    const buf = Buffer.from(paddedHex, "hex");
    // Check for UTF-16BE byte order mark or 0x00 prefix typical of 2-byte font glyphs
    if (buf.length >= 2 && ((buf[0] === 0xfe && buf[1] === 0xff) || (buf[0] === 0x00 && buf[1] !== 0x00))) {
      return buf.swap16().toString("utf16le");
    }
    return buf.toString("latin1");
  } catch {
    return "";
  }
}

/**
 * Extracts readable sequences of words from buffer, skipping PDF syntax tokens
 */
function extractReadableWords(buffer: Buffer): string {
  const raw = buffer.toString("utf-8");
  // Remove objects, streams, xrefs, and binary blobs
  const scrubbed = raw
    .replace(/stream[\s\S]*?endstream/gi, " ")
    .replace(/<<[\s\S]*?>>/g, " ")
    .replace(/\b\d+\s+\d+\s+obj\b[\s\S]*?\bendobj\b/gi, " ")
    .replace(/\bxref[\s\S]*?%%EOF/gi, " ");

  const words = scrubbed.match(/[A-Za-z0-9+#.-]{2,}/g) || [];
  const validWords = words.filter((w) => {
    const lower = w.toLowerCase();
    return (
      !lower.startsWith("/") &&
      !["obj", "endobj", "xref", "trailer", "startxref", "flatedecode"].includes(lower)
    );
  });

  return validWords.join(" ").trim();
}

/**
 * Cleans PDF string escape sequences and normalizes punctuation
 */
function cleanPdfToken(token: string): string {
  return token
    .replace(/\\([()\\])/g, "$1")
    .replace(/\\n/g, "\n")
    .replace(/\\r/g, "\r")
    .replace(/\\t/g, "\t")
    .replace(/\\([0-7]{1,3})/g, (_, octal) => String.fromCharCode(parseInt(octal, 8)));
}

/**
 * Sanitizes extracted text: converts smart characters, removes null bytes, normalizes whitespace
 */
export function sanitizeExtractedText(text: string): string {
  return text
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\uFFFD]/g, " ")
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/[\u2022\u2023\u25E6\u2043\u2219]/g, " • ")
    .replace(/\r\n|\r/g, "\n")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
