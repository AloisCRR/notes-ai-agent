import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";

export default function Access() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");

	const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		console.log("Logging in with", { email, password });
	};

	const handleSignUp = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (password !== confirmPassword) {
			alert("Passwords do not match!");
			return;
		}
		console.log("Signing up with", { email, password });
	};

	return (
		<div className="min-h-screen flex items-center justify-center p-4 bg-background">
			<Card className="w-full max-w-md">
				<CardHeader>
					<Tabs defaultValue="login" className="w-full">
						<TabsList className="grid w-full grid-cols-2">
							<TabsTrigger value="login">Login</TabsTrigger>
							<TabsTrigger value="register">Register</TabsTrigger>
						</TabsList>
						<TabsContent value="login">
							<CardContent className="pt-6">
								<form onSubmit={handleLogin} className="space-y-4">
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
											required
											value={email}
											onChange={(e) => setEmail(e.target.value)}
										/>
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
											required
											value={password}
											onChange={(e) => setPassword(e.target.value)}
										/>
									</div>
									<div className="flex justify-between items-center">
										<Button type="submit">Login</Button>
										<Button variant="link" className="text-sm">
											Forgot Password?
										</Button>
									</div>
								</form>
							</CardContent>
						</TabsContent>
						<TabsContent value="register">
							<CardContent className="pt-6">
								<form onSubmit={handleSignUp} className="space-y-4">
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
											required
											value={email}
											onChange={(e) => setEmail(e.target.value)}
										/>
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
											required
											value={password}
											onChange={(e) => setPassword(e.target.value)}
										/>
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
											required
											value={confirmPassword}
											onChange={(e) => setConfirmPassword(e.target.value)}
										/>
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
