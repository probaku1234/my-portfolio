import type {Route} from "./+types/home";
import {experience, profile, projects} from "~/content";
import {SocialIcon} from "~/components/SocialIcon";
import {getPosts, getPullRequests, type PullRequest} from "~/data.server";

export function meta({}: Route.MetaArgs) {
    return [
        {title: `${profile.name} — ${profile.title}`},
        {name: "description", content: profile.tagline},
        {property: "og:title", content: `${profile.name} — ${profile.title}`},
        {property: "og:description", content: profile.tagline},
    ];
}

// Let the CDN cache the page so external APIs are not hit on every visit.
export function headers() {
    return {"Cache-Control": "s-maxage=3600, stale-while-revalidate=86400"};
}

export async function loader() {
    const [posts, pullRequests] = await Promise.all([getPosts(), getPullRequests()]);
    return {posts, pullRequests};
}

const monthYear = new Intl.DateTimeFormat("en-US", {month: "short", year: "numeric", timeZone: "UTC"});
const formatDate = (iso: string) => monthYear.format(new Date(iso));

const linkClass =
    "text-accent underline decoration-accent/40 underline-offset-4 hover:decoration-accent";

function groupByRepo(prs: PullRequest[]) {
    const groups = new Map<string, PullRequest[]>();
    for (const pr of prs) groups.set(pr.repo, [...(groups.get(pr.repo) ?? []), pr]);
    return [...groups.entries()];
}

function Tags({tags}: { tags: string[] }) {
    return (
        <ul className="mt-3 flex flex-wrap gap-x-3 gap-y-1 font-mono text-xs text-muted">
            {tags.map((tag) => (
                <li key={tag}>{tag}</li>
            ))}
        </ul>
    );
}

function Section({id, title, children}: { id: string; title: string; children: React.ReactNode }) {
    return (
        <section aria-labelledby={id} className="mt-16 border-t border-rule pt-8">
            <h2 id={id} className="font-serif text-2xl font-medium">
                {title}
            </h2>
            <div className="mt-6">{children}</div>
        </section>
    );
}

export default function Home({loaderData}: Route.ComponentProps) {
    const {posts, pullRequests} = loaderData;
    const prGroups = groupByRepo(pullRequests);

    return (
        <>
            <a href="#main" className="skip-link">
                Skip to content
            </a>
            <div className="mx-auto max-w-2xl px-6 py-16 sm:py-24">
                <header>
                    <h1 className="font-serif text-4xl font-medium tracking-tight sm:text-5xl">{profile.name}</h1>
                    <p className="mt-2 text-muted">{profile.title}</p>
                    <p className="mt-6 max-w-xl text-lg">{profile.tagline}</p>
                    <ul className="mt-6 flex items-center gap-5">
                        {profile.links.map((link) => (
                            <li key={link.label}>
                                <a
                                    href={link.href}
                                    aria-label={link.label}
                                    title={link.label}
                                    className="inline-flex text-muted transition-colors hover:text-accent"
                                >
                                    <SocialIcon name={link.icon}/>
                                </a>
                            </li>
                        ))}
                    </ul>
                </header>

                <main id="main">
                    <Section id="about" title="About">
                        <div className="space-y-4">
                            {profile.about.map((paragraph) => (
                                <p key={paragraph}>{paragraph}</p>
                            ))}
                        </div>
                    </Section>

                    <Section id="experience" title="Experience">
                        <ol className="space-y-10">
                            {experience.map((job) => (
                                <li key={`${job.company}-${job.period}`}>
                                    <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between">
                                        <h3 className="font-medium">
                                            {job.role} · {job.company}
                                        </h3>
                                        <p className="font-mono text-xs text-muted">{job.period}</p>
                                    </div>
                                    <ul className="mt-3 list-disc space-y-2 pl-5 marker:text-muted">
                                        {job.bullets.map((bullet) => (
                                            <li key={bullet}>{bullet}</li>
                                        ))}
                                    </ul>
                                    <Tags tags={job.tags}/>
                                </li>
                            ))}
                        </ol>
                    </Section>

                    {projects.length > 0 && (
                        <Section id="projects" title="Projects">
                            <ul className="space-y-8">
                                {projects.map((project) => (
                                    <li key={project.name}>
                                        <h3 className="font-medium">
                                            {project.href ? (
                                                <a href={project.href} className={linkClass}>
                                                    {project.name}
                                                </a>
                                            ) : (
                                                project.name
                                            )}
                                        </h3>
                                        <p className="mt-2">{project.description}</p>
                                        <Tags tags={project.tags}/>
                                    </li>
                                ))}
                            </ul>
                        </Section>
                    )}

                    {prGroups.length > 0 && (
                        <Section id="open-source" title="Open Source">
                            <ul className="space-y-6">
                                {prGroups.map(([repo, prs]) => (
                                    <li key={repo}>
                                        <h3 className="font-medium">
                                            <a href={`https://github.com/${repo}`} className={linkClass}>
                                                {repo}
                                            </a>
                                        </h3>
                                        <ul className="mt-2 space-y-1">
                                            {prs.map((pr) => (
                                                <li key={pr.url} className="flex gap-4">
                                                    <time
                                                        dateTime={pr.mergedAt}
                                                        className="w-20 shrink-0 font-mono text-xs leading-6 text-muted"
                                                    >
                                                        {formatDate(pr.mergedAt)}
                                                    </time>
                                                    <a href={pr.url} className={linkClass}>
                                                        {pr.title}
                                                    </a>
                                                </li>
                                            ))}
                                        </ul>
                                    </li>
                                ))}
                            </ul>
                        </Section>
                    )}

                    {posts.length > 0 && (
                        <Section id="writing" title="Writing">
                            <ul className="space-y-6">
                                {posts.map((post) => (
                                    <li key={post.url}>
                                        <h3 className="font-medium">
                                            <a href={post.url} className={linkClass}>
                                                {post.title}
                                            </a>
                                        </h3>
                                        <p className="font-mono text-xs text-muted">{formatDate(post.publishedAt)}</p>
                                        <p className="mt-2 line-clamp-2">{post.brief}</p>
                                    </li>
                                ))}
                            </ul>
                            <p className="mt-6">
                                <a href={profile.blogUrl} className={linkClass}>
                                    All posts on Hashnode
                                </a>
                            </p>
                        </Section>
                    )}
                </main>

                <footer className="mt-16 border-t border-rule pt-6 text-sm text-muted">
                    © {new Date().getFullYear()} {profile.name}
                </footer>
            </div>
        </>
    );
}
