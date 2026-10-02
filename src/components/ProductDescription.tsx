import { ArrowRight } from "lucide-react";

// Erkennt, ob ein Text HTML-Tags enthält (z. B. <b>, <ul>, <a ...>, <br>).
export function descriptionHasHtml(text?: string): boolean {
  return /<\/?[a-z][a-z0-9]*(\s[^>]*)?>/i.test(text || "");
}

// Entfernt HTML-Tags und liefert reinen Text (für Meta-Beschreibung, Vorschau-Karten).
export function descriptionToPlain(text?: string): string {
  return (text || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Rendert eine Produktbeschreibung:
 * - enthält sie HTML-Tags -> wird als HTML dargestellt (Admin-gepflegt, vertrauenswürdig)
 * - sonst -> Absätze + Aufzählungen (Zeilen mit • - *) mit rotem Pfeil
 */
export default function ProductDescription({ text, className = "" }: { text?: string; className?: string }) {
  const desc = text || "";

  if (descriptionHasHtml(desc)) {
    return (
      <div
        className={`product-desc-html ${className}`}
        dangerouslySetInnerHTML={{ __html: desc }}
      />
    );
  }

  const lines = desc.split("\n");
  const blocks: any[] = [];
  let bullets: string[] = [];
  const flush = (key: string) => {
    if (bullets.length) {
      blocks.push(
        <ul key={"ul-" + key} className="space-y-1.5">
          {bullets.map((b, i) => (
            <li key={i} className="flex items-start gap-2">
              <ArrowRight className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{b}</span>
            </li>
          ))}
        </ul>
      );
      bullets = [];
    }
  };
  lines.forEach((raw, idx) => {
    const line = raw.trim();
    if (!line) { flush("e" + idx); return; }
    if (/^[•\-*]\s+/.test(line)) { bullets.push(line.replace(/^[•\-*]\s+/, "")); return; }
    flush("p" + idx);
    blocks.push(<p key={"p-" + idx}>{line}</p>);
  });
  flush("end");

  return <div className={`space-y-2 ${className}`}>{blocks}</div>;
}
