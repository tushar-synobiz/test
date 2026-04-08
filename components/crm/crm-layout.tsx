'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  TrendingUp,
  Calendar,
  Bell,
  Settings,
  Search,
  ChevronDown,
  LogOut,
  User,
  HelpCircle,
  FileText,
  CheckSquare,
  PenTool,
  Receipt,
  MapPin,
  Monitor,
  Wrench,
  Ticket,
  Clock,
  UserSearch,
  ChevronRight,
} from 'lucide-react'
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
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { currentUser, notifications, serviceAlerts } from '@/lib/crm-data'
import { NotificationsDropdown } from './notifications-dropdown'

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Leads', href: '/leads', icon: Users },
  { name: 'Opportunities', href: '/opportunities', icon: TrendingUp },
  { name: 'Quotations', href: '/quotations', icon: FileText },
  { name: 'Activities', href: '/activities', icon: Calendar },
  { name: 'Expenses', href: '/expenses', icon: Receipt },
  { name: 'Drawings', href: '/drawings', icon: PenTool },
  { name: 'Tracking', href: '/tracking', icon: MapPin },
]

const serviceNavigation = [
  { name: 'Tickets', href: '/service/tickets', icon: Ticket },
  { name: 'Customers', href: '/service/customers', icon: UserSearch },
  { name: 'SLA Monitoring', href: '/service/sla', icon: Clock },
]

const bottomNavigation = [
  { name: 'Approvals', href: '/approvals', icon: CheckSquare },
  { name: 'Notifications', href: '/notifications', icon: Bell },
  { name: 'Settings', href: '/settings', icon: Settings },
]

interface CRMLayoutProps {
  children: React.ReactNode
}

export function CRMLayout({ children }: CRMLayoutProps) {
  const pathname = usePathname()
  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon" className="border-sidebar-border">
        <SidebarHeader className="border-b border-sidebar-border px-4 py-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary">
              <TrendingUp className="size-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold tracking-tight group-data-[collapsible=icon]:hidden">
              SalesPro CRM
            </span>
          </Link>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {navigation.map((item) => (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton
                      asChild
                      isActive={
                        item.href === '/'
                          ? pathname === '/'
                          : pathname.startsWith(item.href)
                      }
                      tooltip={item.name}
                    >
                      <Link href={item.href}>
                        <item.icon className="size-4" />
                        <span>{item.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {/* Service Module */}
          <SidebarGroup>
            <SidebarGroupLabel>Service</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <Collapsible
                  defaultOpen={pathname.startsWith('/service')}
                  className="group/collapsible"
                >
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton
                        isActive={pathname.startsWith('/service')}
                        tooltip="Service"
                      >
                        <Wrench className="size-4" />
                        <span>Service</span>
                        <ChevronRight className="ml-auto size-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {serviceNavigation.map((item) => (
                          <SidebarMenuSubItem key={item.name}>
                            <SidebarMenuSubButton
                              asChild
                              isActive={pathname.startsWith(item.href)}
                            >
                              <Link href={item.href}>
                                <item.icon className="size-4" />
                                <span>{item.name}</span>
                                {item.name === 'Tickets' && serviceAlerts.filter(a => !a.read).length > 0 && (
                                  <Badge
                                    variant="destructive"
                                    className="ml-auto size-5 justify-center p-0 text-xs"
                                  >
                                    {serviceAlerts.filter(a => !a.read).length}
                                  </Badge>
                                )}
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="border-t border-sidebar-border">
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {bottomNavigation.map((item) => (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname.startsWith(item.href)}
                      tooltip={item.name}
                      className="relative"
                    >
                      <Link href={item.href}>
                        <item.icon className="size-4" />
                        <span>{item.name}</span>
                        {item.name === 'Notifications' && unreadCount > 0 && (
                          <Badge
                            variant="destructive"
                            className="ml-auto size-5 justify-center p-0 text-xs group-data-[collapsible=icon]:absolute group-data-[collapsible=icon]:-right-1 group-data-[collapsible=icon]:-top-1"
                          >
                            {unreadCount}
                          </Badge>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <div className="border-t border-sidebar-border pt-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex w-full items-center gap-3 rounded-lg p-2 text-left text-sm hover:bg-sidebar-accent group-data-[collapsible=icon]:justify-center">
                  <Avatar className="size-8">
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                      {currentUser.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 group-data-[collapsible=icon]:hidden">
                    <p className="font-medium">{currentUser.name}</p>
                    <p className="text-xs text-muted-foreground">{currentUser.role}</p>
                  </div>
                  <ChevronDown className="size-4 text-muted-foreground group-data-[collapsible=icon]:hidden" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 size-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 size-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <HelpCircle className="mr-2 size-4" />
                  Help & Support
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive">
                  <LogOut className="mr-2 size-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b border-border bg-background px-4">
          <SidebarTrigger />
          
          <div className="flex flex-1 items-center gap-4">
            <div className="relative max-w-md flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search leads, opportunities, activities..."
                className="h-9 pl-9 bg-secondary border-0"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <NotificationsDropdown />
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Avatar className="size-8">
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                      {currentUser.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div>
                    <p className="font-medium">{currentUser.name}</p>
                    <p className="text-xs font-normal text-muted-foreground">{currentUser.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/settings/profile">
                    <User className="mr-2 size-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings/sessions">
                    <Monitor className="mr-2 size-4" />
                    Active Sessions
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings">
                    <Settings className="mr-2 size-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive">
                  <LogOut className="mr-2 size-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
