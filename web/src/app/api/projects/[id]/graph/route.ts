import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { cogneeService } from "@/services/cognee";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const projectId = params.id;

  try {
    // Verify project belongs to user
    const project = await prisma.project.findFirst({
      where: { id: projectId, userId: session.user.id },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Retrieve graph representation from Cognee service
    const graphData = await cogneeService.getGraph(projectId);

    return NextResponse.json(graphData);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
