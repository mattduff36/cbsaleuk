"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";

export default function Login() {
  const router = useRouter();
  const { login, isLoading } = useAuth();
  const { toast } = useToast();
  const [username, setUsername] = useState("organiser@example.com");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(username, password);
      toast({
        title: "Welcome back!",
        description: "You have successfully logged in.",
      });
      router.push("/dashboard");
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message || "Please check your credentials and try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <section className="px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-md rounded-[2rem] border border-brand-brown/10 bg-white p-8 shadow-field">
        <div className="text-xs uppercase tracking-[0.18em] text-brand-brown/60">
          Sign in
        </div>
        <h1 className="font-heading mt-3 text-5xl font-semibold text-brand-ink">
          Welcome back
        </h1>
        <p className="mt-4 text-sm leading-7 text-brand-brown/80">
          Sign in to manage organiser listings, premium subscription state, and admin
          moderation if you have access.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Email or username</Label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="you@example.com"
              className="h-12 rounded-2xl"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="h-12 rounded-2xl"
              required
            />
          </div>
          <Button
            type="submit"
            className="w-full rounded-full bg-brand-ink text-white hover:bg-brand-brown"
            disabled={isLoading}
          >
            {isLoading ? "Signing in..." : "Sign in"}
          </Button>
        </form>

        <div className="mt-6 rounded-[1.25rem] bg-brand-cream p-4 text-sm leading-7 text-brand-brown/75">
          Demo accounts:
          <br />
          `organiser@example.com` / `bootsale123`
          <br />
          `matt@example.com` / `bootsale123`
        </div>

        <div className="mt-6 text-center text-sm text-brand-brown/75">
          Need an account?{" "}
          <Link href="/register" className="font-semibold text-brand-ink underline-offset-4 hover:underline">
            Create organiser access
          </Link>
        </div>
      </div>
    </section>
  );
}
