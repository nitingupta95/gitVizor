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
import { Bot, CreditCard, LayoutDashboard, Plus, Presentation } from "lucide-react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import Image from "next/image";
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
        <div className="flex items-center gap-2">
          <Image
            src="https://drive.google.com/uc?export=view&id=1nJ9nw232rt8o9QGSK3suuX1PtHBFszdQ"
            alt="logo"
            width={40}
            height={40}
            className="rounded-full"
          />

          {open && (
            <h1 className="text-xl font-bold text-primary/80">
              GitVizor
            </h1>)}

        </div>


      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link
                      href={item.url}
                      className={cn(
                        {
                          "!bg-primary !text-white": pathname === item.url,
                        },
                        "list-none flex items-center gap-2"
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
          <SidebarGroupLabel>
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
                      <div className={cn('rouned-sm border border-border size-6 flex items-center justify-center text-sm bg-background text-foreground',
                        { 'bg-primary text-primary-foreground': project.id === projectId }
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
                  <Button size='sm' variant="outline" className="w-fit">
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
