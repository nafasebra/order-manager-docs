"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { useSession } from "@/lib/session";

export default function SignupPage() {
  const { signup, user } = useSession();
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!displayName.trim()) {
      setError("Enter your name.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setError("Enter a valid email address.");
      return;
    }
    if (!password || password.length < 4) {
      setError("Password must be at least 4 characters (mock).");
      return;
    }
    signup(email.trim(), displayName.trim());
    router.push("/");
  }

  if (user) {
    return (
      <div className="mx-auto max-w-md space-y-4 rounded-lg border border-border bg-card p-8 text-center">
        <h1 className="text-xl font-semibold">You are signed in</h1>
        <p className="text-sm text-muted-foreground">
          Signed in as {user.displayName} ({user.email}).
        </p>
        <Link
          href="/"
          className="inline-flex h-9 items-center rounded-sm bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Continue shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md space-y-6">
      <div className="space-y-1 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Sign up</h1>
        <p className="text-sm text-muted-foreground">
          Create a mock buyer account stored in this browser
        </p>
      </div>

      <form
        onSubmit={onSubmit}
        className="space-y-4 rounded-md border border-border bg-card p-6"
      >
        <label className="block space-y-1">
          <span className="text-xs font-medium">Full name</span>
          <input
            autoComplete="name"
            required
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="h-9 w-full rounded-sm border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </label>
        <label className="block space-y-1">
          <span className="text-xs font-medium">Email</span>
          <input
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-9 w-full rounded-sm border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </label>
        <label className="block space-y-1">
          <span className="text-xs font-medium">Password</span>
          <input
            type="password"
            autoComplete="new-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-9 w-full rounded-sm border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </label>

        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}

        <button
          type="submit"
          className="h-10 w-full rounded-sm bg-primary text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Create account
        </button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
