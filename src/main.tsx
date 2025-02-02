import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

import { RouterProvider, createRouter } from "@tanstack/react-router";
import { ThemeProvider } from "./components/theme-provider";
// Import the generated route tree
import { routeTree } from "./routeTree.gen";

// Import the Backend provider and sample implementation
import { BackendProvider } from "./backend/backend-context";
import { SupabaseBackend } from "./backend/supabase-backend";

// Create an instance of the backend (Supabase example)
const supabaseBackend = new SupabaseBackend();

// Create a new router instance
const router = createRouter({ routeTree });

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

createRoot(rootElement).render(
	<StrictMode>
		<BackendProvider backend={supabaseBackend}>
			<ThemeProvider defaultTheme="dark">
				<RouterProvider router={router} />
			</ThemeProvider>
		</BackendProvider>
	</StrictMode>,
);
