import AppNotes from "@/pages/AppNotes";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/notes")({
	component: AppNotes,
});
