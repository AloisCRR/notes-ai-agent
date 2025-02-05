import { type ReactNode, createContext, useContext } from "react";

// Define a type for Note (update as needed)
export type Note = {
	id: string;
	content: string;
	createdAt: string;
};

// Define the interface for backend use cases
export interface BackendUseCases {
	getNotes(): Promise<Note[]>;
	createNote(content: string): Promise<void>;
	updateNote(id: string, content: string): Promise<void>;
	deleteNote(id: string): Promise<void>;
	registerUser(email: string, password: string): Promise<void>;
	loginUser(email: string, password: string): Promise<void>;
	chat(message: string): Promise<string>;
}

// Create the Backend context with an undefined default value.
const BackendContext = createContext<BackendUseCases | undefined>(undefined);

type BackendProviderProps = {
	backend: BackendUseCases;
	children: ReactNode;
};

export const BackendProvider = ({
	backend,
	children,
}: BackendProviderProps) => (
	<BackendContext.Provider value={backend}>{children}</BackendContext.Provider>
);

// Custom hook to access the backend context
export const useBackend = (): BackendUseCases => {
	const context = useContext(BackendContext);
	if (!context) {
		throw new Error("useBackend must be used within a BackendProvider");
	}
	return context;
};
