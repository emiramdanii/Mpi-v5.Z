// ═══════════════════════════════════════════════════════════════════════
// html-parser.ts — Parse uploaded HTML files into droppable page modules
//
// Each <div class="screen" id="s-xxx"> is a separate "page".
// This parser extracts each one as a COMPLETE standalone HTML document.
//
// KEY DESIGN: Screen divs can contain deeply nested child divs, so a
// simple regex cannot reliably match closing tags. Instead, we find each
// screen opening tag and then walk forward through the HTML tracking
// nesting depth to find the matching closing </div>.
// ═══════════════════════════════════════════════════════════════════════

export interface HtmlPageModule {
  id: string;
  screenId: string;
  label: string;
  htmlContent: string; // Complete standalone HTML for this screen
  icon: string;
}

// ─── Main entry point ────────────────────────────────────────────────

export function parseHtmlScreens(htmlString: string): HtmlPageModule[] {
  const modules: HtmlPageModule[] = [];

  // 1. Extract <style> block
  const styleMatch = htmlString.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
  const css = styleMatch ? styleMatch[1] : '';

  // 2. Extract all inline <script> blocks (skip external scripts with src=)
  const scriptBlocks: string[] = [];
  const scriptRegex = /<script[^>]*>([\s\S]*?)<\/script>/gi;
  let scriptMatch;
  while ((scriptMatch = scriptRegex.exec(htmlString)) !== null) {
    if (!/src\s*=/i.test(scriptMatch[0])) {
      scriptBlocks.push(scriptMatch[1]);
    }
  }
  const js = scriptBlocks.join('\n');

  // 3. Extract Google Fonts <link> tags so the standalone doc looks right
  const fontLinks: string[] = [];
  const linkRegex = /<link[^>]*href="[^"]*fonts[^"]*"[^>]*\/?>/gi;
  let linkMatch;
  while ((linkMatch = linkRegex.exec(htmlString)) !== null) {
    fontLinks.push(linkMatch[0]);
  }
  const fontLinksHtml = fontLinks.join('\n');

  // 4. Find every screen div opening tag, then extract its full balanced HTML
  const screenOpenRegex =
    /<div\s+[^>]*class="[^"]*\bscreen\b[^"]*"[^>]*\bid="(s-[^"]+)"[^>]*>/gi;
  // This regex allows class & id attributes in any order within the tag,
  // and allows additional class names (e.g. "screen active").

  let screenMatch: RegExpExecArray | null;
  while ((screenMatch = screenOpenRegex.exec(htmlString)) !== null) {
    const screenId = screenMatch[1];
    const openTagStart = screenMatch.index;
    const openTagEnd = openTagStart + screenMatch[0].length;

    // Walk forward to find the matching </div> by tracking nesting depth
    const fullDivHtml = extractBalancedDiv(htmlString, openTagStart, openTagEnd);

    if (!fullDivHtml) {
      console.warn(`[html-parser] Could not find closing tag for screen "${screenId}"`);
      continue;
    }

    // Extract inner content (between the opening and closing tags)
    const innerContent = fullDivHtml.slice(
      screenMatch[0].length,
      fullDivHtml.lastIndexOf('</div>')
    );

    const label = guessLabel(innerContent, screenId);
    const icon = guessIcon(innerContent, screenId);

    // Build a complete standalone HTML document
    const htmlContent = buildStandaloneHtml(
      fullDivHtml,
      css,
      js,
      fontLinksHtml,
      screenId
    );

    modules.push({
      id: `hpm_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      screenId,
      label,
      htmlContent,
      icon,
    });
  }

  return modules;
}

// ─── Balanced div extractor ──────────────────────────────────────────

/**
 * Starting right after a `<div ...>` opening tag (at `openTagEnd`),
 * walk forward through the HTML counting nested `<div>` / `</div>` pairs
 * until depth returns to 0.
 *
 * Returns the **full** HTML of the div (opening tag + content + closing tag),
 * or `null` if no matching close is found.
 *
 * Handles:
 *  - arbitrarily deep nesting
 *  - `<div` inside quoted attribute values (skipped)
 *  - HTML comments containing div-like text (skipped)
 *  - `<script>` / `<style>` blocks containing div-like text (skipped)
 */
function extractBalancedDiv(
  html: string,
  openTagStart: number,
  openTagEnd: number
): string | null {
  let depth = 1;
  let pos = openTagEnd;
  const len = html.length;

  while (pos < len && depth > 0) {
    const nextOpen = findNextOpeningDiv(html, pos);
    const nextClose = html.indexOf('</div', pos);

    if (nextClose === -1) break; // No more closing tags — malformed HTML

    // If there's an opening div before the next closing div, it increases depth
    if (nextOpen !== -1 && nextOpen < nextClose) {
      depth++;
      // Advance past "<div" to avoid re-matching the same tag
      pos = nextOpen + 4;
    } else {
      depth--;
      if (depth === 0) {
        // Found the matching closing tag
        const closeEnd = html.indexOf('>', nextClose) + 1;
        return html.substring(openTagStart, closeEnd);
      }
      // Advance past "</div" to continue scanning
      pos = nextClose + 6;
    }
  }

  return null; // Never balanced
}

/**
 * Find the next `<div` that is a **real** opening tag — not one inside
 * an attribute value, a comment, or a `<script>`/`<style>` block.
 */
function findNextOpeningDiv(html: string, startPos: number): number {
  let pos = startPos;
  const len = html.length;

  while (pos < len) {
    const idx = html.indexOf('<div', pos);
    if (idx === -1) return -1;

    // Check whether this <div is inside a comment <!-- ... -->
    const commentStart = html.lastIndexOf('<!--', idx);
    const commentEnd = commentStart !== -1 ? html.indexOf('-->', commentStart) : -1;
    if (commentStart !== -1 && commentEnd !== -1 && commentEnd > idx) {
      pos = commentEnd + 3;
      continue;
    }

    // Check whether this <div is inside a <script> or <style> block
    const scriptOrStyleOpen = findEnclosingScriptOrStyle(html, idx);
    if (scriptOrStyleOpen !== -1) {
      // Skip to end of that block
      const tagClose = html.indexOf('>', scriptOrStyleOpen) + 1;
      const tagName = html.slice(scriptOrStyleOpen + 1, scriptOrStyleOpen + 7).toLowerCase();
      const endTag = tagName.startsWith('script') ? '</script' : '</style';
      const blockEnd = html.toLowerCase().indexOf(endTag, tagClose);
      pos = blockEnd !== -1 ? blockEnd + endTag.length : len;
      continue;
    }

    // Verify it's an actual div tag (next char is whitespace or >)
    const nextChar = html[idx + 4];
    if (nextChar === ' ' || nextChar === '>' || nextChar === '\t' || nextChar === '\n' || nextChar === '\r') {
      return idx;
    }

    // e.g. "<divider" — not a real <div>, keep scanning
    pos = idx + 4;
  }

  return -1;
}

/**
 * If position `pos` falls inside a `<script>` or `<style>` block,
 * return the index of the opening `<script` / `<style` tag.
 * Otherwise return -1.
 */
function findEnclosingScriptOrStyle(html: string, pos: number): number {
  // Walk backwards to find the most recent <script or <style
  const lower = html.toLowerCase();
  let searchPos = pos;

  while (searchPos > 0) {
    const prevLt = lower.lastIndexOf('<', searchPos - 1);
    if (prevLt === -1) break;

    const tagText = lower.slice(prevLt, prevLt + 8);

    if (tagText.startsWith('</script') || tagText.startsWith('</style')) {
      // We're outside a script/style block — the close tag came before us
      return -1;
    }

    if (tagText.startsWith('<script') || tagText.startsWith('<style')) {
      // Found a potential opening. Check that its closing tag is after `pos`.
      const closeTag = tagText.startsWith('<script') ? '</script' : '</style';
      const closeIdx = lower.indexOf(closeTag, prevLt + 8);
      if (closeIdx !== -1 && closeIdx > pos) {
        return prevLt; // pos is inside this block
      }
      // The block closed before pos — keep walking back
      searchPos = prevLt;
      continue;
    }

    searchPos = prevLt;
  }

  return -1;
}

// ─── Standalone HTML builder ─────────────────────────────────────────

function buildStandaloneHtml(
  screenDivHtml: string,
  css: string,
  js: string,
  fontLinksHtml: string,
  screenId: string,
): string {
  // Ensure this screen gets class="screen active" so it's visible
  const activeDiv = screenDivHtml.replace(
    /(<div\s+[^>]*class="[^"]*\b)screen\b([^"]*")/i,
    '$1screen active$2'
  );
  // If "active" was already present the replace might duplicate it; clean up:
  const cleanDiv = activeDiv.replace(
    /(class="[^"]*)active\s+active([^"]*")/g,
    '$1active$2'
  );

  return `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Screen: ${screenId}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=Fredoka+One&display=swap" rel="stylesheet">
${fontLinksHtml}
<style>
${css}

/* Standalone override: fill viewport */
html, body { margin: 0; padding: 0; width: 100%; height: 100%; overflow: auto; }
.screen { min-height: 100vh !important; }
</style>
</head>
<body>
${cleanDiv}
<script>
${js}
<\/script>
</body>
</html>`;
}

// ─── Label guessing ──────────────────────────────────────────────────

function guessLabel(content: string, screenId: string): string {
  // 1. Try <h1> or <h2>
  const headingMatch = content.match(/<h[12][^>]*>([\s\S]*?)<\/h[12]>/i);
  if (headingMatch) {
    const text = stripHtml(headingMatch[1]).trim();
    if (text.length > 2 && text.length < 80) return text;
  }

  // 2. Try class="h2"
  const h2ClassMatch = content.match(
    /class="h2"[^>]*>([\s\S]*?)<\/div>/i
  );
  if (h2ClassMatch) {
    const text = stripHtml(h2ClassMatch[1]).trim();
    if (text.length > 2 && text.length < 80) return text;
  }

  // 3. Try chip-sc badge
  const chipMatch = content.match(/class="chip-sc"[^>]*>([\s\S]*?)<\/span>/i);
  if (chipMatch) {
    const text = stripHtml(chipMatch[1]).trim();
    if (text.length > 2 && text.length < 60) return text;
  }

  // 4. Fallback map for common screen IDs
  const nameMap: Record<string, string> = {
    's-cover': 'Cover',
    's-cp': 'CP / TP / ATP',
    's-tp': 'Tujuan Pembelajaran',
    's-petunjuk': 'Petunjuk',
    's-apersepsi': 'Apersepsi',
    's-diskusi1': 'Diskusi 1',
    's-diskusi2': 'Diskusi 2',
    's-materi': 'Materi',
    's-materi1': 'Materi 1',
    's-materi2': 'Materi 2',
    's-sk': 'Skenario',
    's-skenario': 'Skenario',
    's-kuis': 'Kuis',
    's-game': 'Game',
    's-hasil': 'Hasil',
    's-refleksi': 'Refleksi',
    's-review': 'Review',
    's-penutup': 'Penutup',
  };

  if (nameMap[screenId]) return nameMap[screenId];

  // 5. Derive from screenId: "s-diskusi1" → "Diskusi1"
  return screenId
    .replace(/^s-/, '')
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

// ─── Icon guessing ───────────────────────────────────────────────────

function guessIcon(content: string, screenId: string): string {
  // Unicode ranges for common emoji
  const emojiRegex =
    /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F000}-\u{1F02F}\u{1F0A0}-\u{1F0FF}\u{1F100}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{200D}\u{20E3}\u{FE0F}]/u;

  // 1. Look for emoji in cover-icon
  const coverIconMatch = content.match(/class="cover-icon"[^>]*>([^<]+)/);
  if (coverIconMatch) {
    const emoji = [...coverIconMatch[1]].find((c) => emojiRegex.test(c));
    if (emoji) return emoji;
  }

  // 2. Look for emoji in headings
  const headingMatch = content.match(/<h[12][^>]*>([\s\S]*?)<\/h[12]>/i);
  if (headingMatch) {
    const emoji = [...headingMatch[1]].find((c) => emojiRegex.test(c));
    if (emoji) return emoji;
  }

  // 3. Try any emoji in the first 2000 chars
  const firstChunk = content.slice(0, 2000);
  const emoji = [...firstChunk].find((c) => emojiRegex.test(c));
  if (emoji) return emoji;

  // 4. Fallback map by screenId
  const iconMap: Record<string, string> = {
    's-cover': '🏠',
    's-cp': '📋',
    's-tp': '🎯',
    's-petunjuk': '📌',
    's-apersepsi': '🎭',
    's-diskusi1': '💬',
    's-diskusi2': '💬',
    's-materi': '📖',
    's-materi1': '📖',
    's-materi2': '📖',
    's-sk': '🎭',
    's-skenario': '🎭',
    's-kuis': '❓',
    's-game': '🎮',
    's-hasil': '🏆',
    's-refleksi': '💭',
    's-review': '🔄',
    's-penutup': '🏁',
  };

  if (iconMap[screenId]) return iconMap[screenId];

  // 5. Pattern match on the ID itself
  const id = screenId.toLowerCase();
  if (id.includes('cover')) return '🏠';
  if (id.includes('materi')) return '📖';
  if (id.includes('kuis')) return '❓';
  if (id.includes('game')) return '🎮';
  if (id.includes('hasil')) return '🏆';
  if (id.includes('skenario')) return '🎭';
  if (id.includes('diskusi')) return '💬';
  if (id.includes('petunjuk')) return '📌';
  if (id.includes('tp') || id.includes('tujuan')) return '🎯';
  if (id.includes('refleksi')) return '💭';
  if (id.includes('penutup')) return '🏁';

  return '📄';
}

// ─── Utility: strip HTML tags ────────────────────────────────────────

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// ─── Re-export helpers ───────────────────────────────────────────────

/**
 * Extract just the screen div HTML (without the full standalone wrapper)
 * for use in slideshow export.
 */
export function extractScreenDiv(
  htmlContent: string
): { screenHtml: string; screenId: string } | null {
  const bodyMatch = htmlContent.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  if (!bodyMatch) return null;

  const bodyContent = bodyMatch[1].trim();

  const screenStart = bodyContent.search(
    /<div\s+[^>]*class="[^"]*\bscreen\b[^"]*"[^>]*>/i
  );
  if (screenStart === -1) return null;

  // Extract the screenId from the opening tag
  const idMatch = bodyContent
    .slice(screenStart, screenStart + 500)
    .match(/id="(s-[^"]+)"/i);
  if (!idMatch) return null;

  const openTagEnd = bodyContent.indexOf('>', screenStart) + 1;
  const fullDiv = extractBalancedDiv(bodyContent, screenStart, openTagEnd);
  if (!fullDiv) return null;

  // Return inner content (between opening and closing tags)
  const openTag = bodyContent.slice(screenStart, openTagEnd);
  const innerHtml = fullDiv.slice(openTag.length, fullDiv.lastIndexOf('</div>'));

  return { screenId: idMatch[1], screenHtml: innerHtml };
}

/**
 * Extract CSS from a standalone HTML module.
 */
export function extractCss(htmlContent: string): string {
  const match = htmlContent.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
  return match ? match[1] : '';
}

/**
 * Extract JS from a standalone HTML module.
 */
export function extractJs(htmlContent: string): string {
  const match = htmlContent.match(/<script[^>]*>([\s\S]*?)<\/script>/i);
  return match ? match[1] : '';
}
