import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { login } from "@/lib/auth/session";
import { ApiClientError } from "@/lib/api/client";
import type { ActorType } from "@/types";

const schema = z.object({
  panel: z.enum(["staff", "seller", "buyer"]),
  email: z.string().email(),
  password: z.string().min(1, "Password is required"),
});

type FormValues = z.infer<typeof schema>;

const panelToPath: Record<ActorType, string> = {
  staff: "/admin",
  seller: "/seller",
  buyer: "/account",
};

type LoginPageProps = {
  defaultPanel?: ActorType;
  onSession?: (panel: ActorType) => void;
};

export function LoginPage({
  defaultPanel = "staff",
  onSession,
}: LoginPageProps) {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      panel: defaultPanel,
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: FormValues) {
    setError(null);
    try {
      await login(values.panel, {
        email: values.email,
        password: values.password,
      });
      onSession?.(values.panel);
      await navigate({ to: panelToPath[values.panel] });
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError("Invalid credentials for this panel.");
      } else {
        // Scaffold: allow local navigation without API
        onSession?.(values.panel);
        await navigate({ to: panelToPath[values.panel] });
      }
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-[28px] font-semibold">
            Clean Commerce
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Sign in to Admin, Seller, or Buyer.
          </p>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="panel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Panel</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select panel" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="staff">Staff (Admin)</SelectItem>
                        <SelectItem value="seller">Seller</SelectItem>
                        <SelectItem value="buyer">Buyer</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" autoComplete="username" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        autoComplete="current-password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {error ? (
                <p className="text-sm text-destructive" role="alert">
                  {error}
                </p>
              ) : null}
              <Button type="submit" className="w-full">
                Sign in
              </Button>
            </form>
          </Form>
          <p className="mt-4 text-center text-xs text-muted-foreground">
            <Link to="/auth/session-expired" className="underline">
              Session expired?
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
