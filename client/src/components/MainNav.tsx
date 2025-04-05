import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Search, User, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function MainNav() {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const navItems = [
    { name: "Home", path: "/" },
    { name: "Explore", path: "/businesses" },
    { name: "Itineraries", path: "/itineraries" },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex items-center">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-primary text-2xl">
              <i className="fas fa-map-marked-alt"></i>
            </span>
            <span className="font-bold text-lg md:text-xl">ZimExplore</span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          {/* Mobile menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="md:hidden"
                aria-label="Toggle menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="pr-0">
              <div className="px-7">
                <Link href="/" className="flex items-center space-x-2">
                  <span className="text-primary text-2xl">
                    <i className="fas fa-map-marked-alt"></i>
                  </span>
                  <span className="font-bold text-xl">ZimExplore</span>
                </Link>
              </div>
              <nav className="flex flex-col gap-4 mt-8">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    href={item.path}
                    className={`px-7 py-2 text-base font-medium transition-colors ${
                      location === item.path
                        ? "bg-primary/10 text-primary"
                        : "hover:bg-muted"
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
                {user?.isBusiness && (
                  <Link
                    href="/dashboard"
                    className={`px-7 py-2 text-base font-medium transition-colors ${
                      location === "/dashboard"
                        ? "bg-primary/10 text-primary"
                        : "hover:bg-muted"
                    }`}
                  >
                    Business Dashboard
                  </Link>
                )}
                <div className="mt-4 px-7">
                  {user ? (
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            {user.fullName || user.username}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {user.email}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={handleLogout}
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Log out
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <Button variant="outline" asChild size="sm" className="w-full">
                        <Link href="/dashboard">
                          <i className="fas fa-user-tie mr-1"></i>
                          Business Registration
                        </Link>
                      </Button>
                      <Button asChild size="sm" className="w-full">
                        <Link href="/auth">Log in</Link>
                      </Button>
                    </div>
                  )}
                </div>
              </nav>
            </SheetContent>
          </Sheet>

          {/* Desktop menu */}
          <nav className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={`text-sm font-medium transition-colors ${
                  location === item.path
                    ? "text-primary"
                    : "text-muted-foreground hover:text-primary"
                }`}
              >
                {item.name}
              </Link>
            ))}
            {user?.isBusiness && (
              <Link
                href="/dashboard"
                className={`text-sm font-medium transition-colors ${
                  location === "/dashboard"
                    ? "text-primary"
                    : "text-muted-foreground hover:text-primary"
                }`}
              >
                Business Dashboard
              </Link>
            )}
          </nav>

          {/* Search and user actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              aria-label="Search"
              className="text-muted-foreground"
            >
              <Search className="h-5 w-5" />
            </Button>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full"
                    aria-label="User menu"
                  >
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">
                        {user.fullName || user.username}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/itineraries">My Itineraries</Link>
                  </DropdownMenuItem>
                  {user.isBusiness && (
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard">Business Dashboard</Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex gap-2">
                <Button variant="outline" asChild size="sm">
                  <Link href="/dashboard">
                    <i className="fas fa-user-tie mr-1"></i>
                    Business Registration
                  </Link>
                </Button>
                <Button asChild size="sm">
                  <Link href="/auth">Log in</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}