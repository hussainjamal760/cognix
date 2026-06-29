import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { githubService } from "@/services/github";
import { cogneeService, IngestItem } from "@/services/cognee";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const projectId = params.id;

  try {
    const { owner, name, branch = "main" } = await req.json();
    if (!owner || !name) {
      return NextResponse.json(
        { error: "Owner and repository name are required" },
        { status: 400 }
      );
    }

    // 1. Verify project exists and belongs to the user
    const project = await prisma.project.findFirst({
      where: { id: projectId, userId: session.user.id },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // 2. Find or create Repository record
    let repository = await prisma.repository.findFirst({
      where: { projectId, owner, name },
    });

    if (!repository) {
      repository = await prisma.repository.create({
        data: {
          name,
          owner,
          branch,
          projectId,
        },
      });
    }

    // 3. Create active Ingestion Job record
    const job = await prisma.ingestionJob.create({
      data: {
        repositoryId: repository.id,
        status: "PROCESSING",
        progress: 10,
      },
    });

    // 4. Retrieve OAuth access token for GitHub from database
    const account = await prisma.account.findFirst({
      where: {
        userId: session.user.id,
        provider: "github",
      },
    });

    const githubToken = account?.access_token;
    if (!githubToken) {
      // For demonstration or mock setups, create simulated content if no token is linked
      console.warn("No GitHub access token found for user. Creating demo mock repository ingestion.");
      
      const mockItems: IngestItem[] = [
        {
          id: "src/app/page.tsx",
          type: "code",
          content: "export default function Page() { return <h1>Cognix App</h1>; }",
          metadata: { path: "src/app/page.tsx" }
        },
        {
          id: "src/lib/auth.ts",
          type: "code",
          content: "import NextAuth from 'next-auth'; export const { auth } = NextAuth({});",
          metadata: { path: "src/lib/auth.ts" }
        },
        {
          id: "issue-1",
          type: "issue",
          content: "Fix authentication session timeouts. We need a persistent adapter.",
          metadata: { number: 1, title: "Auth Issue" }
        }
      ];

      // Run Cognee ingest via service
      await cogneeService.ingest(projectId, mockItems);

      await prisma.ingestionJob.update({
        where: { id: job.id },
        data: {
          status: "COMPLETED",
          progress: 100,
        },
      });

      return NextResponse.json({
        message: "Demo/mock ingestion completed successfully (no github credentials linked).",
        job,
      });
    }

    // 5. Fetch repository files and metadata in the background
    // (In production, we offload this to a queue worker, but we run it inline or async here for MVP)
    (async () => {
      try {
        const { files, issues } = await githubService.fetchRepositoryContent(
          owner,
          name,
          githubToken,
          branch
        );

        await prisma.ingestionJob.update({
          where: { id: job.id },
          data: { progress: 40 },
        });

        // Map files to Cognee ingest request format
        const ingestItems: IngestItem[] = [
          ...files.map((f) => ({
            id: f.path,
            type: "code" as const,
            content: f.content,
            metadata: { path: f.path, project: projectId },
          })),
          ...issues.map((i) => ({
            id: `issue-${i.number}`,
            type: (i.isPullRequest ? "pr" : "issue") as "pr" | "issue",
            content: `Title: ${i.title}\nState: ${i.state}\nBody: ${i.body}`,
            metadata: { number: i.number, type: i.isPullRequest ? "pr" : "issue" },
          })),
        ];

        await prisma.ingestionJob.update({
          where: { id: job.id },
          data: { progress: 60 },
        });

        // 6. Ingest content to Cognee backend
        await cogneeService.ingest(projectId, ingestItems);

        // 7. Update Job as completed
        await prisma.ingestionJob.update({
          where: { id: job.id },
          data: {
            status: "COMPLETED",
            progress: 100,
          },
        });
      } catch (err: any) {
        console.error("Repository sync error: ", err);
        await prisma.ingestionJob.update({
          where: { id: job.id },
          data: {
            status: "FAILED",
            errorMessage: err.message || "Failed during ingestion processing",
          },
        });
      }
    })();

    return NextResponse.json({
      message: "Sync pipeline initiated.",
      jobId: job.id,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
