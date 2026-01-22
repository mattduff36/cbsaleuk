"use client";

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  User, 
  Search, 
  PlusCircle, 
  Menu, 
  X,
  LogIn,
  UserCircle,
  LogOut,
  Home,
  Calendar,
  Crown
} from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useIsMobile } from '@/hooks/use-mobile';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const router = useRouter();
  const isMobile = useIsMobile();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account",
      });
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: "Logout failed",
        description: "An error occurred during logout",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/">
                <div className="flex items-center cursor-pointer">
                  <img 
                    src="/assets/carboot_logo_news_thicker-lrg2_1757958721943.png" 
                    alt="CarBootSale.com" 
                    className="h-12 w-auto"
                  />
                </div>
              </Link>
            </div>

            {/* Desktop Navigation */}
            {!isMobile && (
              <nav className="hidden md:flex items-center space-x-4">
                <Link href="/">
                  <div className="text-gray-700 hover:text-primary px-3 py-2 rounded-md text-sm font-bold cursor-pointer">
                    Home
                  </div>
                </Link>
                <div 
                  className="text-gray-700 hover:text-primary px-3 py-2 rounded-md text-sm font-bold cursor-pointer"
                  onClick={() => {
                    router.push('/');
                    setTimeout(() => {
                      document.getElementById('featured-sales')?.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                  }}
                >
                  Featured Car Boot Sales
                </div>
                <div 
                  className="text-gray-700 hover:text-primary px-3 py-2 rounded-md text-sm font-bold cursor-pointer"
                  onClick={() => {
                    router.push('/');
                    setTimeout(() => {
                      document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                  }}
                >
                  How it works
                </div>
                <Link href="/search">
                  <div className="text-gray-700 hover:text-primary px-3 py-2 rounded-md text-sm font-bold cursor-pointer">
                    Car Boot Sales Near Me
                  </div>
                </Link>
                <div 
                  className="text-gray-700 hover:text-primary px-3 py-2 rounded-md text-sm font-bold cursor-pointer"
                  onClick={() => {
                    if (isAuthenticated) {
                      router.push('/list-sale');
                    } else {
                      toast({
                        title: "Login Required",
                        description: "You need to be logged in to list a car boot sale. Please login or register.",
                        variant: "default",
                      });
                      router.push('/login');
                    }
                  }}
                >
                  List Your Car Boot Sale
                </div>
              </nav>
            )}

            {/* Auth Buttons - Desktop */}
            <div className="hidden md:flex items-center space-x-2">
              {isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <UserCircle className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel className="flex items-center justify-between">
                      <span>My Account</span>
                      {user?.isPremium && (
                        <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs">
                          <Crown className="w-3 h-3 mr-1" />
                          Premium
                        </Badge>
                      )}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => router.push('/dashboard')}>
                      <UserCircle className="mr-2 h-4 w-4" />
                      <span>Dashboard</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push('/list-sale')}>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      <span>List Your Car Boot Sale</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="ghost" size="sm">
                      Log in
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button size="sm">Sign up</Button>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            {isMobile && (
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary md:hidden"
              >
                <span className="sr-only">Open main menu</span>
                {isMenuOpen ? (
                  <X className="block h-6 w-6" />
                ) : (
                  <Menu className="block h-6 w-6" />
                )}
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobile && isMenuOpen && (
          <div className="md:hidden bg-white/80 backdrop-blur-sm border-t border-gray-200">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <Link href="/">
                <div 
                  className="text-gray-700 hover:bg-gray-50 block px-3 py-2 rounded-md text-base font-bold cursor-pointer"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Home className="inline-block mr-2 h-5 w-5" />
                  Home
                </div>
              </Link>
              <div 
                className="text-gray-700 hover:bg-gray-50 block px-3 py-2 rounded-md text-base font-bold cursor-pointer"
                onClick={() => {
                  router.push('/');
                  setIsMenuOpen(false);
                  setTimeout(() => {
                    document.getElementById('featured-sales')?.scrollIntoView({ behavior: 'smooth' });
                  }, 100);
                }}
              >
                <Calendar className="inline-block mr-2 h-5 w-5" />
                Featured Car Boot Sales
              </div>
              <div 
                className="text-gray-700 hover:bg-gray-50 block px-3 py-2 rounded-md text-base font-bold cursor-pointer"
                onClick={() => {
                  router.push('/');
                  setIsMenuOpen(false);
                  setTimeout(() => {
                    document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
                  }, 100);
                }}
              >
                <User className="inline-block mr-2 h-5 w-5" />
                How it works
              </div>
              <Link href="/search">
                <div 
                  className="text-gray-700 hover:bg-gray-50 block px-3 py-2 rounded-md text-base font-bold cursor-pointer"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Search className="inline-block mr-2 h-5 w-5" />
                  Car Boot Sales Near Me
                </div>
              </Link>
              <div 
                className="text-gray-700 hover:bg-gray-50 block px-3 py-2 rounded-md text-base font-bold cursor-pointer"
                onClick={() => {
                  setIsMenuOpen(false);
                  if (isAuthenticated) {
                    router.push('/list-sale');
                  } else {
                    toast({
                      title: "Login Required",
                      description: "You need to be logged in to list a car boot sale. Please login or register.",
                      variant: "default",
                    });
                    router.push('/login');
                  }
                }}
              >
                <PlusCircle className="inline-block mr-2 h-5 w-5" />
                List Your Car Boot Sale
              </div>
              
              {/* Auth links for mobile */}
              {isAuthenticated ? (
                <>
                  <Link href="/dashboard">
                    <div 
                      className="text-gray-700 hover:bg-gray-50 block px-3 py-2 rounded-md text-base font-bold cursor-pointer"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <UserCircle className="inline-block mr-2 h-5 w-5" />
                      Dashboard
                    </div>
                  </Link>
                  <div 
                    className="text-gray-700 hover:bg-gray-50 block px-3 py-2 rounded-md text-base font-bold cursor-pointer"
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                  >
                    <LogOut className="inline-block mr-2 h-5 w-5" />
                    Log out
                  </div>
                </>
              ) : (
                <>
                  <Link href="/login">
                    <div 
                      className="text-gray-700 hover:bg-gray-50 block px-3 py-2 rounded-md text-base font-bold cursor-pointer"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <LogIn className="inline-block mr-2 h-5 w-5" />
                      Log in
                    </div>
                  </Link>
                  <Link href="/register">
                    <div 
                      className="text-primary hover:bg-primary/10 block px-3 py-2 rounded-md text-base font-bold cursor-pointer"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <User className="inline-block mr-2 h-5 w-5" />
                      Sign up
                    </div>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main content */}
      <main className="flex-grow">{children}</main>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-sm text-gray-500">
                &copy; {new Date().getFullYear()} CarBootSale.com. All rights reserved.
              </p>
            </div>
            <div className="flex space-x-6">
              <Link href="/terms">
                <div className="text-sm text-gray-500 hover:text-primary cursor-pointer">
                  Terms
                </div>
              </Link>
              <Link href="/privacy">
                <div className="text-sm text-gray-500 hover:text-primary cursor-pointer">
                  Privacy
                </div>
              </Link>
              <Link href="/contact">
                <div className="text-sm text-gray-500 hover:text-primary cursor-pointer">
                  Contact
                </div>
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
