import zlib from "zlib";

/**
 * Pure, Zero-Dependency PDF Text Stream Extractor
 * Decompresses all FlateDecode streams using Node.js built-in zlib
 * and extracts standard text operators ((...) Tj, [...] TJ).
 * Guarantees 100% serverless compatibility without external C++ bindings.
 */
export function extractTextFromPDFBuffer(buffer: Buffer): string {
  if (!buffer || buffer.length === 0) return "";

  const extractedChunks: string[] = [];
  let pos = 0;

  while (pos < buffer.length) {
    const streamStart = buffer.indexOf("stream", pos);
    if (streamStart === -1) break;

    // Skip past "stream\r\n" or "stream\n"
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

      // 1. Extract Tj literal text strings: (Hello World) Tj
      const tjRegex = /\(([^()]*)\)\s*(?:Tj|'|")/g;
      let match: RegExpExecArray | null;
      while ((match = tjRegex.exec(streamStr)) !== null) {
        if (match[1] && match[1].trim()) {
          extractedChunks.push(cleanPdfToken(match[1]));
        }
      }

      // 2. Extract TJ array text chunks: [(Hello) 20 (World)] TJ
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
    }

    pos = streamEnd + 9;
  }

  // If stream extraction retrieved text, join and return
  const fullText = extractedChunks.join(" ").trim();
  if (fullText.length >= 40) {
    return fullText.replace(/\s{2,}/g, " ");
  }

  // Fallback: UTF-8 scan for plain ASCII / Latin text
  const fallbackStr = buffer.toString("utf-8");
  return fallbackStr
    .replace(/[^\x20-\x7E\t\n\r]/g, " ")
    .replace(/(?:stream[\s\S]*?endstream|xref[\s\S]*?trailer|obj[\s\S]*?endobj)/gi, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

/**
 * Cleans PDF string escape sequences (e.g. \n, \r, \t, \(, \))
 */
function cleanPdfToken(token: string): string {
  return token
    .replace(/\\([()\\])/g, "$1")
    .replace(/\\n/g, "\n")
    .replace(/\\r/g, "\r")
    .replace(/\\t/g, "\t")
    .replace(/\\([0-7]{1,3})/g, (_, octal) => String.fromCharCode(parseInt(octal, 8)));
}
