import React, { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import Button from "./ui/button";
import { Input } from "./ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { LogOut, User, Search, Menu } from "lucide-react";

interface NavItem {
  name: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
  navItems: NavItem[];
  activeNavItem: string;
  setActiveNavItem: (itemName: string) => void;
  userEmail: string;
  userInitials: string;
}

export default function DashboardLayout({
  children,
  title,
  navItems,
  activeNavItem,
  setActiveNavItem,
  userEmail,
  userInitials,
}: DashboardLayoutProps) {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [isHovering, setIsHovering] = React.useState(false);

  const handleNavClick = (itemName: string, path: string) => {
    setActiveNavItem(itemName);
    navigate(path);
    setSidebarOpen(false);
  };

  const sidebarFullyOpen = sidebarOpen || isHovering;

  return (
    <div className="min-h-screen w-screen bg-teal-50 flex relative overflow-hidden">
  {/* Sidebar */}
      <aside
        className={`bg-teal-400 bg-opacity-100 shadow-md transition-all duration-300 ease-in-out flex-shrink-0 
          ${sidebarFullyOpen ? "w-[20vw] min-w-[250px]" : "w-[5vw] min-w-[50px]"} lg:w-[5vw] absolute inset-y-0 left-0 z-50`}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar toggle button */}
          <div className="flex justify-end p-2">
            <Button
            className='text-white'
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Menu className="h-6 w-6" />
            </Button>
          </div>

          {/* Nav Items */}
          <nav
            className="flex-1 px-0 space-y-2 overflow-y-auto"
            style={{ scrollbarWidth: "thin", minHeight: "50px" }}
          >
            {navItems.map((item) => (
              <Button
                key={item.name}
                variant={activeNavItem === item.name ? "secondary" : "ghost"}
                className={`text-white hover:bg-teal-500 w-full justify-start py-2 px-4 flex items-center gap-2 ${
                  sidebarFullyOpen ? "text-sm" : "text-xs justify-center"
                }`}
                onClick={() => handleNavClick(item.name, item.path)}
                style={{
                  minWidth: "50px",
                  minHeight: "50px",
                }}
              >
                <item.icon className="h-6 w-6 text-white" />
                {sidebarFullyOpen ? item.name : ""}
              </Button>
            ))}
          </nav>

          {/* Store Management Title */}
          {sidebarFullyOpen && (
            <div className="px-4 py-4">
              <h2 className="text-2xl font-bold text-white">
                Store Management System
              </h2>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col z-10 ml-[5vw] lg:ml-[5vw] ">
        {/* Header */}
        <header className="bg-teal-400 bg-opacity-100 shadow-sm sticky top-0 z-20 mb-0 p-0">
          <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
            <div className="flex items-center">
              {/* Sidebar toggle button for mobile */}
              
              <h1 className="text-2xl font-semibold text-white">{title}</h1>
            </div>
            <div className="flex items-center">
              <div className="relative mr-4">
                
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black" size={18} />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <Button
                    variant="ghost"
                    className="relative h-15 w-15 rounded-full hover:bg-blue-400"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRd_XRGE9j0tQkvkYFKQU5MlZw86IXuV9TbfA&s"
                        alt="@user"
                      />
                      <AvatarFallback>{userInitials}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-56 z-dropdown bg-purple-200 bg-opacity-75"
                  align="end"
                  forceMount
                >
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">User</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {userEmail}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 p-0 relative z-10 flex justify-center items-center mx-auto bg-opacity-90">
  <div className=" bg-opacity-0 rounded-lg shadow-md w-full h-full p-10">
    {children}
  </div>
</main>
      </div>
    </div>
  );
}