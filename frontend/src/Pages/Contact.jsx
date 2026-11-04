import { useState } from "react";
import {
  ArrowRight,
  MapPin,
  Phone,
  Mail,
  MessageCircle,
  Send,
  CheckCircle2,
} from "lucide-react";

const API_EMAIL = "info@askyratech.com";
const PHONE_NUMBER = "+977 9800000000";

function Hero() {
  return (
    <section className="relative isolate overflow-hidden border-b border-cyan-900 bg-[#03101e] text-white">
      <img
        src="https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1600&q=85"
        alt="Modern workspace with a laptop and plants"
        className="absolute inset-0 -z-20 h-full w-full object-cover object-center"
      />

      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#03101e] via-[#03101e]/95 to-[#03101e]/35" />

      <div className="mx-auto flex min-h-[185px] max-w-7xl items-center px-5 py-8 sm:min-h-[205px] sm:px-8 sm:py-10">
        <div className="max-w-xl">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-300">
            Contact AskYRA Tech
          </p>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            Let's Work Together
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-200 sm:text-base">
            Have a project in mind or need our services?
            <br />
            Get in touch with us.
          </p>
        </div>
      </div>
    </section>
  );
}

function ContactForm() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setForm((previous) => ({
      ...previous,
      [e.target.name]: e.target.value,
    }));
    setSubmitted(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Frontend demo: prepare an email with the user's message.
    const subject = encodeURIComponent(`Contact request from ${form.name}`);
    const body = encodeURIComponent(
      `Name: ${form.name}\nEmail: ${form.email}\n\nMessage:\n${form.message}`,
    );

    window.location.href = `mailto:${API_EMAIL}?subject=${subject}&body=${body}`;
    setSubmitted(true);
  };

  const inputClass =
    "mt-1.5 w-full rounded-md border border-sky-100 bg-white px-3 py-3 text-xs text-slate-800 outline-none placeholder:text-slate-400 transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100";

  return (
    <section className="rounded-xl border border-sky-100 bg-white p-4 shadow-sm sm:p-6">
      <div className="mb-5 flex items-center gap-2">
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-cyan-50 text-sky-800">
          <Mail size={18} />
        </span>
        <div>
          <h2 className="text-base font-extrabold text-slate-900">
            Send Us a Message
          </h2>
          <p className="mt-0.5 text-[11px] text-slate-500">
            We would love to hear from you.
          </p>
        </div>
      </div>

      {submitted && (
        <div
          role="status"
          className="mb-4 flex gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs leading-5 text-emerald-800"
        >
          <CheckCircle2 size={18} className="shrink-0" />
          Your email app should open with your message prepared. Send the email
          there to contact us.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block text-xs font-semibold text-slate-700">
          Name <span className="text-rose-500">*</span>
          <input
            required
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Enter your name"
            autoComplete="name"
            className={inputClass}
          />
        </label>

        <label className="block text-xs font-semibold text-slate-700">
          Email <span className="text-rose-500">*</span>
          <input
            required
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Enter your email"
            autoComplete="email"
            className={inputClass}
          />
        </label>

        <label className="block text-xs font-semibold text-slate-700">
          Message <span className="text-rose-500">*</span>
          <textarea
            required
            name="message"
            value={form.message}
            onChange={handleChange}
            rows={4}
            placeholder="Type your message..."
            className={`${inputClass} min-h-28 resize-y`}
          />
        </label>

        <button
          type="submit"
          className="flex w-full items-center justify-center gap-2 rounded-md border border-cyan-400 bg-cyan-500 px-4 py-3 text-xs font-extrabold text-white transition hover:bg-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-300 focus:ring-offset-2"
        >
          <Send size={15} />
          Send Message
        </button>
      </form>
    </section>
  );
}

function DirectActions() {
  return (
    <section className="min-w-0">
      <h2 className="mb-5 text-base font-extrabold text-slate-900">
        Direct Actions
      </h2>

      <div className="space-y-3">
        <a
          href="/services"
          className="flex min-h-11 items-center justify-center gap-2 rounded-md border border-cyan-800 bg-[#062039] px-3 py-3 text-xs font-bold text-cyan-300 transition hover:border-cyan-400 hover:bg-[#0a3450] hover:text-white"
        >
          Request Security Service <ArrowRight size={14} />
        </a>

        <a
          href="/services"
          className="flex min-h-11 items-center justify-center gap-2 rounded-md border border-cyan-800 bg-[#062039] px-3 py-3 text-xs font-bold text-cyan-300 transition hover:border-cyan-400 hover:bg-[#0a3450] hover:text-white"
        >
          Request Web Development <ArrowRight size={14} />
        </a>
      </div>

      {/* Location */}
      <div className="mt-6">
        <h3 className="flex items-center gap-2 text-xs font-extrabold text-slate-800">
          <MapPin size={16} className="text-sky-800" />
          Our Location
        </h3>
        <p className="mt-2 pl-6 text-xs text-slate-500">Kathmandu, Nepal</p>

        <a
          href="https://www.google.com/maps/search/?api=1&query=Kathmandu%2C+Nepal"
          target="_blank"
          rel="noreferrer"
          aria-label="Open Kathmandu on Google Maps"
          className="group mt-3 block overflow-hidden rounded-lg border border-sky-100"
        >
          <div className="relative h-32 sm:h-36">
            <iframe
              title="Map showing Kathmandu, Nepal"
              src="https://maps.google.com/maps?q=Kathmandu%2C%20Nepal&t=&z=12&ie=UTF8&iwloc=&output=embed"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="h-full w-full border-0"
            />
          </div>
          <span className="flex items-center justify-center gap-1 bg-sky-50 py-2 text-[10px] font-bold text-sky-800 transition group-hover:bg-cyan-50">
            <MapPin size={12} /> Open Google Maps
          </span>
        </a>
      </div>

      {/* Contact info */}
      <div className="mt-6">
        <h3 className="mb-3 text-xs font-extrabold text-slate-800">
          Contact Info
        </h3>

        <div className="space-y-3">
          <a
            href={`tel:${PHONE_NUMBER.replace(/\s/g, "")}`}
            className="flex items-center gap-3 text-xs text-slate-600 transition hover:text-sky-700"
          >
            <Phone size={15} className="shrink-0 text-sky-800" />
            <span>{PHONE_NUMBER}</span>
          </a>

          <a
            href={`mailto:${API_EMAIL}`}
            className="flex items-center gap-3 break-all text-xs text-slate-600 transition hover:text-sky-700"
          >
            <Mail size={15} className="shrink-0 text-sky-800" />
            <span>{API_EMAIL}</span>
          </a>

          <a
            href={`https://wa.me/${PHONE_NUMBER.replace(/\D/g, "")}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-3 text-xs text-slate-600 transition hover:text-sky-700"
          >
            <MessageCircle size={16} className="shrink-0 text-sky-800" />
            <span>Live Chat / WhatsApp</span>
          </a>
        </div>
      </div>
    </section>
  );
}

export default function Contact() {
  return (
    <div className="min-h-screen bg-[#f5f9fd] font-sans text-slate-900">
      <Hero />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="grid grid-cols-1 items-start gap-6 rounded-xl border border-sky-100 bg-white p-4 shadow-sm sm:p-6 md:grid-cols-[1.15fr_0.85fr] md:gap-7 lg:gap-10 lg:p-7">
          <ContactForm />

          <div className="min-w-0 md:border-l md:border-sky-100 md:pl-6 lg:pl-8">
            <DirectActions />
          </div>
        </div>
      </main>

      <footer className="border-t border-cyan-900 bg-[#03101e] px-4 py-5 text-center text-xs text-slate-400">
        <p>© {new Date().getFullYear()} AskYRA Tech. All rights reserved.</p>
        <p className="mt-2 font-semibold tracking-widest text-cyan-300">
          Learn <span className="text-slate-500">|</span> Build{" "}
          <span className="text-slate-500">|</span> Secure{" "}
          <span className="text-slate-500">|</span> Grow
        </p>
      </footer>
    </div>
  );
}
