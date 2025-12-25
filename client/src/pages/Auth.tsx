import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation, Link } from "wouter";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Layers, ArrowRight, CheckCircle2 } from "lucide-react";
import { loginSchema, registerTenantSchema } from "@shared/schema";

export function LoginPage() {
  const { login, isLoggingIn } = useAuth();
  const [, setLocation] = useLocation();

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = (data: z.infer<typeof loginSchema>) => {
    login(data, {
      onSuccess: () => setLocation("/dashboard"),
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/20 p-4">
      <div className="w-full max-w-md animate-enter">
        <div className="text-center mb-8">
          <div className="inline-flex h-12 w-12 rounded-xl bg-primary items-center justify-center shadow-xl shadow-primary/25 mb-4">
            <Layers className="h-6 w-6 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-display font-bold text-foreground">Welcome back</h1>
          <p className="text-muted-foreground mt-2">Sign in to your workspace</p>
        </div>

        <Card className="p-6 border-border/50 shadow-xl shadow-black/5 bg-card/80 backdrop-blur-sm">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email address</FormLabel>
                    <FormControl>
                      <Input placeholder="name@company.com" className="bg-background/50" {...field} />
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
                      <Input type="password" placeholder="••••••••" className="bg-background/50" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full font-semibold" disabled={isLoggingIn}>
                {isLoggingIn ? "Signing in..." : "Sign in"}
              </Button>
            </form>
          </Form>
        </Card>
        
        <p className="text-center mt-6 text-sm text-muted-foreground">
          Don't have a workspace?{" "}
          <Link href="/register" className="text-primary font-medium hover:underline">Create one</Link>
        </p>
      </div>
    </div>
  );
}

export function RegisterPage() {
  const { register, isRegistering } = useAuth();
  const [, setLocation] = useLocation();

  const form = useForm<z.infer<typeof registerTenantSchema>>({
    resolver: zodResolver(registerTenantSchema),
    defaultValues: {
      tenantName: "",
      subdomain: "",
      adminName: "",
      adminEmail: "",
      adminPassword: "",
    },
  });

  const onSubmit = (data: z.infer<typeof registerTenantSchema>) => {
    register(data, {
      onSuccess: () => setLocation("/dashboard"),
    });
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-background">
      {/* Left Panel - Marketing */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-primary p-12 text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent opacity-50" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 right-0 w-64 h-64 bg-accent/30 rounded-full blur-3xl" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-8">
            <div className="h-8 w-8 rounded-lg bg-white/20 flex items-center justify-center">
              <Layers className="h-5 w-5 text-white" />
            </div>
            <span className="font-display font-bold text-xl tracking-tight">NexTask</span>
          </div>
        </div>

        <div className="relative z-10 max-w-lg">
          <h2 className="text-5xl font-display font-bold mb-6 leading-tight">Manage your team with clarity.</h2>
          <p className="text-primary-foreground/80 text-lg mb-8">
            Join thousands of teams that use NexTask to plan, track, and release great software.
          </p>
          <div className="space-y-4">
            {[
              "Unlimited projects and tasks",
              "Real-time collaboration", 
              "Advanced analytics & reporting",
              "Enterprise-grade security"
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-accent-foreground" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 text-sm text-primary-foreground/60">
          © 2024 NexTask Inc. All rights reserved.
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-4 lg:p-12 overflow-y-auto">
        <div className="w-full max-w-lg animate-enter">
          <div className="mb-8">
            <h1 className="text-3xl font-display font-bold text-foreground">Create your workspace</h1>
            <p className="text-muted-foreground mt-2">Get started with a 14-day free trial.</p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="tenantName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Name</FormLabel>
                      <FormControl><Input placeholder="Acme Inc." {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="subdomain"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subdomain</FormLabel>
                      <FormControl>
                        <div className="flex">
                          <Input placeholder="acme" className="rounded-r-none border-r-0" {...field} />
                          <div className="bg-muted px-3 py-2 border border-l-0 rounded-r-md text-sm text-muted-foreground flex items-center">.nextask.com</div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-4 pt-2">
                <h3 className="text-sm font-semibold text-foreground border-b pb-2">Admin Account</h3>
                <FormField
                  control={form.control}
                  name="adminName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl><Input placeholder="John Doe" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="adminEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Work Email</FormLabel>
                      <FormControl><Input placeholder="john@acme.com" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="adminPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl><Input type="password" placeholder="Min. 8 characters" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button type="submit" size="lg" className="w-full mt-4 gap-2" disabled={isRegistering}>
                {isRegistering ? "Creating Workspace..." : (
                  <>Get Started <ArrowRight className="h-4 w-4" /></>
                )}
              </Button>
            </form>
          </Form>

          <p className="text-center mt-6 text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-primary font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
