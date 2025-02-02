import type { BackendUseCases, Note } from "./backend-context";

export class SupabaseBackend implements BackendUseCases {
	async getNotes(): Promise<Note[]> {
		// Replace this with your actual backend logic (e.g., fetching notes from Supabase)
		return [
			{ id: "1", content: "Note 1" },
			{ id: "2", content: "Note 2" },
		];
	}
}
