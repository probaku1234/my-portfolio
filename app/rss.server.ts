// Minimal RSS 2.0 parser (no dependencies). Enough for a blog feed.

export interface FeedItem {
    title: string;
    link: string;
    description: string;
    pubDate: string;
    categories: string[];
}

const ENTITIES: Record<string, string> = {
    "&amp;": "&",
    "&lt;": "<",
    "&gt;": ">",
    "&quot;": '"',
    "&#39;": "'",
    "&#x27;": "'",
    "&apos;": "'",
};

function unwrap(raw: string): string {
    const cdata = raw.match(/^\s*<!\[CDATA\[([\s\S]*?)\]\]>\s*$/);
    if (cdata) return cdata[1].trim();
    return raw.replace(/&(amp|lt|gt|quot|apos|#39|#x27);/g, (m) => ENTITIES[m] ?? m).trim();
}

function tagText(xml: string, tag: string): string {
    const m = xml.match(new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)</${tag}>`));
    return m ? unwrap(m[1]) : "";
}

const stripHtml = (s: string) => s.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();

export function parseRss(xml: string): FeedItem[] {
    const items = xml.match(/<item[\s>][\s\S]*?<\/item>/g) ?? [];
    return items.map((item) => ({
        title: tagText(item, "title"),
        link: tagText(item, "link"),
        description: stripHtml(tagText(item, "description")),
        pubDate: tagText(item, "pubDate"),
        categories: [...item.matchAll(/<category(?:\s[^>]*)?>([\s\S]*?)<\/category>/g)].map((m) => unwrap(m[1])),
    }));
}
