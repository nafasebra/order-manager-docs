import { useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff } from "lucide-react";
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
import { setSession } from "@/lib/auth/store";
import { demoAccounts, sessionHome } from "@/lib/auth/demo";
import { template } from "@/config/template";
import type { ActorType } from "@/types";

const schema = z.object({
  panel: z.enum(["staff", "seller", "buyer"]),
  email: z.string().email(),
  password: z.string().min(1, "Password is required"),
});

type FormValues = z.infer<typeof schema>;

function credentialsFor(panel: ActorType) {
  const account = demoAccounts.find((item) => item.panel === panel)!;
  return template.demo
    ? { email: account.email, password: account.password }
    : { email: "", password: "" };
}

type LoginPageProps = {
  defaultPanel?: ActorType;
};

export function LoginPage({ defaultPanel = "staff" }: LoginPageProps) {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      panel: defaultPanel,
      ...credentialsFor(defaultPanel),
    },
  });
  const { reset } = form;

  useEffect(() => {
    reset({ panel: defaultPanel, ...credentialsFor(defaultPanel) });
    setError(null);
  }, [defaultPanel, reset]);

  async function onSubmit(values: FormValues) {
    setError(null);
    try {
      const user = await login(values.panel, {
        email: values.email,
        password: values.password,
      });
      setSession(user);
      await navigate({ to: sessionHome(user) });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not sign in.");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-[28px] font-semibold">
            {template.brand}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Sign in to Admin, Seller, or Buyer.
          </p>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="panel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Panel</FormLabel>
                    <Select
                      onValueChange={(panel: ActorType) => {
                        field.onChange(panel);
                        form.reset({ panel, ...credentialsFor(panel) });
                        setError(null);
                        void navigate({
                          to: "/auth/login",
                          search: { panel },
                          replace: true,
                        });
                      }}
                      value={field.value}
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
              {template.demo && form.watch("panel") === "staff" && (
                <div className="space-y-2">
                  <label htmlFor="demo-staff" className="text-sm font-medium">
                    Demo staff account
                  </label>
                  <select
                    id="demo-staff"
                    className="h-10 w-full rounded-md border bg-background px-3"
                    value={
                      demoAccounts.find(
                        (account) => account.email === form.watch("email"),
                      )?.key ?? ""
                    }
                    onChange={(event) => {
                      const account = demoAccounts.find(
                        (item) => item.key === event.target.value,
                      );
                      if (account)
                        form.reset({
                          panel: "staff",
                          email: account.email,
                          password: account.password,
                        });
                    }}
                  >
                    <option value="" disabled>
                      Choose demo account
                    </option>
                    {demoAccounts
                      .filter((account) => account.panel === "staff")
                      .map((account) => (
                        <option key={account.key} value={account.key}>
                          {account.label}
                        </option>
                      ))}
                  </select>
                </div>
              )}
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
                    <div className="relative">
                      <FormControl>
                        <Input
                          type={showPassword ? "text" : "password"}
                          autoComplete="current-password"
                          className="pr-10"
                          {...field}
                        />
                      </FormControl>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-9 w-9 text-muted-foreground"
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                        aria-pressed={showPassword}
                        onClick={() => setShowPassword((visible) => !visible)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" aria-hidden />
                        ) : (
                          <Eye className="h-4 w-4" aria-hidden />
                        )}
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {template.demo && (
                <p className="text-xs text-muted-foreground">
                  Demo credentials are prefilled. No backend is required.
                </p>
              )}
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
