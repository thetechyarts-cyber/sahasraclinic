'use client';

import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import { useState } from 'react';

export function ContactSection({ id }: { id?: string }): JSX.Element {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 5000);
    }, 1500);
  };

  return (
    <section id={id} className="relative bg-slate-950 py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-white md:text-5xl">
            Get in <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">Touch</span>
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-slate-400">
            Have questions about our services or need to schedule a consultation? Our team is here to help you 24/7.
          </p>
        </div>

        <div className="grid gap-12 lg:grid-cols-2">
          {/* Contact Info */}
          <div className="space-y-8">
            <div className="flex items-start gap-4">
              <div className="mt-1 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-900 border border-slate-800 text-emerald-400">
                <MapPin size={24} />
              </div>
              <div>
                <h3 className="mb-1 text-lg font-semibold text-white">Visit Us</h3>
                <p className="text-slate-400">123 Healthcare Avenue, Medical District<br/>Tech City, TC 100021</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="mt-1 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-900 border border-slate-800 text-emerald-400">
                <Phone size={24} />
              </div>
              <div>
                <h3 className="mb-1 text-lg font-semibold text-white">Call Us</h3>
                <p className="text-slate-400">+1 (555) 123-4567<br/>Emergency: +1 (555) 911-0000</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="mt-1 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-900 border border-slate-800 text-emerald-400">
                <Mail size={24} />
              </div>
              <div>
                <h3 className="mb-1 text-lg font-semibold text-white">Email Us</h3>
                <p className="text-slate-400">contact@sahasraclinic.com<br/>support@sahasraclinic.com</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="mt-1 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-900 border border-slate-800 text-emerald-400">
                <Clock size={24} />
              </div>
              <div>
                <h3 className="mb-1 text-lg font-semibold text-white">Working Hours</h3>
                <p className="text-slate-400">Monday - Saturday: 8:00 AM - 8:00 PM<br/>Sunday: Emergency Only</p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/50 p-8 shadow-2xl backdrop-blur-sm">
            <h3 className="mb-6 text-2xl font-bold text-white">Send us a message</h3>
            {success ? (
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-6 text-center">
                <p className="text-emerald-400 font-medium">Thank you for reaching out! We will get back to you shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="firstName" className="mb-1.5 block text-sm font-medium text-slate-300">First Name</label>
                    <input id="firstName" required type="text" className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-white placeholder-slate-500 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" placeholder="John" />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="mb-1.5 block text-sm font-medium text-slate-300">Last Name</label>
                    <input id="lastName" required type="text" className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-white placeholder-slate-500 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" placeholder="Doe" />
                  </div>
                </div>
                <div>
                  <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-300">Email Address</label>
                  <input id="email" required type="email" className="w-full rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-white placeholder-slate-500 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" placeholder="john@example.com" />
                </div>
                <div>
                  <label htmlFor="message" className="mb-1.5 block text-sm font-medium text-slate-300">Your Message</label>
                  <textarea id="message" required rows={4} className="w-full resize-none rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2.5 text-white placeholder-slate-500 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" placeholder="How can we help you?"></textarea>
                </div>
                <button type="submit" disabled={loading} className="w-full rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 transition-all hover:shadow-emerald-500/40 disabled:opacity-50">
                  {loading ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
