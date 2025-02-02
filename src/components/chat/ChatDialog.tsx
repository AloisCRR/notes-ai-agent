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
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { PlusCircle } from "lucide-react";
import { useRef, useState } from "react";

interface ChatMessage {
	role: "user" | "assistant";
	content: string;
}

interface ChatDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function ChatDialog({ open, onOpenChange }: ChatDialogProps) {
	const [messages, setMessages] = useState<ChatMessage[]>([]);
	const [inputValue, setInputValue] = useState("");
	const inputRef = useRef<HTMLTextAreaElement>(null);

	const handleSendMessage = () => {
		if (inputValue.trim()) {
			// Add user message
			const userMessage: ChatMessage = {
				role: "user",
				content: inputValue.trim(),
			};

			// Add AI response (mock for now)
			const aiMessage: ChatMessage = {
				role: "assistant",
				content: "This is a mock AI response. Real AI integration coming soon!",
			};

			setMessages([...messages, userMessage, aiMessage]);
			setInputValue("");
		}
	};

	const handleNewChat = () => {
		setMessages([]);
		setInputValue("");
		setTimeout(() => inputRef.current?.focus(), 0);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[500px] h-[600px] flex flex-col">
				<DialogHeader className="flex flex-row items-center justify-between">
					<DialogTitle>Chat with your notes</DialogTitle>
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

				<div className="flex-1 overflow-y-auto px-4">
					<ChatMessageList>
						{messages.map((message, index) => (
							<ChatBubble
								key={`${message.role}-${index}`}
								variant={message.role === "user" ? "sent" : "received"}
								layout={message.role === "assistant" ? "ai" : "default"}
							>
								<ChatBubbleMessage>{message.content}</ChatBubbleMessage>
							</ChatBubble>
						))}
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
					/>
				</div>
			</DialogContent>
		</Dialog>
	);
}
