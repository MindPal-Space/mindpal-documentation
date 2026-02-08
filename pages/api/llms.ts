import type { NextApiRequest, NextApiResponse } from "next";
import { getAllDocPages } from "../../lib/mdx-utils";

const BASE_URL = "https://docs.mindpal.space";

const SECTIONS: { key: string; title: string }[] = [
  { key: "getting-started", title: "Getting Started" },
  { key: "agent", title: "Agent" },
  { key: "workflow", title: "Multi-Agent Workflow" },
  { key: "workspace", title: "Workspace Management" },
  { key: "guides", title: "Guides" },
];

// Known section directory prefixes
const SECTION_KEYS = new Set(SECTIONS.map((s) => s.key));

export default function handler(_req: NextApiRequest, res: NextApiResponse) {
  const pages = getAllDocPages();

  const lines: string[] = [
    "# MindPal Documentation",
    "",
    "> MindPal is an AI-powered platform for building AI agents and multi-agent workflows.",
    "",
  ];

  // Group pages by top-level section
  const grouped = new Map<string, typeof pages>();
  for (const section of SECTIONS) {
    grouped.set(section.key, []);
  }

  for (const page of pages) {
    const topLevel = page.slug.split("/")[0] || "";
    if (SECTION_KEYS.has(topLevel)) {
      grouped.get(topLevel)!.push(page);
    } else {
      // Root-level pages (index, getting-started, pricing, glossary, affiliate)
      // go into "Getting Started"
      grouped.get("getting-started")!.push(page);
    }
  }

  for (const section of SECTIONS) {
    const sectionPages = grouped.get(section.key) || [];
    if (sectionPages.length === 0) continue;

    lines.push(`## ${section.title}`);
    lines.push("");
    for (const page of sectionPages) {
      const mdPath = page.slug === "" ? "index.md" : `${page.slug}.md`;
      lines.push(`- [${page.title}](${BASE_URL}/${mdPath}): ${page.title}`);
    }
    lines.push("");
  }

  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.status(200).send(lines.join("\n") + "\n");
}
