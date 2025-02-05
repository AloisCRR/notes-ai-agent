import { Configuration } from "@/backend/fastapi";
import { NotesApi } from "@/backend/fastapi/apis/NotesApi";
import type { Database } from "@/backend/supabase/supabase";
import { createClient } from "@supabase/supabase-js";
import type { BackendUseCases, Note } from "../backend-context";

const supabase = createClient<Database>(
	import.meta.env.VITE_SUPABASE_URL,
	import.meta.env.VITE_SUPABASE_ANON_KEY,
);

const configuration = new Configuration({
	basePath: import.meta.env.VITE_BACKEND_URL,
});

const notesApi = new NotesApi(configuration);

export class SupabaseBackend implements BackendUseCases {
	async registerUser(email: string, password: string): Promise<void> {
		const { error } = await supabase.auth.signUp({ email, password });

		if (error) {
			throw new Error(error.message);
		}
	}

	async loginUser(email: string, password: string): Promise<void> {
		const { error } = await supabase.auth.signInWithPassword({
			email,
			password,
		});

		if (error?.code === "invalid_credentials") {
			throw new Error("Invalid credentials or user not found");
		}
	}

	async updateNote(id: string, content: string): Promise<void> {
		await supabase
			.from("notes")
			.update({ content })
			.eq("id", Number(id))
			.throwOnError();
	}

	async deleteNote(id: string): Promise<void> {
		await supabase.from("notes").delete().eq("id", Number(id)).throwOnError();
	}

	async getNotes(): Promise<Note[]> {
		const { data } = await supabase.from("notes").select("*").throwOnError();

		return data.map((note) => ({
			id: note.id.toString(),
			content: note.content,
		}));
	}

	async createNote(content: string): Promise<void> {
		const { data, error } = await supabase.auth.getSession();

		if (error) {
			throw new Error(error.message);
		}

		if (!data.session) {
			throw new Error("User not found");
		}

		await notesApi.createNoteNotesPost(
			{ noteCreate: { content } },
			{
				headers: {
					Authorization: `Bearer ${data.session?.access_token}`,
					"Content-Type": "application/json",
				},
			},
		);
	}

	async chat(message: string): Promise<string> {
		const { data, error } = await supabase.auth.getSession();

		if (error) {
			throw new Error(error.message);
		}

		if (!data.session) {
			throw new Error("User not found");
		}

		const { response } = await notesApi.chatWithAgentAgentChatPost(
			{ chatRequest: { query: message } },
			{
				headers: {
					Authorization: `Bearer ${data.session?.access_token}`,
					"Content-Type": "application/json",
				},
			},
		);

		return response;
	}
}
