// src/components/layout/Header.tsx
"use client";

import Link from 'next/link';
import { Atom, BookOpen, CalendarDays, LayoutDashboard, LogIn, LogOut, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { usePathname } from 'next/navigation';

const Header = () => {
  const { user, logout, loading } = useAuth();
  const pathname = usePathname();

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="mr-2 h-4 w-4" />, authRequired: true },
    { href: '/book-session', label: 'Book Session', icon: <CalendarDays className="mr-2 h-4 w-4" />, authRequired: true },
  ];

  return (
    <header className="bg-brand-navy text-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <Atom size={32} className="text-brand-purple-blue" />
          <span className="font-headline text-2xl font-semibold">TutorHub</span>
        </Link>
        <nav className="hidden md:flex items-center space-x-2">
          {navLinks.filter(link => !link.authRequired || (link.authRequired && user)).map(link => (
            <Button key={link.href} variant={pathname === link.href ? "secondary" : "ghost"} className="text-white hover:bg-brand-purple-blue/80 hover:text-white" asChild>
              <Link href={link.href} className="flex items-center">
                {link.icon}
                {link.label}
              </Link>
            </Button>
          ))}
           <Button variant={pathname.startsWith("/lessons") ? "secondary" : "ghost"} className="text-white hover:bg-brand-purple-blue/80 hover:text-white" asChild>
              <Link href="/lessons" className="flex items-center">
                <BookOpen className="mr-2 h-4 w-4" />
                Lessons
              </Link>
            </Button>
        </nav>
        <div className="flex items-center space-x-2">
          {loading ? (
            <div className="h-8 w-20 animate-pulse bg-gray-600 rounded"></div>
          ) : user ? (
            <>
              <span className="text-sm hidden sm:inline">Welcome, {(user.fullName || 'User').split(' ')[0]}!</span>
              <Button variant="outline" size="sm" onClick={logout} className="border-brand-purple-blue text-brand-purple-blue hover:bg-brand-purple-blue hover:text-white">
                <LogOut className="mr-2 h-4 w-4" /> Logout
              </Button>
            </>
          ) : (
            <>
             <Button variant={pathname.startsWith("/lessons") ? "secondary" : "ghost"} className="text-white hover:bg-brand-purple-blue/80 hover:text-white" asChild>
                <Link href="/lessons" className="flex items-center">
                  <BookOpen className="mr-2 h-4 w-4" />
                  Lessons
                </Link>
              </Button>
              <Button variant="ghost" className="text-white hover:bg-brand-purple-blue/80 hover:text-white" asChild>
                <Link href="/login"><LogIn className="mr-2 h-4 w-4" />Login</Link>
              </Button>
              <Button variant="default" className="bg-brand-purple-blue hover:bg-brand-purple-blue/80 text-white" asChild>
                <Link href="/register"><UserPlus className="mr-2 h-4 w-4" />Register</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
