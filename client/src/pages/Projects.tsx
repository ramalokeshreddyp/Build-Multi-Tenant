import { useState } from "react";
import { Layout } from "@/components/Layout";
import { useProjects } from "@/hooks/use-projects";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertProjectSchema } from "@shared/schema";
import { z } from "zod";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Plus, FolderKanban, MoreHorizontal, Calendar } from "lucide-react";
import { format } from "date-fns";

const createSchema = insertProjectSchema.omit({ tenantId: true, createdBy: true });

export default function Projects() {
  const { projects, createProject, isCreating } = useProjects();
  const [open, setOpen] = useState(false);

  const form = useForm<z.infer<typeof createSchema>>({
    resolver: zodResolver(createSchema),
    defaultValues: {
      name: "",
      description: "",
      status: "active"
    }
  });

  const onSubmit = (data: z.infer<typeof createSchema>) => {
    createProject(data, {
      onSuccess: () => {
        setOpen(false);
        form.reset();
      }
    });
  };

  return (
    <Layout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Projects</h1>
          <p className="text-muted-foreground">Manage your team's initiatives</p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all">
              <Plus className="h-4 w-4 mr-2" /> New Project
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Project</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Name</FormLabel>
                      <FormControl><Input placeholder="Website Redesign" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Brief details about the project..." {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isCreating}>
                  {isCreating ? "Creating..." : "Create Project"}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects?.map((project) => (
          <Link key={project.id} href={`/projects/${project.id}`}>
            <Card className="group hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer h-full flex flex-col">
              <CardHeader className="flex flex-row items-start justify-between pb-2">
                <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-600">
                  <FolderKanban className="h-5 w-5" />
                </div>
                <div className="px-2 py-1 rounded-md bg-muted text-xs font-medium uppercase tracking-wider">
                  {project.status}
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">{project.name}</h3>
                <p className="text-muted-foreground text-sm line-clamp-2">{project.description}</p>
              </CardContent>
              <CardFooter className="border-t pt-4 text-xs text-muted-foreground flex items-center gap-2">
                <Calendar className="h-3 w-3" />
                Created {format(new Date(project.createdAt), 'MMM d, yyyy')}
              </CardFooter>
            </Card>
          </Link>
        ))}
      </div>
      
      {projects?.length === 0 && (
        <div className="text-center py-16 bg-muted/20 rounded-2xl border-2 border-dashed border-muted-foreground/20">
          <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <FolderKanban className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold">No projects yet</h3>
          <p className="text-muted-foreground mb-4">Create your first project to get started</p>
          <Button variant="outline" onClick={() => setOpen(true)}>Create Project</Button>
        </div>
      )}
    </Layout>
  );
}
