import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const repoId = searchParams.get("repoId");

  if (!repoId) {
    return NextResponse.json({ error: "Repository ID is required" }, { status: 400 });
  }

  try {
    // Fetch the most recent ingestion job for this repository
    const job = await prisma.ingestionJob.findFirst({
      where: { repositoryId: repoId },
      orderBy: { createdAt: "desc" },
    });

    if (!job) {
      return NextResponse.json({ status: null, progress: 0 });
    }

    return NextResponse.json({
      status: job.status,
      progress: job.progress,
      errorMessage: job.errorMessage,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
