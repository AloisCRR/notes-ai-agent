import Access from "@/pages/Access";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/access")({
	component: Access,
});
