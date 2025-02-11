import { useBackend } from "@/backend/backend-context";
import { Button } from "@/components/ui/button";
import {
	ChatBubble,
	ChatBubbleMessage,
} from "@/components/ui/chat/chat-bubble";
import { ChatInput } from "@/components/ui/chat/chat-input";
import { ChatMessageList } from "@/components/ui/chat/chat-message-list";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Edit, PlusCircle, Trash } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface ChatDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function ChatDialog({ open, onOpenChange }: ChatDialogProps) {
	const backend = useBackend();
	const [currentChatId, setCurrentChatId] = useState<number | null>(null);
	const [inputValue, setInputValue] = useState("");
	const inputRef = useRef<HTMLTextAreaElement>(null);
	// Flag to ensure only auto-create one chat.
	const [hasAutoCreated, setHasAutoCreated] = useState(false);

	// Query to fetch chat rooms
	const chatRoomsQuery = useQuery({
		queryKey: ["chatRooms"],
		queryFn: async () => {
			const rooms = await backend.getChatRooms();
			return rooms;
		},
	});

	// Mutation to create a new chat
	const createChatMutation = useMutation({
		mutationFn: async (title: string) => backend.createChat(title),
		onError: (error) => {
			toast.error(`Error creating chat: ${error.message}`);
		},
	});

	// Separate effect for setting default chat
	useEffect(() => {
		if (chatRoomsQuery.data && chatRoomsQuery.data.length > 0) {
			setCurrentChatId(chatRoomsQuery.data[0]?.id ?? null);
		}
	}, [chatRoomsQuery.data]);

	// Separate effect for focusing the input when a chat is selected
	useEffect(() => {
		if (currentChatId) {
			inputRef.current?.focus();
		}
	}, [currentChatId]);

	// Query to fetch messages for current chat
	const messagesQuery = useQuery({
		queryKey: ["chatMessages", currentChatId],
		queryFn: async () =>
			currentChatId ? backend.getChatMessages(currentChatId) : [],
		enabled: !!currentChatId,
		retry: false,
	});

	// Mutation to send a message
	const sendMessageMutation = useMutation({
		mutationFn: async (chat: { message: string; chatId: number }) => {
			const response = await backend.chat(chat.message, chat.chatId);
			await messagesQuery.refetch();
			return response;
		},
		onError: (error) => {
			toast.error(`Error sending message: ${error.message}`);
		},
	});

	// Mutation to update a chat's title
	const updateChatTitleMutation = useMutation({
		mutationFn: async (params: { chatId: number; title: string }) =>
			backend.updateChatTitle(params.chatId, params.title),
		onSuccess: async () => {
			await chatRoomsQuery.refetch();
		},
		onError: (error) => {
			toast.error(`Error updating chat title: ${error.message}`);
		},
	});

	// Mutation to delete a chat
	const deleteChatMutation = useMutation({
		mutationFn: async (chatId: number) => backend.deleteChat(chatId),
		onSuccess: async () => {
			await chatRoomsQuery.refetch();
		},
		onError: (error) => {
			toast.error(`Error deleting chat: ${error.message}`);
		},
	});

	// Memoized handler for sending messages
	const handleSendMessage = useCallback(async () => {
		if (!inputValue.trim() || !currentChatId) return;

		const messageContent = inputValue.trim();
		setInputValue("");

		sendMessageMutation.mutate({
			message: messageContent,
			chatId: currentChatId,
		});
	}, [inputValue, currentChatId, sendMessageMutation]);

	// Memoized handler for editing chat title
	const handleEditChatTitle = useCallback(
		(chat: { id: number; title: string }) => {
			const newTitle = prompt("Enter new chat title:", chat.title);
			if (newTitle && newTitle !== chat.title) {
				updateChatTitleMutation.mutate({ chatId: chat.id, title: newTitle });
			}
		},
		[updateChatTitleMutation],
	);

	// Memoized handler for deleting a chat
	const handleDeleteChat = useCallback(
		(chatId: number) => {
			if (confirm("Are you sure you want to delete this chat?")) {
				deleteChatMutation.mutate(chatId);
			}
		},
		[deleteChatMutation],
	);

	// Handles new chat creation either via user
	// action or automatically when there are no chats.
	const handleNewChat = () => {};

	useEffect(() => {
		if (
			chatRoomsQuery.data &&
			chatRoomsQuery.data.length === 0 &&
			!hasAutoCreated
		) {
			setHasAutoCreated(true);

			createChatMutation.mutate("New Chat", {
				onSuccess: async ({ id }) => {
					setInputValue("");
					setCurrentChatId(id);
					await chatRoomsQuery.refetch();
					inputRef.current?.focus();
				},
			});
		}
	}, [chatRoomsQuery.data]);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent
				aria-describedby="chat-dialog-content"
				className="sm:max-w-[800px] h-[600px] flex flex-col"
			>
				<DialogHeader className="flex flex-row items-center justify-between">
					<DialogTitle>Chat with your notes</DialogTitle>
					<DialogDescription>
						Ask questions about your notes and get answers.
					</DialogDescription>
					<Button
						variant="ghost"
						size="sm"
						className="gap-2"
						onClick={handleNewChat}
					>
						<PlusCircle className="h-4 w-4" />
						New Chat
					</Button>
				</DialogHeader>

				<div className="flex flex-1 gap-4">
					{/* Chat rooms sidebar */}
					<div className="w-64 pr-2 flex flex-col gap-2 border-r overflow-y-auto">
						{chatRoomsQuery.data?.map((chat) => (
							<div key={chat.id} className="group relative flex items-center">
								<Button
									variant={currentChatId === chat.id ? "secondary" : "ghost"}
									className="w-full justify-start text-left truncate px-4 py-2 pr-16"
									onClick={() => setCurrentChatId(chat.id)}
								>
									{chat.title}
								</Button>
								{currentChatId === chat.id && (
									<>
										<Button
											variant="ghost"
											size="sm"
											className="absolute right-8"
											onClick={() => handleEditChatTitle(chat)}
										>
											<Edit />
										</Button>
										<Button
											variant="ghost"
											size="sm"
											className="absolute right-1"
											onClick={() => handleDeleteChat(chat.id)}
										>
											<Trash />
										</Button>
									</>
								)}
							</div>
						))}
					</div>

					{/* Chat messages area */}
					<div className="flex-1 flex flex-col h-[515px]">
						<div className="flex-1 overflow-y-auto px-4">
							<ChatMessageList>
								{messagesQuery.data?.length === 0 ? (
									<div className="h-full flex flex-col items-center justify-center text-center p-8 text-muted-foreground">
										<h3 className="text-lg font-semibold mb-2">
											Start a conversation
										</h3>
										<p className="text-sm max-w-md">
											Ask questions about your notes and I'll help you find the
											information you need.
										</p>
									</div>
								) : (
									<>
										{messagesQuery.data?.map((message) => (
											<ChatBubble
												key={message.id}
												variant={message.role === "user" ? "sent" : "received"}
												layout={message.role === "assistant" ? "ai" : "default"}
											>
												<ChatBubbleMessage>{message.content}</ChatBubbleMessage>
											</ChatBubble>
										))}
									</>
								)}
								{/* Show optimistic user message */}
								{sendMessageMutation.isPending &&
									sendMessageMutation.variables && (
										<ChatBubble variant="sent">
											<ChatBubbleMessage>
												{sendMessageMutation.variables.message}
											</ChatBubbleMessage>
										</ChatBubble>
									)}
								{/* Show loading state for AI response */}
								{sendMessageMutation.isPending && (
									<ChatBubble variant="received" layout="ai">
										<ChatBubbleMessage isLoading />
									</ChatBubble>
								)}
							</ChatMessageList>
						</div>

						<div className="p-4 border-t">
							<ChatInput
								ref={inputRef}
								placeholder="Type a message..."
								value={inputValue}
								onChange={(e) => setInputValue(e.target.value)}
								onKeyDown={(e) => {
									if (e.key === "Enter" && !e.shiftKey) {
										e.preventDefault();
										handleSendMessage();
									}
								}}
								disabled={!currentChatId}
							/>
						</div>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
