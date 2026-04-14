"use client"
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Bot, CreditCard, LayoutDashboard, Plus, Presentation, GitBranch } from "lucide-react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import useProject from "@/hooks/use-project";
import useRefetch from "@/hooks/use-refetch";

const items = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Q&A",
    url: "/qa",
    icon: Bot,
  },
  {
    title: "Meetings",
    url: "/meetings",
    icon: Presentation,
  },
  {
    title: "Billing",
    url: "/billing",
    icon: CreditCard,
  },
];



export function AppSidebar() {
  const pathname = usePathname();
  const { projects, projectId, setProjectId } = useProject()
  const refetch = useRefetch();
  const { open } = useSidebar();
  return (
    <Sidebar collapsible="icon" variant="floating">
      <SidebarHeader>
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/20">
            <GitBranch className="h-5 w-5 text-white" />
          </div>

          {open && (
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              GitVizor
            </h1>)}

        </div>


      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link
                      href={item.url}
                      className={cn(
                        {
                          "!bg-primary !text-primary-foreground shadow-md shadow-primary/20": pathname === item.url,
                        },
                        "list-none flex items-center gap-2 rounded-lg transition-all duration-200"
                      )}
                    >
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>


        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
            Your Projects
          </SidebarGroupLabel>
          <SidebarMenu>
            {projects?.map(project => {
              return (
                <SidebarMenuItem key={project.name}>
                  <SidebarMenuButton asChild>
                    <div className="cursor-pointer" onClick={() => {
                      setProjectId(project.id)
                    }}>
                      <div className={cn('rounded-md border border-border/40 size-6 flex items-center justify-center text-sm bg-background/60 text-foreground font-medium transition-all',
                        { 'bg-primary text-primary-foreground border-primary/30 shadow-sm shadow-primary/20': project.id === projectId }
                      )}>
                        {project.name[0]}

                      </div>
                      <span>{project.name}</span>
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>

              )
            })}

            <div className="h-2"></div>

            {open && (
              <SidebarMenuItem>
                <Link href="/create">
                  <Button size='sm' variant="outline" className="w-fit border-dashed border-border/40 hover:border-primary/30 hover:bg-primary/5 transition-all">
                    <Plus />
                    Create project
                  </Button>
                </Link>
              </SidebarMenuItem>
            )}

          </SidebarMenu>

        </SidebarGroup>



      </SidebarContent>
    </Sidebar>
  );
}
