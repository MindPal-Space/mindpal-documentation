import type { NextApiRequest, NextApiResponse } from "next";
import { getAllDocPages, getPageContent } from "../../lib/mdx-utils";

export default function handler(_req: NextApiRequest, res: NextApiResponse) {
  const pages = getAllDocPages();

  const sections: string[] = [
    "# MindPal Documentation",
    "",
    "> MindPal is an AI-powered platform for building AI agents and multi-agent workflows.",
    "",
  ];

  for (const page of pages) {
    const content = getPageContent(page.slug);
    if (content) {
      sections.push("---");
      sections.push("");
      sections.push(content);
    }
  }

  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.status(200).send(sections.join("\n") + "\n");
}
