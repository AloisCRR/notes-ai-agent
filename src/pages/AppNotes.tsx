import { ChatDialog } from "@/components/chat/ChatDialog";
import { ThemeToggle } from "@/components/theme-toggle";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";

export default function AppNotes() {
	const [note, setNote] = useState("");
	const [notes, setNotes] = useState<string[]>([]);
	const [editingNote, setEditingNote] = useState<{
		index: number;
		content: string;
	} | null>(null);
	const [isChatOpen, setIsChatOpen] = useState(false);
	const [deleteIndex, setDeleteIndex] = useState<number | null>(null);

	const handleAddNote = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (note.trim() !== "") {
			setNotes([...notes, note.trim()]);
			setNote("");
		}
	};

	const handleEditNote = (index: number) => {
		setEditingNote({ index, content: notes[index] || "" });
	};

	const handleSaveEdit = () => {
		if (editingNote && editingNote.content.trim() !== "") {
			const newNotes = [...notes];
			newNotes[editingNote.index] = editingNote.content;
			setNotes(newNotes);
			setEditingNote(null);
		}
	};

	const handleDeleteNote = (index: number) => {
		const newNotes = [...notes];
		newNotes.splice(index, 1);
		setNotes(newNotes);
		setDeleteIndex(null);
	};

	return (
		<div className="min-h-screen bg-background p-8">
			<div className="max-w-4xl mx-auto">
				<div className="flex justify-between items-center mb-6">
					<h1 className="text-3xl font-bold">Notes AI</h1>
					<div className="flex gap-2">
						<Button
							variant="outline"
							size="icon"
							onClick={() => setIsChatOpen(true)}
						>
							<MessageSquare className="h-[1.2rem] w-[1.2rem]" />
						</Button>
						<ThemeToggle />
					</div>
				</div>

				<ChatDialog open={isChatOpen} onOpenChange={setIsChatOpen} />

				<Card className="mb-6">
					<CardContent className="pt-6">
						<form onSubmit={handleAddNote} className="space-y-4">
							<Textarea
								value={note}
								onChange={(e) => setNote(e.target.value)}
								placeholder="Write your note here..."
								className="min-h-[120px]"
								required
							/>
							<Button type="submit">Add Note</Button>
						</form>
					</CardContent>
				</Card>

				<div className="space-y-4">
					{notes.length === 0 ? (
						<p className="text-muted-foreground text-center py-8">
							No notes yet. Start by adding one above!
						</p>
					) : (
						notes.map((n, index) => (
							<Card key={`${n}-${index.toString()}`}>
								<CardContent className="pt-6 relative">
									<div className="absolute right-4 top-4 flex gap-2">
										<Button
											variant="ghost"
											size="icon"
											onClick={() => handleEditNote(index)}
										>
											<Pencil className="h-4 w-4" />
										</Button>
										<Button
											variant="ghost"
											size="icon"
											onClick={() => setDeleteIndex(index)}
										>
											<Trash2 className="h-4 w-4" />
										</Button>
									</div>
									{n}
								</CardContent>
							</Card>
						))
					)}
				</div>

				<Dialog
					open={editingNote !== null}
					onOpenChange={() => setEditingNote(null)}
				>
					<DialogContent aria-describedby="edit-note">
						<DialogHeader>
							<DialogTitle>Edit Note</DialogTitle>
						</DialogHeader>
						<Textarea
							value={editingNote?.content || ""}
							onChange={(e) =>
								setEditingNote(
									editingNote
										? { ...editingNote, content: e.target.value }
										: null,
								)
							}
							className="min-h-[120px]"
						/>
						<Button onClick={handleSaveEdit}>Save Changes</Button>
					</DialogContent>
				</Dialog>

				<AlertDialog
					open={deleteIndex !== null}
					onOpenChange={() => setDeleteIndex(null)}
				>
					<AlertDialogContent>
						<AlertDialogHeader>
							<AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
							<AlertDialogDescription>
								This action cannot be undone. This note will be permanently
								deleted.
							</AlertDialogDescription>
						</AlertDialogHeader>
						<AlertDialogFooter>
							<AlertDialogCancel>Cancel</AlertDialogCancel>
							<AlertDialogAction
								onClick={() =>
									deleteIndex !== null && handleDeleteNote(deleteIndex)
								}
							>
								Delete
							</AlertDialogAction>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialog>
			</div>
		</div>
	);
}
