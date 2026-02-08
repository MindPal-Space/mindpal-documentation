import fs from "fs";
import path from "path";

const PAGES_DIR = path.join(process.cwd(), "pages");

function findMdxFiles(dir: string): string[] {
  const results: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory() && entry.name !== "api") {
      results.push(...findMdxFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith(".mdx")) {
      results.push(fullPath);
    }
  }
  return results;
}

/**
 * Strips MDX-specific syntax from content, returning clean markdown.
 */
export function stripMdx(content: string): string {
  let lines = content.split("\n");

  // Remove import lines
  lines = lines.filter((line) => !line.match(/^\s*import\s+/));

  let result = lines.join("\n");

  // Remove multi-line JSX blocks (e.g., <iframe ...> ... </iframe>)
  result = result.replace(/<(\w+)[\s\S]*?<\/\1\s*>/g, "");

  // Remove self-closing JSX tags (e.g., <PageFooter />, <iframe ... />)
  result = result.replace(/<\w+[^>]*\/>/g, "");

  // Remove inline JSX expressions (e.g., {" "})
  result = result.replace(/\{["\s]*["\s]*\}/g, "");

  // Collapse excessive blank lines (max 2 consecutive newlines)
  result = result.replace(/\n{3,}/g, "\n\n");

  return result.trim() + "\n";
}

/**
 * Returns all doc pages by scanning all .mdx files under pages/.
 */
export function getAllDocPages(): {
  slug: string;
  title: string;
  filePath: string;
}[] {
  const mdxFiles = findMdxFiles(PAGES_DIR);
  const pages: { slug: string; title: string; filePath: string }[] = [];

  for (const fullPath of mdxFiles) {
    const filePath = path.relative(process.cwd(), fullPath);
    const relativePath = path.relative(PAGES_DIR, fullPath);
    let slug = relativePath.replace(/\.mdx$/, "");

    // index.mdx -> parent directory slug
    if (slug.endsWith("/index")) {
      slug = slug.replace(/\/index$/, "");
    }
    if (slug === "index") {
      slug = "";
    }

    // Extract title from first # heading in the file
    const content = fs.readFileSync(fullPath, "utf-8");
    const titleMatch = content.match(/^#\s+(.+)$/m);
    const title = titleMatch ? titleMatch[1] : slug.split("/").pop() || "Home";

    pages.push({ slug, title, filePath });
  }

  // Sort alphabetically by slug for consistent output
  pages.sort((a, b) => a.slug.localeCompare(b.slug));

  return pages;
}

/**
 * Returns the stripped markdown content for a given slug, or null if not found.
 */
export function getPageContent(slug: string): string | null {
  // Try exact match: pages/{slug}.mdx
  const directPath = path.join(PAGES_DIR, `${slug}.mdx`);
  if (fs.existsSync(directPath)) {
    return stripMdx(fs.readFileSync(directPath, "utf-8"));
  }

  // Try index match: pages/{slug}/index.mdx
  const indexPath = path.join(PAGES_DIR, slug, "index.mdx");
  if (fs.existsSync(indexPath)) {
    return stripMdx(fs.readFileSync(indexPath, "utf-8"));
  }

  return null;
}
