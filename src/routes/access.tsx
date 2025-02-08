import Access from "@/pages/Access";
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/access")({
	component: Access,
	beforeLoad: async ({ context: { backend } }) => {
		const isAuthenticated = await backend.isAuthenticated();

		if (isAuthenticated) {
			throw redirect({ to: "/notes", replace: true });
		}
	},
});
