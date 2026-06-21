import { Activity, Clock, FileText, Pill } from 'lucide-react';

const services = [
  {
    title: 'Patient Portal',
    description: 'Access your medical records, test reports, and appointment history securely from anywhere.',
    icon: Activity,
    color: 'from-blue-500 to-cyan-500',
  },
  {
    title: 'Smart Queue System',
    description: 'No more waiting in crowded rooms. Track your queue status live and arrive exactly on time.',
    icon: Clock,
    color: 'from-emerald-500 to-teal-500',
  },
  {
    title: 'Digital Prescriptions',
    description: 'Receive easily readable digital prescriptions instantly after your consultation.',
    icon: FileText,
    color: 'from-purple-500 to-pink-500',
  },
  {
    title: 'Integrated Pharmacy',
    description: 'Get your medicines dispensed quickly with our in-house smart pharmacy management.',
    icon: Pill,
    color: 'from-orange-500 to-red-500',
  },
];

export function ServicesSection({ id }: { id?: string }): JSX.Element {
  return (
    <section id={id} className="relative bg-slate-950 py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-white md:text-5xl">
            Comprehensive <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">Services</span>
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-slate-400">
            We provide an end-to-end digital healthcare experience, ensuring you spend less time managing logistics and more time focusing on recovery.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <div
                key={service.title}
                className="group relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/50 p-8 transition-all hover:bg-slate-800/50"
              >
                {/* Background glow on hover */}
                <div className={`absolute -right-20 -top-20 h-40 w-40 rounded-full bg-gradient-to-br ${service.color} opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-20`} />
                
                <div className={`mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${service.color} bg-opacity-10 text-white shadow-lg transition-transform group-hover:scale-110`}>
                  <Icon size={28} />
                </div>
                
                <h3 className="mb-3 text-xl font-semibold text-white">{service.title}</h3>
                <p className="text-sm leading-relaxed text-slate-400">{service.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
