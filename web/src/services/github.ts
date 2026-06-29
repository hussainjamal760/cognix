export interface GitHubFile {
  path: string;
  content: string;
}

export interface GitHubIssue {
  id: string;
  number: number;
  title: string;
  body: string;
  state: string;
  isPullRequest: boolean;
}

const IGNORE_EXTENSIONS = [
  ".png", ".jpg", ".jpeg", ".gif", ".webp", ".ico", ".pdf", ".zip", ".tar", ".gz",
  ".mp4", ".mp3", ".wav", ".woff", ".woff2", ".ttf", ".eot", ".svg"
];

const IGNORE_FILES = [
  "package-lock.json", "yarn.lock", "pnpm-lock.yaml", "bun.lockb",
  "tsconfig.json", "next.config.js", "tailwind.config.js", "postcss.config.js",
  "eslint.config.js", "prisma/schema.prisma"
];

export const githubService = {
  async fetchRepositoryContent(owner: string, repo: string, token: string, branch = "main") {
    const headers = {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github.v3+json",
    };

    // 1. Fetch git tree recursively
    const treeResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`,
      { headers }
    );

    if (!treeResponse.ok) {
      throw new Error(`Failed to fetch repository tree: ${treeResponse.statusText}`);
    }

    const treeData = await treeResponse.json();
    const files: GitHubFile[] = [];

    // Filter and fetch content for text/code files
    for (const item of treeData.tree || []) {
      if (item.type === "blob") {
        const isIgnoredDir = item.path.includes("node_modules/") || 
                            item.path.startsWith(".git/") || 
                            item.path.includes(".next/");
        const isIgnoredExt = IGNORE_EXTENSIONS.some((ext) => item.path.toLowerCase().endsWith(ext));
        const isIgnoredFile = IGNORE_FILES.includes(item.path.split("/").pop() || "");

        if (!isIgnoredDir && !isIgnoredExt && !isIgnoredFile) {
          // Fetch raw file contents (GitHub limit is typically 1MB for API fetch)
          const fileResponse = await fetch(
            `https://api.github.com/repos/${owner}/${repo}/contents/${item.path}?ref=${branch}`,
            { headers }
          );

          if (fileResponse.ok) {
            const fileData = await fileResponse.json();
            if (fileData.encoding === "base64") {
              const content = Buffer.from(fileData.content, "base64").toString("utf-8");
              files.push({ path: item.path, content });
            }
          }
        }
      }
    }

    // 2. Fetch issues and PRs (GitHub returns both in issues endpoint)
    const issuesResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/issues?state=all&per_page=100`,
      { headers }
    );

    const issues: GitHubIssue[] = [];
    if (issuesResponse.ok) {
      const issuesData = await issuesResponse.json();
      for (const item of issuesData) {
        issues.push({
          id: String(item.id),
          number: item.number,
          title: item.title,
          body: item.body || "",
          state: item.state,
          isPullRequest: !!item.pull_request,
        });
      }
    }

    return { files, issues };
  },
};
