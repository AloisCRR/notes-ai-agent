import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

import { RouterProvider, createRouter } from "@tanstack/react-router";
import { ThemeProvider } from "./components/theme-provider";
// Import the generated route tree
import { routeTree } from "./routeTree.gen";

import { Configuration } from "@/backend/fastapi";
import { NotesApi } from "@/backend/fastapi/apis/NotesApi";
import type { Database } from "@/backend/supabase/supabase";
import NotFound from "@/pages/NotFound";
import { createClient } from "@supabase/supabase-js";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BackendProvider } from "./backend/backend-context";
import { SupabaseBackend } from "./backend/supabase/supabase-backend";

const supabase = createClient<Database>(
	import.meta.env.VITE_SUPABASE_URL,
	import.meta.env.VITE_SUPABASE_ANON_KEY,
);

const configuration = new Configuration({
	basePath: import.meta.env.VITE_BACKEND_URL,
});

const notesApi = new NotesApi(configuration);

// Create an instance of the backend (Supabase example)
const supabaseBackend = new SupabaseBackend(supabase, notesApi);

// Create a new router instance
const router = createRouter({
	routeTree,
	context: { backend: supabaseBackend },
	defaultNotFoundComponent: NotFound,
});

// Register the router instance for type safety
declare module "@tanstack/react-router" {
	interface Register {
		router: typeof router;
	}
}

// Get the root element safely without using a non-null assertion
const rootElement = document.getElementById("root");
if (!rootElement) {
	throw new Error("Failed to find the root element");
}

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			refetchOnWindowFocus: false,
		},
	},
});

createRoot(rootElement).render(
	<StrictMode>
		<QueryClientProvider client={queryClient}>
			<BackendProvider backend={supabaseBackend}>
				<ThemeProvider defaultTheme="dark">
					<RouterProvider router={router} />
				</ThemeProvider>
			</BackendProvider>
		</QueryClientProvider>
	</StrictMode>,
);
