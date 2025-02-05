import { type Note, useBackend } from "@/backend/backend-context";
import type { ResponseError } from "@/backend/fastapi/runtime";
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
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { MessageSquare, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

const noteSchema = z.object({
	content: z.string().min(1, "Note cannot be empty"),
});

type NoteFormData = z.infer<typeof noteSchema>;

export default function AppNotes() {
	const backend = useBackend();

	const {
		data: notes,
		isLoading: isLoadingNotes,
		refetch: refetchNotes,
	} = useQuery({
		queryKey: ["notes"],
		queryFn: () => backend.getNotes(),
	});

	const createNoteMutation = useMutation({
		mutationFn: (content: string) => backend.createNote(content),
		onSuccess: () => {
			toast.success("Note created successfully");
			refetchNotes();
		},
		onError: async (error: ResponseError) => {
			const errorData: {
				detail: string;
			} = await error.response.json();

			toast.error(`Failed to create note - ${errorData.detail}`);
		},
	});

	const updateNoteMutation = useMutation({
		mutationFn: (update: {
			id: string;
			content: string;
		}) => backend.updateNote(update.id, update.content),
		onSuccess: () => {
			toast.success("Note updated successfully");
			refetchNotes();
		},
		onError: () => {
			toast.error("Failed to update note");
		},
	});

	const deleteNoteMutation = useMutation({
		mutationFn: (id: string) => backend.deleteNote(id),
		onSuccess: () => {
			toast.success("Note deleted successfully");
			refetchNotes();
		},
		onError: () => {
			toast.error("Failed to delete note");
		},
	});

	const [editingNote, setEditingNote] = useState<string | null>(null);

	const [isChatOpen, setIsChatOpen] = useState(false);

	const [deleteId, setDeleteId] = useState<string | null>(null);

	const form = useForm<NoteFormData>({
		resolver: zodResolver(noteSchema),
		defaultValues: {
			content: "",
		},
	});

	const editForm = useForm<NoteFormData>({
		resolver: zodResolver(noteSchema),
	});

	const handleAddNote = (data: NoteFormData) => {
		createNoteMutation.mutate(data.content, {
			onSuccess: () => {
				form.reset();
			},
		});
	};

	const handleEditNote = (note: Note) => {
		editForm.setValue("content", note.content);
		setEditingNote(note.id);
	};

	const handleSaveEdit = (data: NoteFormData) => {
		if (editingNote) {
			updateNoteMutation.mutate(
				{
					id: editingNote,
					content: data.content,
				},
				{
					onSuccess: () => {
						setEditingNote(null);
						editForm.reset();
					},
				},
			);
		}
	};

	const handleDeleteNote = (id: string) => {
		deleteNoteMutation.mutate(id, {
			onSuccess: () => {
				toast.success("Note deleted successfully");
				setDeleteId(null);
			},
			onError: () => {
				toast.error("Failed to delete note");
			},
		});
	};

	return (
		<div className="min-h-screen bg-background p-8">
			<div className="max-w-4xl mx-auto">
				<div className="flex justify-between items-center mb-8">
					<h1 className="text-4xl font-bold tracking-tight">Notes AI</h1>
					<div className="flex gap-3">
						<Button
							variant="outline"
							size="icon"
							onClick={() => setIsChatOpen(true)}
							className="hover:bg-primary/10"
						>
							<MessageSquare className="h-[1.2rem] w-[1.2rem]" />
						</Button>
						<ThemeToggle />
					</div>
				</div>

				<ChatDialog open={isChatOpen} onOpenChange={setIsChatOpen} />

				<Card className="mb-8 border-2 border-primary/10 shadow-sm">
					<CardContent className="pt-6">
						<form
							onSubmit={form.handleSubmit(handleAddNote)}
							className="space-y-4"
						>
							<Textarea
								{...form.register("content")}
								placeholder="Write your note here..."
								className="min-h-[120px] text-lg resize-y"
								disabled={createNoteMutation.isPending}
							/>
							{form.formState.errors.content && (
								<p className="text-sm text-destructive">
									{form.formState.errors.content.message}
								</p>
							)}
							<Button
								type="submit"
								disabled={createNoteMutation.isPending}
								className="w-full sm:w-auto"
							>
								{createNoteMutation.isPending ? "Adding..." : "Add Note"}
							</Button>
						</form>
					</CardContent>
				</Card>

				<div className="space-y-6">
					{isLoadingNotes ? (
						Array.from({ length: 3 }).map((_, index) => (
							<Card key={`skeleton-notes-${index.toString()}`}>
								<CardContent className="pt-6">
									<div className="h-4 bg-muted rounded animate-pulse w-3/4 mb-2" />
									<div className="h-4 bg-muted rounded animate-pulse w-1/2" />
								</CardContent>
							</Card>
						))
					) : notes?.length === 0 ? (
						<div className="text-center py-12 bg-muted/30 rounded-lg">
							<p className="text-muted-foreground text-lg">
								No notes yet. Start by adding one above!
							</p>
						</div>
					) : (
						notes?.map((note, index) => (
							<Card
								key={`${note}-${index.toString()}`}
								className="hover:shadow-md transition-shadow duration-200"
							>
								<CardContent className="pt-6 relative group">
									<div className="absolute right-4 top-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
										<Button
											variant="ghost"
											size="icon"
											onClick={() => handleEditNote(note)}
											disabled={
												deleteNoteMutation.isPending ||
												updateNoteMutation.isPending
											}
											className="hover:bg-primary/10"
										>
											<Pencil className="h-4 w-4" />
										</Button>
										<Button
											variant="ghost"
											size="icon"
											onClick={() => setDeleteId(note.id)}
											disabled={
												deleteNoteMutation.isPending ||
												updateNoteMutation.isPending
											}
											className="hover:bg-destructive/10 hover:text-destructive"
										>
											<Trash2 className="h-4 w-4" />
										</Button>
									</div>
									<div className="whitespace-pre-wrap text-lg pr-20">
										{note.content}
									</div>
								</CardContent>
							</Card>
						))
					)}
				</div>

				<Dialog
					open={editingNote !== null}
					onOpenChange={(open) => {
						if (!open) {
							setEditingNote(null);
							editForm.reset();
						}
					}}
				>
					<DialogContent aria-describedby="edit-note">
						<DialogHeader>
							<DialogTitle>Edit Note</DialogTitle>
						</DialogHeader>
						<form onSubmit={editForm.handleSubmit(handleSaveEdit)}>
							<Textarea
								{...editForm.register("content")}
								className="min-h-[120px]"
								disabled={updateNoteMutation.isPending}
							/>
							{editForm.formState.errors.content && (
								<p className="text-sm text-destructive">
									{editForm.formState.errors.content.message}
								</p>
							)}
							<Button
								type="submit"
								className="mt-4"
								disabled={updateNoteMutation.isPending}
							>
								{updateNoteMutation.isPending ? "Saving..." : "Save Changes"}
							</Button>
						</form>
					</DialogContent>
				</Dialog>

				<AlertDialog
					open={deleteId !== null}
					onOpenChange={() => setDeleteId(null)}
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
								onClick={() => deleteId !== null && handleDeleteNote(deleteId)}
								disabled={deleteNoteMutation.isPending}
							>
								{deleteNoteMutation.isPending ? "Deleting..." : "Delete"}
							</AlertDialogAction>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialog>
			</div>
		</div>
	);
}
