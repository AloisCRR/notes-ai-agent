import type { BackendUseCases } from "@/backend/backend-context";
import { Outlet, createRootRouteWithContext } from "@tanstack/react-router";
import { Toaster } from "sonner";

interface RouterContext {
	backend: BackendUseCases;
}

export const Route = createRootRouteWithContext<RouterContext>()({
	component: RootComponent,
});

function RootComponent() {
	return (
		<>
			<Outlet />
			<Toaster richColors />
		</>
	);
}
