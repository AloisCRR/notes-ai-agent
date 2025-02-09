import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";

export default function NotFound() {
	const navigate = useNavigate();

	return (
		<div className="min-h-screen flex flex-col items-center justify-center bg-background">
			<div className="container px-4 md:px-6 flex flex-col items-center text-center space-y-4">
				<div className="space-y-2">
					<h1 className="text-9xl font-bold tracking-tighter text-primary">
						404
					</h1>
					<h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
						Page not found
					</h2>
					<p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed">
						We couldn't find the page you were looking for. It might have been
						removed or doesn't exist.
					</p>
				</div>
				<div className="flex flex-col gap-2 min-[400px]:flex-row justify-center">
					<Button
						onClick={() => navigate({ to: "/" })}
						className="gap-2"
						size="lg"
					>
						Go to Home
					</Button>
					<Button
						variant="outline"
						onClick={() => window.history.back()}
						className="gap-2"
						size="lg"
					>
						Go Back
					</Button>
				</div>
			</div>
		</div>
	);
}
