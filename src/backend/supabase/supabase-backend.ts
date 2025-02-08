import type {
	BackendUseCases,
	ChatMessage,
	ChatRoom,
	Note,
} from "@/backend/backend-context";
import type { NotesApi } from "@/backend/fastapi/apis/NotesApi";
import type { Database } from "@/backend/supabase/supabase";
import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";

const PartKindEnum = z.enum([
	"system-prompt",
	"user-prompt",
	"text",
	"tool-call",
	"tool-return",
]);

const MessagePart = z.object({
	content: z.string().optional(),
	dynamic_ref: z.null().optional(),
	part_kind: PartKindEnum,
	timestamp: z.string().datetime().optional(),
	tool_name: z.string().optional(),
	tool_call_id: z.string().optional(),
	args: z.union([z.record(z.any()), z.string()]).optional(),
});

const MessageKindEnum = z.enum(["request", "response"]);

const MessageGroup = z.object({
	parts: z.array(MessagePart),
	kind: MessageKindEnum,
	model_name: z.string().optional(),
	timestamp: z.string().datetime().optional(),
});

const MessageSchema = z.array(MessageGroup);

export class SupabaseBackend implements BackendUseCases {
	constructor(
		private readonly client: SupabaseClient<Database>,
		private readonly notesApi: NotesApi,
	) {}

	async updateChatTitle(chatId: number, title: string): Promise<void> {
		await this.client
			.from("chat")
			.update({ title })
			.eq("id", chatId)
			.throwOnError();
	}

	async deleteChat(chatId: number): Promise<void> {
		await this.client.from("chat").delete().eq("id", chatId).throwOnError();
	}

	async getChatRooms(): Promise<ChatRoom[]> {
		const { data } = await this.client
			.from("chat")
			.select("*")
			.order("id", { ascending: false })
			.throwOnError();

		return data.map((chat) => ({
			id: chat.id,
			title: chat.title,
			created_at: chat.created_at,
		}));
	}

	async getChatMessages(chatId: number): Promise<ChatMessage[]> {
		const { data } = await this.client
			.from("chat_messages")
			.select("message")
			.eq("chat_id", chatId)
			.throwOnError();

		return data
			.flatMap((message) => {
				const parsedMessage = MessageSchema.parse(
					JSON.parse(String(message.message ?? "[]")),
				);

				return parsedMessage.map((group) => {
					const userPromptOrText = group.parts.find(
						(part) =>
							part.part_kind === "user-prompt" || part.part_kind === "text",
					);

					if (!userPromptOrText?.content) {
						return null;
					}

					const role: "user" | "assistant" =
						group.kind === "request" ? "user" : "assistant";

					return {
						id: userPromptOrText?.timestamp ?? group.timestamp ?? "",
						role,
						content: userPromptOrText?.content ?? "",
					};
				});
			})
			.filter((message) => message !== null);
	}

	async createChat(title: string): Promise<ChatRoom> {
		const session = await this.client.auth.getSession();

		if (session.error) {
			throw new Error(session.error.message);
		}

		if (!session.data.session) {
			throw new Error("User not found");
		}

		const { data } = await this.client
			.from("chat")
			.insert({ title, user_id: session.data.session.user.id })
			.select()
			.throwOnError();

		const row = data[0];

		if (!row) {
			throw new Error("Error returning chat creation data");
		}

		return {
			id: row.id,
			title: row.title,
			created_at: row.created_at,
		};
	}

	async registerUser(email: string, password: string): Promise<void> {
		const { error } = await this.client.auth.signUp({ email, password });

		if (error) {
			throw new Error(error.message);
		}
	}

	async loginUser(email: string, password: string): Promise<void> {
		const { error } = await this.client.auth.signInWithPassword({
			email,
			password,
		});

		if (error?.code === "invalid_credentials") {
			throw new Error("Invalid credentials or user not found");
		}
	}

	async updateNote(id: string, content: string): Promise<void> {
		await this.client
			.from("notes")
			.update({ content })
			.eq("id", Number(id))
			.throwOnError();
	}

	async deleteNote(id: string): Promise<void> {
		await this.client
			.from("notes")
			.delete()
			.eq("id", Number(id))
			.throwOnError();
	}

	async getNotes(): Promise<Note[]> {
		const { data } = await this.client
			.from("notes")
			.select("id, content, created_at")
			.throwOnError();

		return data.map((note) => ({
			id: note.id.toString(),
			content: note.content,
			createdAt: note.created_at,
		}));
	}

	async createNote(content: string): Promise<void> {
		const { data, error } = await this.client.auth.getSession();

		if (error) {
			throw new Error(error.message);
		}

		if (!data.session) {
			throw new Error("User not found");
		}

		await this.notesApi.createNoteNotesPost(
			{ noteCreate: { content } },
			{
				headers: {
					Authorization: `Bearer ${data.session?.access_token}`,
					"Content-Type": "application/json",
				},
			},
		);
	}

	async chat(message: string, chatId: number): Promise<string> {
		const { data, error } = await this.client.auth.getSession();

		if (error) {
			throw new Error(error.message);
		}

		if (!data.session) {
			throw new Error("User not found");
		}

		const { response } = await this.notesApi.chatWithAgentAgentChatChatIdPost(
			{ chatId, chatRequest: { query: message } },
			{
				headers: {
					Authorization: `Bearer ${data.session?.access_token}`,
					"Content-Type": "application/json",
				},
			},
		);

		return response;
	}

	async logoutUser(): Promise<void> {
		await this.client.auth.signOut();
	}

	async isAuthenticated(): Promise<boolean> {
		const { data, error } = await this.client.auth.getSession();

		if (error) {
			return false;
		}

		return !!data.session;
	}
}
