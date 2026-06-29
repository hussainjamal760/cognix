import { env } from "@/lib/env";

export interface IngestItem {
  id: string;
  type: "code" | "issue" | "pr" | "commit";
  content: string;
  metadata?: Record<string, any>;
}

export interface GraphNode {
  id: string;
  label: string;
  properties?: Record<string, any>;
}

export interface GraphEdge {
  source: string;
  target: string;
  label: string;
  properties?: Record<string, any>;
}

export const cogneeService = {
  async ingest(projectId: string, items: IngestItem[]) {
    const response = await fetch(`${env.COGNEE_API_URL}/ingest`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        project_id: projectId,
        items,
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({ detail: "Unknown error" }));
      throw new Error(err.detail || `Failed to ingest: ${response.statusText}`);
    }

    return response.json();
  },

  async query(projectId: string, query: string) {
    const response = await fetch(`${env.COGNEE_API_URL}/query`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        project_id: projectId,
        query,
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({ detail: "Unknown error" }));
      throw new Error(err.detail || `Failed to query: ${response.statusText}`);
    }

    return response.json() as Promise<{
      answer: string;
      context: Array<{ text: string; score: number }>;
    }>;
  },

  async getGraph(projectId: string) {
    const response = await fetch(`${env.COGNEE_API_URL}/graph/${projectId}`, {
      method: "GET",
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch graph data: ${response.statusText}`);
    }

    return response.json() as Promise<{
      nodes: GraphNode[];
      edges: GraphEdge[];
    }>;
  },
};
