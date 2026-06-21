export function AboutSection({ id }: { id?: string }): JSX.Element {
  return (
    <section id={id} className="relative bg-slate-950 py-24">
      {/* Background glow */}
      <div className="absolute left-1/2 top-1/2 -z-10 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500/10 blur-[120px]" />

      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
          {/* Text Content */}
          <div>
            <h2 className="mb-6 text-3xl font-bold tracking-tight text-white md:text-5xl">
              Pioneering the Future of <br className="hidden md:block" />
              <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                Healthcare
              </span>
            </h2>
            <p className="mb-8 text-lg text-slate-400">
              At Sahasra Clinic, we combine compassionate care with cutting-edge medical technology. 
              Our unified platform ensures that whether you're a patient, doctor, or pharmacist, 
              your experience is seamless, efficient, and fully digitized.
            </p>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-3">
              {[
                { label: 'Active Patients', value: '10k+' },
                { label: 'Expert Doctors', value: '50+' },
                { label: 'Years Experience', value: '15+' },
              ].map((stat) => (
                <div key={stat.label} className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-sm transition-transform hover:-translate-y-1">
                  <div className="mb-2 text-3xl font-bold text-white">{stat.value}</div>
                  <div className="text-sm font-medium text-slate-400">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Image/Visual Content */}
          <div className="relative h-[500px] overflow-hidden rounded-3xl border border-slate-800 bg-slate-900">
            <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/20 to-cyan-500/20" />
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1551076805-e18690c5e53b?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-40 mix-blend-luminosity" />
            
            {/* Floating glass card */}
            <div className="absolute bottom-8 left-8 right-8 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 14 4-4"/><path d="M3.34 19a10 10 0 1 1 17.32 0"/></svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Advanced Diagnostics</h3>
                  <p className="text-sm text-slate-300">State-of-the-art laboratory facilities</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
