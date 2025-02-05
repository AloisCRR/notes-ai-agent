import { useBackend } from "@/backend/backend-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

// Define Zod schemas for validation
const loginSchema = z.object({
	email: z.string().email("Please enter a valid email address"),
	password: z.string().min(6, "Password must be at least 6 characters"),
});

const registerSchema = loginSchema
	.extend({
		confirmPassword: z.string(),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords do not match",
		path: ["confirmPassword"],
	});

// Infer types from Zod schemas
type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;

export default function Access() {
	const backend = useBackend();
	const navigate = useNavigate();

	const loginMutation = useMutation({
		mutationFn: async (data: LoginFormData) => {
			await backend.loginUser(data.email, data.password);
		},
		onSuccess: () => {
			toast.success("Login successful");
			navigate({ to: "/app", replace: true });
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});

	const registerMutation = useMutation({
		mutationFn: async (data: RegisterFormData) => {
			await backend.registerUser(data.email, data.password);
		},
		onSuccess: () => {
			toast.success("Registration successful");
			navigate({ to: "/app", replace: true });
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});

	const loginForm = useForm<LoginFormData>({
		resolver: zodResolver(loginSchema),
		defaultValues: {
			email: "",
			password: "",
		},
	});

	const registerForm = useForm<RegisterFormData>({
		resolver: zodResolver(registerSchema),
		defaultValues: {
			email: "",
			password: "",
			confirmPassword: "",
		},
	});

	const handleLogin = (data: LoginFormData) => {
		loginMutation.mutate(data);
	};

	const handleSignUp = (data: RegisterFormData) => {
		if (data.password !== data.confirmPassword) {
			registerForm.setError("confirmPassword", {
				type: "manual",
				message: "Passwords do not match!",
			});
			return;
		}

		registerMutation.mutate(data);
	};

	return (
		<div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-slate-900 to-slate-800">
			<div className="mb-8 text-center">
				<h1 className="text-3xl font-bold text-white mb-2">Notes AI Agent</h1>
				<p className="text-slate-400">Your intelligent note-taking companion</p>
			</div>

			<Card className="w-full max-w-md border-slate-700/50 bg-slate-900/50 backdrop-blur-sm">
				<CardHeader className="space-y-1">
					<Tabs defaultValue="login" className="w-full">
						<TabsList className="grid w-full grid-cols-2 bg-slate-800">
							<TabsTrigger
								value="login"
								className="data-[state=active]:bg-slate-700"
							>
								Login
							</TabsTrigger>
							<TabsTrigger
								value="register"
								className="data-[state=active]:bg-slate-700"
							>
								Register
							</TabsTrigger>
						</TabsList>

						<TabsContent value="login">
							<CardContent className="pt-6">
								<form
									onSubmit={loginForm.handleSubmit(handleLogin)}
									className="space-y-4"
								>
									<div className="space-y-2">
										<label
											className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
											htmlFor="email"
										>
											Email
										</label>
										<Input
											id="email"
											type="email"
											placeholder="you@example.com"
											{...loginForm.register("email")}
										/>
										{loginForm.formState.errors.email && (
											<p className="text-sm text-red-500">
												{loginForm.formState.errors.email.message}
											</p>
										)}
									</div>
									<div className="space-y-2">
										<label
											className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
											htmlFor="password"
										>
											Password
										</label>
										<Input
											id="password"
											type="password"
											{...loginForm.register("password")}
										/>
										{loginForm.formState.errors.password && (
											<p className="text-sm text-red-500">
												{loginForm.formState.errors.password.message}
											</p>
										)}
									</div>
									<div className="flex justify-between items-center pt-2">
										<Button type="submit">Login</Button>
										{/* <Button
											variant="link"
											className="text-sm text-blue-400 hover:text-blue-300"
										>
											Forgot Password?
										</Button> */}
									</div>
								</form>
							</CardContent>
						</TabsContent>

						<TabsContent value="register">
							<CardContent className="pt-6">
								<form
									onSubmit={registerForm.handleSubmit(handleSignUp)}
									className="space-y-4"
								>
									<div className="space-y-2">
										<label
											className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
											htmlFor="signup-email"
										>
											Email
										</label>
										<Input
											id="signup-email"
											type="email"
											placeholder="you@example.com"
											{...registerForm.register("email")}
										/>
										{registerForm.formState.errors.email && (
											<p className="text-sm text-red-500">
												{registerForm.formState.errors.email.message}
											</p>
										)}
									</div>
									<div className="space-y-2">
										<label
											className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
											htmlFor="signup-password"
										>
											Password
										</label>
										<Input
											id="signup-password"
											type="password"
											{...registerForm.register("password")}
										/>
										{registerForm.formState.errors.password && (
											<p className="text-sm text-red-500">
												{registerForm.formState.errors.password.message}
											</p>
										)}
									</div>
									<div className="space-y-2">
										<label
											className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
											htmlFor="confirm-password"
										>
											Confirm Password
										</label>
										<Input
											id="confirm-password"
											type="password"
											{...registerForm.register("confirmPassword")}
										/>
										{registerForm.formState.errors.confirmPassword && (
											<p className="text-sm text-red-500">
												{registerForm.formState.errors.confirmPassword.message}
											</p>
										)}
									</div>
									<Button type="submit" className="w-full">
										Sign Up
									</Button>
								</form>
							</CardContent>
						</TabsContent>
					</Tabs>
				</CardHeader>
			</Card>
		</div>
	);
}
