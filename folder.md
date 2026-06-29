# Cognix Folder Structure Guidelines

This document outlines the architectural patterns and folder structure conventions for the **Cognix** repository. Any AI agent or developer implementing new features **MUST** strictly adhere to this structure.

---

## 📁 Repository Overview

```
cognix/
├── 🐍 cognee-engine/         # Python/FastAPI Backend (Cognitive/Knowledge Graph Engine)
│   ├── main.py               # Main FastAPI entry point (ingest, query, graph endpoints)
│   ├── requirements.txt      # Python package dependencies (cognee, fastapi, uvicorn, etc.)
│   └── .env.example          # Environment variable template
│
└── ⚛️ web/                   # Next.js Frontend App
    ├── prisma/               # Database schemas and migration configurations
    │   └── schema.prisma     # Prisma DB schema definition (User, Project, Repository, Chat)
    ├── public/               # Static assets (images, fonts, icons)
    └── src/                  # Main application source code
        ├── app/              # Next.js App Router (Routes, Page Components, API routes)
        │   ├── (auth)/       # Routing group for Authentication (e.g. login)
        │   ├── (dashboard)/  # Routing group for App Dashboard (e.g. projects, workspace)
        │   └── api/          # Route handlers (HTTP API endpoints e.g. /api/auth, /api/projects)
        ├── components/       # Global/Shared React components
        │   ├── ui/           # Low-level reusable components (mostly Shadcn UI primitives)
        │   └── layout/       # Shared structural wrappers (navbars, sidebars)
        ├── features/         # Feature-based modular directories (Domain-Driven Design)
        ├── hooks/            # Global custom React hooks (for utilities used across multiple features)
        ├── lib/              # Initialization / Third-party clients (prisma.ts, env.ts, auth.ts)
        ├── providers/        # Context providers wrapping the application (theme, query client)
        └── services/         # Global backend services, API integrations (cognee.ts, github.ts)
```

---

## 🛠️ Feature Folder Structure (Domain-Driven Design)

To ensure high modularity and maintainability, features must be colocated inside `web/src/features/[feature_name]`. **Do not** scatter feature-specific hooks, components, or api files into global folders.

Each feature folder must follow this sub-structure:

```
web/src/features/[feature_name]/
├── 🌐 api/
│   └── [feature_name].api.ts
│       # Contains raw API endpoint functions (e.g., fetch, axios, or custom fetcher calls).
│       # Strictly focused on data fetching logic. Do not write React state or JSX here.
│
├── 🪝 hooks/
│   └── use[FeatureName]Actions.ts / use[FeatureName]Data.ts
│       # React custom hooks integrating TanStack Query (useQuery, useMutation).
│       # Calls api functions from the feature's `api/` directory.
│       # Keeps state synchronization and caching clean and isolated from components.
│
└── 🧩 components/
    ├── [ComponentName].tsx
    └── [SubComponent].tsx
        # Components specific ONLY to this feature.
        # Renders the UI and consumes the feature's custom hooks.
```

### 🛑 Strict Rules for Adding Features

1. **Keep Pages (in `app/`) Lean**:
   - Files like `app/projects/[projectId]/page.tsx` should only serve as the entry points. They should import and render feature components (e.g., `import { ChatInterface } from "@/features/chat/components/ChatInterface"`).
   - Do not write API call functions or define TanStack Query logic directly inside page files.

2. **API Isolation**:
   - All HTTP requests targeting `/api/*` or external services for a specific feature MUST be defined as helper functions in `features/[feature_name]/api/[feature_name].api.ts`.
   - Example function signature: `export const sendMessage = async (chatSessionId: string, message: string) => { ... }`

3. **TanStack Query Integration**:
   - Never use `useEffect` for data fetching inside feature components. Use custom hooks in `features/[feature_name]/hooks/`.
   - Wrap the feature's API calls inside `useQuery` or `useMutation`.
   - Example hook:
     ```typescript
     import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
     import { sendMessage } from "../api/chat.api";

     export const useSendMessage = () => {
       const queryClient = useQueryClient();
       return useMutation({
         mutationFn: ({ sessionId, content }: { sessionId: string; content: string }) => 
           sendMessage(sessionId, content),
         onSuccess: () => {
           queryClient.invalidateQueries({ queryKey: ["chatMessages"] });
         }
       });
     };
     ```

4. **Component Domain Boundaries**:
   - If a component is only used within a single feature (e.g. a chat message input bar), place it under `features/[feature_name]/components/`.
   - If a component is globally reusable across multiple features (e.g. a customized Button, Modal, or Dialog), place it under `components/ui/` (which mostly contains Shadcn UI primitive components) or `components/layout/`.

5. **Prisma & Backend Services**:
   - If you need to edit database integrations or add schema changes, write them in `prisma/schema.prisma`.
   - Business services that operate globally or call the Python backend engine should reside in `web/src/services/` (e.g. `cognee.ts` or `github.ts`).

---

**Follow these standards strictly.** Do not place files in random locations. If creating a new feature (e.g. `projects`), initialize the directory with its corresponding `api`, `hooks`, and `components` subfolders.
