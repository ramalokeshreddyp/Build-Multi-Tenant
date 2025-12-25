import { useState } from "react";
import { useRoute, Link } from "wouter";
import { Layout } from "@/components/Layout";
import { useProject } from "@/hooks/use-projects";
import { useTasks } from "@/hooks/use-tasks";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertTaskSchema } from "@shared/schema";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Plus, CheckCircle2, Circle, Clock, ArrowLeft, MoreHorizontal, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

const createTaskSchema = insertTaskSchema.omit({ tenantId: true });

export default function ProjectDetails() {
  const [, params] = useRoute("/projects/:id");
  const projectId = params?.id!;
  const { data: project, isLoading: isLoadingProject } = useProject(projectId);
  const { tasks, createTask, updateTask, deleteTask, isCreating } = useTasks(projectId);
  const [open, setOpen] = useState(false);

  const form = useForm<z.infer<typeof createTaskSchema>>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: "medium",
      status: "todo",
      projectId: projectId
    }
  });

  const onSubmit = (data: z.infer<typeof createTaskSchema>) => {
    createTask(data, {
      onSuccess: () => {
        setOpen(false);
        form.reset({ title: "", description: "", priority: "medium", status: "todo", projectId });
      }
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-500 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-500 bg-gray-50 border-gray-200';
    }
  };

  if (isLoadingProject) {
    return (
      <Layout>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
          <div className="grid grid-cols-3 gap-4 mt-8">
            {[1, 2, 3].map(i => <div key={i} className="h-48 bg-muted rounded-xl"></div>)}
          </div>
        </div>
      </Layout>
    );
  }

  if (!project) return <Layout><div>Project not found</div></Layout>;

  return (
    <Layout>
      <div className="mb-8">
        <Link href="/projects" className="text-sm text-muted-foreground hover:text-primary flex items-center mb-4 transition-colors">
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to Projects
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground mb-2">{project.name}</h1>
            <p className="text-muted-foreground max-w-2xl">{project.description}</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" /> Add Task
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>New Task</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Task Title</FormLabel>
                        <FormControl><Input placeholder="Implement login flow" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="priority"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Priority</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select priority" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                          </SelectContent>
                        </Select>
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
                          <Textarea placeholder="Task details..." {...field} value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={isCreating}>
                    {isCreating ? "Adding..." : "Add Task"}
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
        {['todo', 'in_progress', 'completed'].map((status) => {
          const statusTasks = tasks?.filter(t => t.status === status) || [];
          return (
            <div key={status} className="bg-muted/30 p-4 rounded-xl border border-border/50 min-h-[500px]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold capitalize text-muted-foreground flex items-center gap-2">
                  <span className={cn(
                    "w-2 h-2 rounded-full",
                    status === 'todo' ? 'bg-gray-400' : 
                    status === 'in_progress' ? 'bg-blue-500' : 'bg-green-500'
                  )} />
                  {status.replace('_', ' ')}
                  <span className="text-xs bg-muted px-2 py-0.5 rounded-full border">{statusTasks.length}</span>
                </h3>
              </div>
              
              <div className="space-y-3">
                {statusTasks.map((task) => (
                  <Card key={task.id} className="shadow-sm hover:shadow-md transition-all border-border/60 group">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <Badge variant="outline" className={cn("capitalize text-xs font-normal", getPriorityColor(task.priority))}>
                          {task.priority}
                        </Badge>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                           <Button 
                             variant="ghost" 
                             size="icon" 
                             className="h-6 w-6 text-muted-foreground hover:text-destructive"
                             onClick={() => deleteTask(task.id)}
                           >
                             <Trash2 className="h-3 w-3" />
                           </Button>
                        </div>
                      </div>
                      <h4 className="font-medium text-sm mb-1 leading-snug">{task.title}</h4>
                      {task.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{task.description}</p>
                      )}
                      
                      <div className="flex gap-2 mt-2">
                        {status !== 'todo' && (
                           <Button 
                             variant="outline" 
                             size="sm" 
                             className="h-6 text-xs px-2 w-full"
                             onClick={() => updateTask({ id: task.id, status: 'todo' })}
                           >
                             To Do
                           </Button>
                        )}
                        {status !== 'in_progress' && (
                           <Button 
                             variant="outline" 
                             size="sm" 
                             className="h-6 text-xs px-2 w-full"
                             onClick={() => updateTask({ id: task.id, status: 'in_progress' })}
                           >
                             Progress
                           </Button>
                        )}
                        {status !== 'completed' && (
                           <Button 
                             variant="outline" 
                             size="sm" 
                             className="h-6 text-xs px-2 w-full"
                             onClick={() => updateTask({ id: task.id, status: 'completed' })}
                           >
                             Done
                           </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {statusTasks.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground text-xs italic border-2 border-dashed border-muted rounded-lg">
                    No tasks
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Layout>
  );
}
