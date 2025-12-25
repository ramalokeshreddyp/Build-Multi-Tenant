import { Layout } from "@/components/Layout";
import { useAuth } from "@/hooks/use-auth";
import { useProjects } from "@/hooks/use-projects";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Clock, FolderKanban, CheckCircle2 } from "lucide-react";
import { Link } from "wouter";
import { format } from "date-fns";

export default function Dashboard() {
  const { user } = useAuth();
  const { projects } = useProjects();

  const StatCard = ({ title, value, icon: Icon, color }: any) => (
    <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${color}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold font-display">{value}</div>
      </CardContent>
    </Card>
  );

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, {user?.fullName}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard title="Active Projects" value={projects?.length || 0} icon={FolderKanban} color="text-blue-500" />
        <StatCard title="Pending Tasks" value="12" icon={Clock} color="text-yellow-500" />
        <StatCard title="Completed" value="24" icon={CheckCircle2} color="text-green-500" />
        <StatCard title="Activity" value="+24%" icon={Activity} color="text-purple-500" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-2 border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle>Recent Projects</CardTitle>
          </CardHeader>
          <CardContent>
            {projects?.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No projects yet. <Link href="/projects" className="text-primary hover:underline">Create one?</Link>
              </div>
            ) : (
              <div className="space-y-4">
                {projects?.slice(0, 3).map((project) => (
                  <Link key={project.id} href={`/projects/${project.id}`}>
                    <div className="flex items-center justify-between p-4 rounded-xl border border-border/50 bg-background hover:bg-muted/30 transition-colors cursor-pointer group">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                          <FolderKanban className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium">{project.name}</p>
                          <p className="text-sm text-muted-foreground line-clamp-1">{project.description || "No description"}</p>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground font-medium bg-muted px-2 py-1 rounded-md">
                        {project.status}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
          <CardHeader>
            <CardTitle className="text-white">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/projects">
              <div className="p-3 bg-white/10 rounded-lg hover:bg-white/20 transition-colors cursor-pointer flex items-center gap-2 text-sm font-medium mb-2">
                <FolderKanban className="h-4 w-4" /> Create New Project
              </div>
            </Link>
            <div className="p-3 bg-white/10 rounded-lg hover:bg-white/20 transition-colors cursor-pointer flex items-center gap-2 text-sm font-medium">
              <Users className="h-4 w-4" /> Invite Team Member
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
