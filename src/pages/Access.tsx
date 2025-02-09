import { useBackend } from "@/backend/backend-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
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
	const [showVerificationModal, setShowVerificationModal] = useState(false);
	const [activeTab, setActiveTab] = useState("login");

	const loginMutation = useMutation({
		mutationFn: async (data: LoginFormData) => {
			await backend.loginUser(data.email, data.password);
		},
		onSuccess: () => {
			toast.success("Login successful");
			const searchParams = new URLSearchParams(window.location.search);
			const redirectTo = searchParams.get("redirect") || "/";
			navigate({ to: redirectTo, replace: true });
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
			registerForm.reset();
			setShowVerificationModal(true);
			setActiveTab("login");
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

	const handleCloseVerificationModal = () => {
		setShowVerificationModal(false);
	};

	return (
		<>
			<div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-slate-900 to-slate-800">
				<div className="mb-8 text-center">
					<h1 className="text-3xl font-bold text-white mb-2">Notes AI Agent</h1>
					<p className="text-slate-400">
						Your intelligent note-taking companion
					</p>
				</div>

				<Card className="w-full max-w-md border-slate-700/50 bg-slate-900/50 backdrop-blur-sm">
					<CardHeader className="space-y-1">
						<Tabs
							value={activeTab}
							onValueChange={setActiveTab}
							className="w-full"
						>
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
											<Button disabled={loginMutation.isPending} type="submit">
												{loginMutation.isPending ? "Logging in..." : "Login"}
											</Button>
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
													{
														registerForm.formState.errors.confirmPassword
															.message
													}
												</p>
											)}
										</div>
										<Button
											disabled={registerMutation.isPending}
											type="submit"
											className="w-full"
										>
											{registerMutation.isPending ? "Signing up..." : "Sign Up"}
										</Button>
									</form>
								</CardContent>
							</TabsContent>
						</Tabs>
					</CardHeader>
				</Card>
			</div>
			<Dialog
				open={showVerificationModal}
				onOpenChange={handleCloseVerificationModal}
			>
				<DialogContent className="bg-slate-900 text-white border-slate-700">
					<DialogHeader>
						<DialogTitle className="text-xl font-bold">
							Verify Your Email
						</DialogTitle>
						<DialogDescription className="text-slate-300 pt-4">
							<p className="mb-4">
								We've sent a verification link to your email address. Please
								check your inbox and click the link to activate your account.
							</p>
							<p className="mb-4">
								If you don't see the email, please check your spam or junk
								folder.
							</p>
							<Button onClick={handleCloseVerificationModal} className="w-full">
								Got it!
							</Button>
						</DialogDescription>
					</DialogHeader>
				</DialogContent>
			</Dialog>
		</>
	);
}
