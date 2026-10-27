import {profile} from "~/content";
import {parseRss} from "~/rss.server";

export interface Post {
    title: string;
    brief: string;
    url: string;
    publishedAt: string;
    tags: string[];
}

export interface PullRequest {
    title: string;
    url: string;
    mergedAt: string;
    repo: string; // "owner/name"
}

// Tiny in-memory cache so a page view does not hit external APIs every time.
const TTL_MS = 60 * 60 * 1000;
const cache = new Map<string, { at: number; value: unknown }>();

async function cached<T>(key: string, load: () => Promise<T>, fallback: T): Promise<T> {
    const hit = cache.get(key);
    if (hit && Date.now() - hit.at < TTL_MS) return hit.value as T;
    try {
        const value = await load();
        cache.set(key, {at: Date.now(), value});
        return value;
    } catch (err) {
        console.error(`[data] failed to load ${key}:`, err);
        // Prefer stale data over nothing.
        return hit ? (hit.value as T) : fallback;
    }
}

// Hashnode's GraphQL API is Pro-only since 2026-05, so read the public RSS feed instead.
export function getPosts(): Promise<Post[]> {
    return cached(
        "posts",
        async () => {
            const res = await fetch(`${profile.blogUrl}/rss.xml`, {
                headers: {Accept: "application/rss+xml, application/xml, text/xml"},
                signal: AbortSignal.timeout(5000),
            });
            const type = res.headers.get("content-type") ?? "";
            if (!res.ok || !/xml/.test(type)) {
                const body = await res.text();
                throw new Error(
                    `Blog feed responded ${res.status} (${type}) at ${res.url}: ${body.slice(0, 200)}`,
                );
            }
            return parseRss(await res.text())
                .filter((item) => item.title && item.link)
                .slice(0, 10)
                .map((item) => ({
                    title: item.title,
                    brief: item.description,
                    url: item.link,
                    publishedAt: new Date(item.pubDate).toISOString(),
                    tags: item.categories,
                }));
        },
        [],
    );
}

// Public data only: the unauthenticated GitHub search API needs no token.
export function getPullRequests(): Promise<PullRequest[]> {
    return cached(
        "pull-requests",
        async () => {
            const q = `author:${profile.githubUser} type:pr is:merged -user:${profile.githubUser} merged:>=2024-01-01`;
            const url = `https://api.github.com/search/issues?q=${encodeURIComponent(q)}&sort=updated&order=desc&per_page=100`;
            const res = await fetch(url, {
                headers: {Accept: "application/vnd.github+json", "User-Agent": "my-portfolio"},
                signal: AbortSignal.timeout(5000),
            });
            if (!res.ok) throw new Error(`GitHub responded ${res.status}`);
            const json = await res.json();
            const items: any[] = json?.items ?? [];
            return items
                .map((item) => ({
                    title: item.title as string,
                    url: item.html_url as string,
                    mergedAt: (item.pull_request?.merged_at ?? item.closed_at) as string,
                    repo: (item.repository_url as string).replace("https://api.github.com/repos/", ""),
                }))
                .sort((a, b) => b.mergedAt.localeCompare(a.mergedAt));
        },
        [],
    );
}
