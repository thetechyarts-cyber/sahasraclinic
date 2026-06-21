import { NavbarPublic } from '@/components/shared/navbar-public';
import { HeroCarousel } from '@/components/ui/hero-carousel';
import { AboutSection } from '@/components/shared/about-section';
import { ServicesSection } from '@/components/shared/services-section';
import { ContactSection } from '@/components/shared/contact-section';
import { FooterPublic } from '@/components/shared/footer-public';

export default function HomePage(): JSX.Element {
  return (
    <div className="flex min-h-screen flex-col bg-slate-950 scroll-smooth">
      <NavbarPublic />
      <main className="flex-1">
        <HeroCarousel id="home" />
        <AboutSection id="about" />
        <ServicesSection id="services" />
        <ContactSection id="contact" />
      </main>
      <FooterPublic />
    </div>
  );
}
