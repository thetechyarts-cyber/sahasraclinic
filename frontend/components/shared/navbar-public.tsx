'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';

export function NavbarPublic(): JSX.Element {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', href: '#home' },
    { name: 'About', href: '#about' },
    { name: 'Services', href: '#services' },
    { name: 'Contact', href: '#contact' },
  ];

  return (
    <header
      className={`fixed left-0 top-0 z-50 w-full transition-all duration-300 ${
        isScrolled
          ? 'bg-slate-950/80 shadow-lg shadow-emerald-500/5 backdrop-blur-md border-b border-slate-800'
          : 'bg-transparent'
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link href="#home" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-400 shadow-lg shadow-emerald-500/25">
            <span className="text-xl font-bold text-slate-900">H</span>
          </div>
          <span className="text-xl font-bold tracking-tight text-white">Sahasra Clinic</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-8 md:flex">
          <ul className="flex gap-6">
            {navLinks.map((link) => (
              <li key={link.name}>
                <Link
                  href={link.href}
                  className="text-sm font-medium text-slate-300 transition-colors hover:text-emerald-400"
                >
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-4 border-l border-slate-700 pl-6">
            <Link
              href="/login"
              className="text-sm font-semibold text-slate-300 transition-colors hover:text-white"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 transition-all hover:shadow-emerald-500/40"
            >
              Register
            </Link>
          </div>
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="text-slate-300 md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="absolute left-0 top-full w-full border-b border-slate-800 bg-slate-950 px-6 py-4 md:hidden">
          <ul className="flex flex-col gap-4 pb-6">
            {navLinks.map((link) => (
              <li key={link.name}>
                <Link
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-base font-medium text-slate-300 transition-colors hover:text-emerald-400"
                >
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
          <div className="flex flex-col gap-3 border-t border-slate-800 pt-6">
            <Link
              href="/login"
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-5 py-3 text-center text-sm font-semibold text-white"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="w-full rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500 px-5 py-3 text-center text-sm font-semibold text-white shadow-lg shadow-emerald-500/25"
            >
              Register as Patient
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
