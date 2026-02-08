import type { NextApiRequest, NextApiResponse } from "next";
import { getPageContent } from "../../../lib/mdx-utils";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { slug } = req.query;

  if (!slug || !Array.isArray(slug)) {
    return res.status(400).send("Bad request");
  }

  const content = getPageContent(slug.join("/"));

  if (!content) {
    return res.status(404).send("Not found");
  }

  res.setHeader("Content-Type", "text/markdown; charset=utf-8");
  res.status(200).send(content);
}
