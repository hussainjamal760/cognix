import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { cogneeService } from "@/services/cognee";

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
    const { query, chatSessionId } = await req.json();
    if (!query) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    // 1. Verify project ownership
    const project = await prisma.project.findFirst({
      where: { id: projectId, userId: session.user.id },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // 2. Find or create Chat Session
    let chatSession;
    if (chatSessionId) {
      chatSession = await prisma.chatSession.findFirst({
        where: { id: chatSessionId, projectId },
      });
    }

    if (!chatSession) {
      chatSession = await prisma.chatSession.create({
        data: {
          title: query.slice(0, 30) + (query.length > 30 ? "..." : ""),
          projectId,
        },
      });
    }

    // 3. Save User Message in PostgreSQL
    const userMessage = await prisma.chatMessage.create({
      data: {
        role: "USER",
        content: query,
        chatSessionId: chatSession.id,
      },
    });

    // 4. Query Cognee hybrid graph-vector memory
    let answer = "Error processing search query.";
    let contextData: any[] = [];

    try {
      const cogneeResult = await cogneeService.query(projectId, query);
      answer = cogneeResult.answer;
      contextData = cogneeResult.context;
    } catch (cogneeErr: any) {
      console.error("Cognee query error: ", cogneeErr);
      answer = `Failed to retrieve cognitive memory: ${cogneeErr.message}. Falling back to default assistant knowledge.`;
    }

    // 5. Save Assistant Response and citation references in database
    const assistantMessage = await prisma.chatMessage.create({
      data: {
        role: "ASSISTANT",
        content: answer,
        citations: contextData as any,
        chatSessionId: chatSession.id,
      },
    });

    return NextResponse.json({
      chatSessionId: chatSession.id,
      userMessage,
      assistantMessage,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
