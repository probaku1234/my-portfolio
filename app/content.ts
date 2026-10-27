// All site copy lives here so it is easy to edit without touching components.

export const profile = {
    name: "Yun Seob Lee",
    title: "AI Engineer",
    tagline:
        "I build LLM agents and RAG systems for internal business tools, and write about what broke along the way.",
    about: [
        "I'm an AI engineer at AtwoM, where I build internal LLM tools: a RAG-based Q&A bot over company regulations, and an agent that files leave requests from a single chat message. Before that, I spent two years as a full-stack engineer at slync.io, working on databases and backend services. I studied computer science at Stony Brook.",
        "I like problems where the obvious first approach fails and the real fix comes from understanding why.",
    ],
    links: [
        {label: "GitHub", href: "https://github.com/probaku1234", icon: "github" as const},
        {label: "LinkedIn", href: "https://www.linkedin.com/in/yunseoblee/", icon: "linkedin" as const},
        {label: "Email", href: "mailto:fhzotxldj@gmail.com", icon: "email" as const},
        // Add a résumé later by putting a PDF in /public and a link here, e.g.
        // (a text-only link like Résumé would need its own rendering; see home.tsx)
    ],
    blogUrl: "https://bakus-tech-blog.hashnode.dev",
    githubUser: "probaku1234",
};

export interface Job {
    role: string;
    company: string;
    period: string;
    bullets: string[];
    tags: string[];
}

export const experience: Job[] = [
    {
        role: "AI Engineer",
        company: "AtwoM",
        period: "Sep 2024 – Present",
        bullets: [
            "Built a RAG Q&A bot over internal regulations with LangChain and LangGraph. Fixed-size chunking split clauses mid-sentence; structure-based chunking lost context. Settled on parent-child chunking: retrieve small chunks, answer with the parent section.",
            "Fixed follow-ups like \"tell me more\" (no subject, so no relevant hits) with query rewriting from chat history, and filtered noisy retrieval with an LLM relevance-grading step.",
            "Moved model serving from Ollama to vLLM when missing batch support became the bottleneck as traffic grew.",
            "Built an admin-automation agent that routes by intent across multiple agents and logs why each route was chosen, which made debugging far easier than a single agent with many tools.",
            "Turned natural-language requests into structured calls to legacy groupware and leave APIs using tool calling and Pydantic structured output. Injected live calendar context so \"next Friday\" resolves correctly.",
        ],
        tags: ["Python", "LangChain", "LangGraph", "vLLM", "Pydantic"],
    },
    {
        role: "Software Engineer",
        company: "slync.io",
        period: "Sep 2020 – Aug 2022",
        bullets: [
            "Worked on a team migrating from PostgreSQL to MongoDB. Split the DB connector into Postgres and Mongo implementations so both could run side by side, and wrote CRUD, unit and integration tests. Roughly 50% performance improvement.",
            "Added JSON-index query support in PostgreSQL and wrote k6 load tests to measure it.",
        ],
        tags: ["Node.js", "TypeScript", "MongoDB", "PostgreSQL", "k6"],
    },
];

export interface Project {
    name: string;
    description: string;
    href?: string;
    tags: string[];
}

// Empty for now: the Projects section only renders when this has entries.
export const projects: Project[] = [];
