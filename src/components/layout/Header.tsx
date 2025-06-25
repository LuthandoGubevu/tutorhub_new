
// src/components/layout/Header.tsx
"use client";

import Link from 'next/link';
import { Atom, BookOpen, CalendarDays, LayoutDashboard, LogIn, LogOut, UserPlus, ShieldCheck, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { usePathname } from 'next/navigation';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";

const Header = () => {
  const { user, logout, loading } = useAuth();
  const pathname = usePathname();

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="mr-2 h-4 w-4" />, authRequired: true, adminOnly: false },
    { href: '/lessons', label: 'Lessons', icon: <BookOpen className="mr-2 h-4 w-4" />, authRequired: false, adminOnly: false },
    { href: '/book-session', label: 'Book Session', icon: <CalendarDays className="mr-2 h-4 w-4" />, authRequired: true, adminOnly: false },
    { href: '/tutor/dashboard', label: 'Tutor Admin', icon: <ShieldCheck className="mr-2 h-4 w-4" />, authRequired: true, adminOnly: true },
  ];

  const getDisplayedNavLinks = () => {
    if (loading) return [];
    
    // Not logged in
    if (!user) {
        return navLinks.filter(link => !link.authRequired);
    }

    // Logged in as Admin
    if (user.isAdmin) {
        return navLinks.filter(link => link.adminOnly || !link.authRequired);
    }

    // Logged in as Student
    return navLinks.filter(link => !link.adminOnly);
  };

  const displayedLinks = getDisplayedNavLinks();

  return (
    <header className="bg-brand-navy text-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <Atom size={32} className="text-brand-purple-blue" />
          <span className="font-headline text-2xl font-semibold">TutorHub</span>
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-2">
          {displayedLinks.map(link => (
            <Button key={link.href} variant={pathname === link.href ? "secondary" : "ghost"} className="text-white hover:bg-brand-purple-blue/80 hover:text-white" asChild>
              <Link href={link.href} className="flex items-center">
                {link.icon}
                {link.label}
              </Link>
            </Button>
          ))}
        </nav>
        
        {/* Desktop Auth Buttons */}
        <div className="hidden md:flex items-center space-x-2">
          {loading ? (
            <div className="h-8 w-20 animate-pulse bg-gray-600 rounded"></div>
          ) : user ? (
            <>
              <span className="text-sm">Welcome, {user.firstName || 'User'}!</span>
              <Button variant="outline" size="sm" onClick={logout} className="border-brand-purple-blue text-brand-purple-blue hover:bg-brand-purple-blue hover:text-white">
                <LogOut className="mr-2 h-4 w-4" /> Logout
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" className="text-white hover:bg-brand-purple-blue/80 hover:text-white" asChild>
                <Link href="/login"><LogIn className="mr-2 h-4 w-4" />Login</Link>
              </Button>
              <Button variant="default" className="bg-brand-purple-blue hover:bg-brand-purple-blue/80 text-white" asChild>
                <Link href="/register"><UserPlus className="mr-2 h-4 w-4" />Register</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile Navigation (Hamburger Menu) */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-white hover:bg-brand-purple-blue/80">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="bg-brand-navy text-white border-brand-purple-blue w-[250px] sm:w-[300px] p-0 flex flex-col">
                <SheetHeader className="p-4 border-b border-brand-purple-blue/50">
                  <SheetTitle asChild>
                    <SheetClose asChild>
                      <Link href="/" className="flex items-center space-x-2">
                        <Atom size={28} className="text-brand-purple-blue" />
                        <span className="font-headline text-xl font-semibold">TutorHub</span>
                      </Link>
                    </SheetClose>
                  </SheetTitle>
                  <SheetDescription className="sr-only">
                    A navigation menu for the TutorHub application.
                  </SheetDescription>
                </SheetHeader>
                <nav className="flex-grow p-4 space-y-2">
                  {displayedLinks.map(link => (
                    <SheetClose asChild key={link.href}>
                      <Link
                        href={link.href}
                        className={`flex items-center p-3 rounded-md text-base font-medium ${
                          pathname === link.href ? 'bg-brand-purple-blue' : 'hover:bg-brand-purple-blue/50'
                        }`}
                      >
                        {link.icon}
                        <span>{link.label}</span>
                      </Link>
                    </SheetClose>
                  ))}
                </nav>
                <div className="p-4 border-t border-brand-purple-blue/50 mt-auto">
                   {loading ? (
                    <div className="h-8 w-full animate-pulse bg-gray-600 rounded"></div>
                  ) : user ? (
                    <div className="space-y-2 text-center">
                      <p className="text-sm">Welcome, {user.firstName || 'User'}!</p>
                      <SheetClose asChild>
                        <Button variant="outline" onClick={logout} className="w-full border-brand-purple-blue text-brand-purple-blue hover:bg-brand-purple-blue hover:text-white">
                          <LogOut className="mr-2 h-4 w-4" /> Logout
                        </Button>
                      </SheetClose>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <SheetClose asChild>
                        <Button variant="ghost" className="w-full text-white hover:bg-brand-purple-blue/80 hover:text-white" asChild>
                          <Link href="/login"><LogIn className="mr-2 h-4 w-4" />Login</Link>
                        </Button>
                      </SheetClose>
                      <SheetClose asChild>
                        <Button variant="default" className="w-full bg-brand-purple-blue hover:bg-brand-purple-blue/80 text-white" asChild>
                          <Link href="/register"><UserPlus className="mr-2 h-4 w-4" />Register</Link>
                        </Button>
                      </SheetClose>
                    </div>
                  )}
                </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Header;
