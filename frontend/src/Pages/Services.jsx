import { useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  Shield,
  Laptop,
  Bug,
  GraduationCap,
  ShoppingCart,
  PanelsTopLeft,
  Workflow,
  Search,
  Share2,
  Mail,
  ChartNoAxesCombined,
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  Send,
} from "lucide-react";

const securityServices = [
  {
    title: "Penetration Testing & Vulnerability Assessment ",
    description: "Find and exploit vulnerabilities before attackers do.",
    icon: Bug,
  },
  // {
  //   title: "Vulnerability Assessment",
  //   description: "Identify and prioritize security risks.",
  //   icon: ShieldCheck,
  // },
  {
    title: "IDS/IPS Implementation",
    description: "Monitor and block threats in real-time.",
    icon: Shield,
  },
  {
    title: "Security Awareness Training",
    description: "Educate your team about cyber threats.",
    icon: GraduationCap,
  },
];

const webServices = [
  {
    title: "Custom Websites",
    description: "Business websites, portfolios, landing pages.",
    icon: PanelsTopLeft,
  },
  {
    title: "E-Commerce Platforms",
    description: "Online stores with secure payment integration.",
    icon: ShoppingCart,
  },
  {
    title: "Secure Web Applications",
    description: "Web apps with security best practices.",
    icon: Laptop,
  },
];
const Digital_Marketing_Services = [
  {
    title: "Search Engine Optimization",
    description: "Improve your website's visibility in organic search results.",
    icon: Search,
  },
  {
    title: "Social Media Marketing",
    description: "Plan and manage content that connects with your audience.",
    icon: Share2,
  },
  {
    title: "Email Marketing",
    description: "Create targeted email campaigns and nurture subscribers.",
    icon: Mail,
  },
  {
    title: "Campaign Analytics",
    description: "Measure campaign performance and identify opportunities.",
    icon: ChartNoAxesCombined,
  },
];

const steps = [
  {
    title: "Select Service",
    description: "Choose what you need.",
    icon: ClipboardList,
  },
  {
    title: "Fix Requirements",
    description: "Share your details & goals.",
    icon: Workflow,
  },
  {
    title: "Submit",
    description: "We'll review and get back.",
    icon: Send,
  },
  {
    title: "Confirmation",
    description: "We'll receive your email.",
    icon: CheckCircle2,
  },
];

function Hero() {
  return (
    <section className="relative isolate overflow-hidden border-b border-cyan-900 bg-[radial-gradient(ellipse_at_75%_50%,#07507180,transparent_45%),linear-gradient(110deg,#03101e,#04172a)] px-5 py-9 text-white sm:px-8 sm:py-12">
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-30">
        <svg
          viewBox="0 0 1000 260"
          preserveAspectRatio="xMidYMid slice"
          className="h-full w-full"
        >
          <path
            d="M0 220 L100 175 L180 205 L300 90 L380 160 L480 55 L570 175 L690 45 L790 145 L870 80 L1000 175 L1000 260 L0 260Z"
            fill="#075579"
            stroke="#087fa6"
            strokeWidth="2"
          />
          <path
            d="M250 220 L480 55 L550 150 L690 45 L790 145"
            fill="none"
            stroke="#0c8db4"
            strokeWidth="2"
          />
        </svg>
      </div>

      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6">
        <div className="max-w-xl">
          <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-300">
            Cybersecurity • Development • Digital Marketing
          </p>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            Our Services
          </h1>
          <p className="mt-3 max-w-md text-sm leading-6 text-slate-300">
            Professional security, development, and digital marketing services
            for businesses of all sizes.
          </p>
        </div>

        <div className="hidden h-32 w-44 shrink-0 items-center justify-center rounded-xl border border-cyan-700/60 bg-[#061b2c]/80 shadow-[0_0_40px_#00bfff20] sm:flex lg:h-40 lg:w-56">
          <div className="relative flex h-full w-full items-center justify-center">
            <Laptop
              size={115}
              strokeWidth={1}
              className="absolute text-sky-800"
            />
            <div className="grid h-20 w-20 place-items-center rounded-xl border border-cyan-400/70 bg-cyan-950/80 text-cyan-300 shadow-[0_0_30px_#00cfff40]">
              <ShieldCheck size={47} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function SectionHeading({ icon: Icon, title, subtitle }) {
  return (
    <div className="mb-5 flex items-start gap-3">
      <Icon size={25} className="mt-0.5 shrink-0 text-sky-800" />
      <div>
        <h2 className="text-base font-extrabold text-slate-900 sm:text-lg">
          {title}
        </h2>
        <p className="mt-1 text-xs leading-5 text-slate-500">{subtitle}</p>
      </div>
    </div>
  );
}

function ServiceCard({ service, onRequest, compact = false }) {
  const Icon = service.icon;

  return (
    <article className="flex h-full flex-col rounded-xl border border-sky-100 bg-gradient-to-br from-white to-[#f6faff] p-4 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-cyan-300 hover:shadow-md sm:p-5">
      <div
        className={`flex items-start gap-3 ${compact ? "flex-col sm:flex-row" : ""}`}
      >
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-cyan-50 text-sky-800 ring-1 ring-cyan-100">
          <Icon size={23} />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-xs font-extrabold leading-5 text-slate-800 sm:text-sm">
            {service.title}
          </h3>
          <p className="mt-1.5 text-xs leading-5 text-slate-500">
            {service.description}
          </p>
        </div>
      </div>

      <button
        onClick={() => onRequest(service.title)}
        className="mt-3 self-start rounded-md border border-cyan-400 bg-white px-3 py-2 text-[11px] font-bold text-sky-700 transition hover:bg-cyan-500 hover:text-white focus:outline-none focus:ring-2 focus:ring-cyan-300"
      >
        {compact ? "Request Development" : "Request Service"}
        <ArrowRight size={12} className="ml-1 inline" />
      </button>
    </article>
  );
}

function Approach() {
  return (
    <section className="mt-10">
      <SectionHeading
        icon={Workflow}
        title="Approach Us - How It Works"
        subtitle=""
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((step, index) => {
          const Icon = step.icon;

          return (
            <div key={step.title} className="relative">
              <article className="relative h-full rounded-xl border border-sky-100 bg-gradient-to-br from-white to-[#f2f8ff] p-4">
                <span className="mb-3 grid h-7 w-7 place-items-center rounded-full bg-sky-700 text-xs font-extrabold text-white shadow-sm">
                  {index + 1}
                </span>
                <h3 className="text-xs font-extrabold text-sky-900">
                  {step.title}
                </h3>
                <p className="mt-1.5 text-[11px] leading-5 text-slate-500">
                  {step.description}
                </p>
                <Icon
                  size={17}
                  className="absolute right-3 top-4 text-sky-200"
                />
              </article>

              {index < steps.length - 1 && (
                <ArrowRight
                  size={17}
                  className="absolute -right-3 top-1/2 z-10 hidden -translate-y-1/2 text-sky-300 lg:block"
                />
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default function Services() {
  const navigate = useNavigate();

  function requestService(service) {
    navigate(`/service-request?service=${encodeURIComponent(service.trim())}`);
  }

  return (
    <div id="home" className="min-h-screen bg-white font-sans text-slate-900">
      <Hero />

      <main
        id="services"
        className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8"
      >
        <section>
          <SectionHeading
            icon={ShieldCheck}
            title="Security Services"
            subtitle="Strengthen your security posture with our expert services."
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {securityServices.map((service) => (
              <ServiceCard
                key={service.title}
                service={service}
                onRequest={requestService}
              />
            ))}
          </div>
        </section>

        <section className="mt-10">
          <SectionHeading
            icon={Workflow}
            title="Web Development Services"
            subtitle="Build powerful and scalable web solutions."
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {webServices.map((service) => (
              <ServiceCard
                key={service.title}
                service={service}
                compact
                onRequest={requestService}
              />
            ))}
          </div>
        </section>

        <section className="mt-10">
          <SectionHeading
            icon={ChartNoAxesCombined}
            title="Digital Marketing Services"
            subtitle="Reach the right audience and measure your growth across digital channels."
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Digital_Marketing_Services.map((service) => (
              <ServiceCard
                key={service.title}
                service={service}
                onRequest={requestService}
              />
            ))}
          </div>
        </section>

        <div id="request">
          <Approach />
        </div>
      </main>

      <footer
        id="contact"
        className="mt-8 border-t border-cyan-900 bg-[#03101e] px-5 py-5 text-center text-xs text-slate-400 sm:flex sm:items-center sm:justify-between sm:px-8"
      >
        <span>
          © {new Date().getFullYear()} AskYRA Tech. All rights reserved.
        </span>
        <a
          href="mailto:info@askyratech.com"
          className="mt-2 inline-block text-cyan-300 hover:text-cyan-100 sm:mt-0"
        >
          Contact Us <ArrowRight size={13} className="ml-1 inline" />
        </a>
      </footer>

    </div>
  );
}
