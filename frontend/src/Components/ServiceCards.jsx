import {
  GraduationCap,
  ShieldCheck,
  ChartNoAxesCombined,
  ArrowRight,
} from "lucide-react";

const services = [
  {
    title: "Training Programs",
    description: "Hands-on courses for students to build in-demand skills.",
    link: "Explore Courses",
    icon: GraduationCap,
    color: "text-sky-800",
    bg: "bg-sky-100",
  },
  {
    title: "Security Services",
    description: "VAPT, penetration testing, and more for your business.",
    link: "Request Service",
    icon: ShieldCheck,
    color: "text-sky-700",
    bg: "bg-cyan-100",
  },
  {
    title: "Web Development",
    description: "Custom websites, web applications and digital solutions.",
    link: "Explore Services",
    icon: ChartNoAxesCombined,
    color: "text-sky-800",
    bg: "bg-sky-100",
  },
];

export default function ServiceCards() {
  return (
    <section className="w-full bg-[#f8fbff] px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
        {services.map((service) => {
          const Icon = service.icon;

          return (
            <article
              key={service.title}
              className="group rounded-xl border border-sky-100
                bg-white p-5 shadow-sm transition-all duration-300
                hover:-translate-y-1 hover:border-cyan-200
                hover:shadow-lg hover:shadow-sky-100/70
                sm:p-6"
            >
              <div
                className={`mb-4 flex h-11 w-11 items-center
                  justify-center rounded-xl ${service.bg}`}
              >
                <Icon size={25} strokeWidth={1.8} className={service.color} />
              </div>

              <h3 className="mb-2 text-base font-bold text-slate-900">
                {service.title}
              </h3>

              <p className="mb-4 max-w-sm text-sm leading-6 text-slate-500">
                {service.description}
              </p>

              <a
                href={
                  service.title === "Training Programs"
                    ? "#courses"
                    : "#services"
                }
                className="inline-flex items-center gap-1.5
                  text-xs font-bold text-sky-700 transition-colors
                  hover:text-cyan-600"
              >
                {service.link}
                <ArrowRight
                  size={14}
                  className="transition-transform group-hover:translate-x-1"
                />
              </a>
            </article>
          );
        })}
      </div>
    </section>
  );
}
