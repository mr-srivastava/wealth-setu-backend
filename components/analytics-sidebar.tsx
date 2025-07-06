"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  BarChart3, 
  Building2, 
  DollarSign, 
  TrendingUp, 
  Package, 
  Settings,
  Home,
  PieChart
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const navigation = [
  {
    name: "Overview",
    href: "/",
    icon: Home,
    description: "Dashboard overview"
  },
  {
    name: "Recent Commissions",
    href: "/recent-commissions",
    icon: DollarSign,
    description: "Latest commission entries"
  },
  {
    name: "Partners",
    href: "/partners",
    icon: Building2,
    description: "Partner analysis"
  },
  {
    name: "Product Types",
    href: "/product-types",
    icon: Package,
    description: "Product type breakdown"
  },
  {
    name: "Performance",
    href: "/performance",
    icon: TrendingUp,
    description: "Performance metrics"
  },
  {
    name: "Analytics",
    href: "/analytics",
    icon: BarChart3,
    description: "Detailed analytics"
  },
  {
    name: "Reports",
    href: "/reports",
    icon: PieChart,
    description: "Custom reports"
  },
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
    description: "Account settings"
  }
];

export function AnalyticsSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-4 py-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Analytics</h2>
            <p className="text-sm text-muted-foreground">Commission tracking</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link href={item.href}>
                        <item.icon className="w-4 h-4" />
                        <span>{item.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="p-4">
          <div className="text-xs text-muted-foreground space-y-1">
            <p className="font-medium text-foreground">Wealth Setu</p>
            <p>Financial Analytics Platform</p>
            <p className="text-xs">v1.0.0</p>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
} 