"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Gauge,
  Wallet,
  Plus,
  Video,
  GitBranch,
  Library,
  Sparkles,
  CheckCircle2,
  Settings,
} from "lucide-react";
import { usePathname } from "next/navigation";
import useProject from "@/hooks/use-project";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const navItems = [
  { title: "Dashboard", url: "/dashboard", icon: Gauge,     description: "Project overview & commits" },
  { title: "Q&A",       url: "/qa",        icon: Sparkles,  description: "Ask about your codebase"   },
  { title: "Meetings",  url: "/meetings",  icon: Video,     description: "Meeting summaries & issues" },
  { title: "Guide",     url: "/guide",     icon: Library,   description: "Living codebase guide"      },
  { title: "Billing",   url: "/billing",   icon: Wallet,    description: "Credits & subscription"     },
  { title: "Settings",  url: "/settings",  icon: Settings,  description: "Sharing & preferences"      },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { projects, projectId, setProjectId, project } = useProject();
  const { open } = useSidebar();

  return (
    <TooltipProvider delayDuration={200}>
      <Sidebar collapsible="icon" variant="floating">

        {/* ─── Brand ─────────────────────────────────────────────────────── */}
        <SidebarHeader className="p-3 pb-2">
          <div className={cn("flex items-center", open ? "gap-3" : "justify-center")}>
            {/* Logo mark */}
            <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
              <GitBranch className="w-[18px] h-[18px] text-primary-foreground" strokeWidth={2.5} />
            </div>
            {open && (
              <div className="min-w-0">
                <p className="text-[13px] font-bold tracking-tight leading-none">GitVizor</p>
                <p className="text-[10px] text-muted-foreground/50 mt-0.5">Code intelligence</p>
              </div>
            )}
          </div>
        </SidebarHeader>

        <SidebarSeparator className="opacity-20 mx-3" />

        <SidebarContent className="gap-0 px-2 pt-1">

          {/* ─── Navigation ──────────────────────────────────────────────── */}
          <SidebarGroup className="p-0 py-2">
            {open && (
              <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-muted-foreground/40 px-2 mb-1.5">
                Menu
              </p>
            )}
            <SidebarMenu className="gap-0.5">
              {navItems.map((item) => {
                const isActive = pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <SidebarMenuButton asChild>
                          <Link
                            href={item.url}
                            className={cn(
                              "relative flex items-center rounded-xl transition-all duration-150",
                              open ? "gap-3 px-2.5 py-2" : "justify-center p-2.5",
                              isActive
                                ? "bg-primary/10 text-primary border border-primary/20 shadow-sm shadow-primary/10"
                                : "text-muted-foreground/70 hover:text-foreground hover:bg-white/5"
                            )}
                          >
                            {/* Active pill */}
                            {isActive && open && (
                              <span className="absolute left-0 inset-y-2 w-[3px] rounded-r-full bg-primary" />
                            )}

                            {/* Icon container */}
                            <div className={cn(
                              "flex-shrink-0 flex items-center justify-center rounded-lg transition-all",
                              open ? "w-7 h-7" : "w-8 h-8",
                              isActive
                                ? "bg-primary/20"
                                : "bg-muted/40 group-hover:bg-muted/70"
                            )}>
                              <item.icon
                                className={cn(
                                  "transition-colors",
                                  open ? "w-[15px] h-[15px]" : "w-4 h-4",
                                  isActive ? "text-primary" : "text-muted-foreground/60"
                                )}
                                strokeWidth={isActive ? 2.5 : 1.75}
                              />
                            </div>

                            {open && (
                              <span className={cn(
                                "text-[13px] font-medium truncate",
                                isActive ? "text-primary" : ""
                              )}>
                                {item.title}
                              </span>
                            )}
                          </Link>
                        </SidebarMenuButton>
                      </TooltipTrigger>
                      {!open && (
                        <TooltipContent side="right" className="flex flex-col gap-0.5 ml-1">
                          <span className="font-semibold text-[13px]">{item.title}</span>
                          <span className="text-[11px] text-muted-foreground">{item.description}</span>
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroup>

          <SidebarSeparator className="opacity-20 mx-0" />

          {/* ─── Projects ────────────────────────────────────────────────── */}
          <SidebarGroup className="p-0 py-2 flex-1">
            {open && (
              <div className="flex items-center justify-between px-2 mb-1.5">
                <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-muted-foreground/40">
                  Projects
                </p>
                {projects && projects.length > 0 && (
                  <span className="text-[10px] text-muted-foreground/30 tabular-nums">
                    {projects.length}
                  </span>
                )}
              </div>
            )}

            <SidebarMenu className="gap-0.5">
              {/* Project items */}
              {projects?.map((proj) => {
                const isSelected = proj.id === projectId;
                const initial = (proj.name[0] ?? "?").toUpperCase();

                return (
                  <SidebarMenuItem key={proj.id}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <SidebarMenuButton asChild>
                          <div
                            role="button"
                            tabIndex={0}
                            onClick={() => setProjectId(proj.id)}
                            onKeyDown={(e) => e.key === "Enter" && setProjectId(proj.id)}
                            className={cn(
                              "group flex items-center rounded-xl cursor-pointer transition-all duration-150",
                              open ? "gap-2.5 px-2 py-1.5" : "justify-center p-1.5",
                              isSelected
                                ? "bg-primary/10 border border-primary/20"
                                : "hover:bg-white/5"
                            )}
                          >
                            {/* Avatar */}
                            <div className={cn(
                              "relative flex-shrink-0 flex items-center justify-center rounded-lg font-bold transition-all",
                              open ? "w-7 h-7 text-[11px]" : "w-8 h-8 text-[13px]",
                              isSelected
                                ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
                                : "bg-muted/50 text-muted-foreground/70 border border-border/30"
                            )}>
                              {initial}
                              {isSelected && (
                                <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-emerald-400 rounded-full border-2 border-sidebar" />
                              )}
                            </div>

                            {open && (
                              <>
                                <div className="flex-1 min-w-0">
                                  <p className={cn(
                                    "text-[12px] font-medium truncate leading-snug",
                                    isSelected ? "text-foreground" : "text-muted-foreground/80 group-hover:text-foreground"
                                  )}>
                                    {proj.name}
                                  </p>
                                  {isSelected && (
                                    <p className="text-[10px] text-primary/80 leading-none mt-0.5">
                                      Active
                                    </p>
                                  )}
                                </div>
                                {isSelected && (
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                                )}
                              </>
                            )}
                          </div>
                        </SidebarMenuButton>
                      </TooltipTrigger>
                      {!open && (
                        <TooltipContent side="right" className="ml-1">
                          <span className="font-semibold">{proj.name}</span>
                          {isSelected && (
                            <span className="ml-1.5 text-emerald-400 text-xs">● Active</span>
                          )}
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </SidebarMenuItem>
                );
              })}

              {/* New project CTA */}
              <SidebarMenuItem className="mt-0.5">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <SidebarMenuButton asChild>
                      <Link
                        href="/create"
                        className={cn(
                          "group flex items-center rounded-xl transition-all duration-150",
                          open ? "gap-2.5 px-2 py-1.5" : "justify-center p-1.5",
                          "border border-dashed border-border/30 text-muted-foreground/40",
                          "hover:border-primary/30 hover:text-primary/80 hover:bg-primary/5"
                        )}
                      >
                        <div className={cn(
                          "flex-shrink-0 flex items-center justify-center rounded-lg border border-dashed border-current transition-all",
                          open ? "w-7 h-7" : "w-8 h-8"
                        )}>
                          <Plus className={cn(open ? "w-3 h-3" : "w-3.5 h-3.5")} strokeWidth={2} />
                        </div>
                        {open && (
                          <span className="text-[12px] font-medium">New project</span>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </TooltipTrigger>
                  {!open && (
                    <TooltipContent side="right" className="ml-1">New project</TooltipContent>
                  )}
                </Tooltip>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>

        {/* ─── Footer ──────────────────────────────────────────────────────── */}
        {open && (
          <SidebarFooter className="p-3 pt-0">
            <SidebarSeparator className="opacity-20 mb-2" />
            <div className="flex items-center gap-2 px-1 py-1">
              <div className="w-5 h-5 rounded-md bg-primary/15 border border-primary/20 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-2.5 h-2.5 text-primary" />
              </div>
              <p className="text-[10px] text-muted-foreground/40 truncate">
                {project
                  ? `${project.name} · ${projects?.length ?? 0} workspace${(projects?.length ?? 0) !== 1 ? "s" : ""}`
                  : "No project selected"}
              </p>
            </div>
          </SidebarFooter>
        )}

      </Sidebar>
    </TooltipProvider>
  );
}
