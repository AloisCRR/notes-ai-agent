import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_app")({
	beforeLoad: async ({ context: { backend }, location }) => {
		const isAuthenticated = await backend.isAuthenticated();

		if (!isAuthenticated) {
			throw redirect({
				to: "/access",
				search: {
					redirect: location.pathname,
				},
				replace: true,
			});
		}
	},
	component: RouteComponent,
});

function RouteComponent() {
	return <Outlet />;
}
