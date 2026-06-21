import Link from 'next/link';

export function FooterPublic(): JSX.Element {
  return (
    <footer className="border-t border-slate-800 bg-slate-950 pt-16 pb-8">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="#home" className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-400 shadow-lg shadow-emerald-500/25">
                <span className="text-xl font-bold text-slate-900">H</span>
              </div>
              <span className="text-xl font-bold tracking-tight text-white">Sahasra Clinic</span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed">
              Modern clinic management for patient care, prescriptions, queue management, and billing operations.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="mb-6 text-sm font-semibold text-white uppercase tracking-wider">Quick Links</h4>
            <ul className="space-y-3">
              {['Home', 'About', 'Services', 'Contact'].map((item) => (
                <li key={item}>
                  <Link href={`#${item.toLowerCase()}`} className="text-sm text-slate-400 transition-colors hover:text-emerald-400">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="mb-6 text-sm font-semibold text-white uppercase tracking-wider">Legal</h4>
            <ul className="space-y-3">
              {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map((item) => (
                <li key={item}>
                  <Link href="#" className="text-sm text-slate-400 transition-colors hover:text-emerald-400">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="mb-6 text-sm font-semibold text-white uppercase tracking-wider">Stay Updated</h4>
            <p className="mb-4 text-sm text-slate-400">Subscribe to our newsletter for health tips and updates.</p>
            <form className="flex gap-2">
              <input type="email" placeholder="Enter your email" className="w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-white outline-none focus:border-emerald-500" />
              <button type="button" className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-400 transition-colors">
                Subscribe
              </button>
            </form>
          </div>
        </div>

        <div className="mt-16 border-t border-slate-800 pt-8 text-center sm:flex sm:items-center sm:justify-between sm:text-left">
          <p className="text-sm text-slate-500">
            &copy; {new Date().getFullYear()} Sahasra Clinic. All rights reserved.
          </p>
          <div className="mt-4 flex justify-center gap-6 sm:mt-0">
            {/* Social Links placeholders */}
            <a href="#" className="text-slate-500 hover:text-emerald-400"><span className="sr-only">Facebook</span><svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" /></svg></a>
            <a href="#" className="text-slate-500 hover:text-emerald-400"><span className="sr-only">Twitter</span><svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" /></svg></a>
          </div>
        </div>
      </div>
    </footer>
  );
}
