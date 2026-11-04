import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  Search,
  X,
  ShieldCheck,
  Code2,
  Network,
  ChartNoAxesCombined,
  Palette,
  BrainCircuit,
  Clock3,
  ArrowRight,
  XCircle,
  Headset,
} from "lucide-react";

const courses = [
  {
    id: 1,
    title: "Ethical Hacking",
    category: "Cybersecurity",
    level: "Advanced",
    duration: "6 Weeks",
    price: 199,
    icon: ShieldCheck,
    color: "cyan",
    description:
      "Learn the fundamentals of ethical vulnerabilities, system security, and networks.",
  },
  {
    id: 2,
    title: "Penetration Testing",
    category: "Cybersecurity",
    level: "Advanced",
    duration: "4 Weeks",
    price: 249,
    icon: ShieldCheck,
    color: "blue",
    description:
      "Master the techniques used by ethical hackers and security professionals.",
  },
  {
    id: 3,
    title: "SOC L1",
    category: "Cybersecurity",
    level: "Beginner",
    duration: "6 Weeks",
    price: 299,
    icon: ShieldCheck,
    color: "indigo",
    description: "Monitor, detect and respond to security incidents.",
  },
  {
    id: 4,
    title: "MERN Stack",
    category: "Web Development",
    level: "Intermediate",
    duration: "6 Weeks",
    price: 349,
    icon: BrainCircuit,
    color: "green",
    description:
      "Build full-stack web applications using MongoDB, Express, React, and Node.",
  },
  {
    id: 5,
    title: "Full Stack Development",
    category: "Web Development",
    level: "Advanced",
    duration: "8 Weeks",
    price: 299,
    icon: Code2,
    color: "teal",
    description: "End-to-end web development from frontend to backend.",
  },
  {
    id: 6,
    title: "Frontend Development",
    category: "Web Development",
    level: "Beginner",
    duration: "4 Weeks",
    price: 199,
    icon: Code2,
    color: "cyan",
    description: "HTML, CSS, JavaScript, React, and modern UI development.",
  },
  {
    id: 7,
    title: "Digital Marketing",
    category: "Digital Marketing",
    level: "Beginner",
    duration: "4 Weeks",
    price: 149,
    icon: ChartNoAxesCombined,
    color: "orange",
    description: "Learn SEO, Google Ads, email marketing, and social media.",
  },
  {
    id: 8,
    title: "Graphics Design",
    category: "Design",
    level: "Beginner",
    duration: "4 Weeks",
    price: 149,
    icon: Palette,
    color: "lime",
    description: "Practice Photoshop, Figma, Canva, and visual design basics.",
  },
  {
    id: 9,
    title: "Networking",
    category: "Networking",
    level: "Intermediate",
    duration: "6 Weeks",
    price: 199,
    icon: Network,
    color: "purple",
    description:
      "Learn network fundamentals, configuration, and troubleshooting.",
  },
];

const categories = [
  "All",
  "Cybersecurity",
  "Web Development",
  "Networking",
  "Digital Marketing",
  "Design",
];
const levels = ["All Levels", "Beginner", "Intermediate", "Advanced"];

const iconColors = {
  cyan: "text-cyan-300 bg-cyan-950",
  blue: "text-sky-300 bg-slate-950",
  indigo: "text-indigo-300 bg-slate-950",
  green: "text-lime-300 bg-slate-950",
  teal: "text-teal-300 bg-slate-950",
  orange: "text-orange-400 bg-slate-950",
  lime: "text-lime-300 bg-slate-950",
  purple: "text-violet-300 bg-slate-950",
};

function CourseCard({ course, onRegister }) {
  const Icon = course.icon;
  return (
    <article className="group flex min-w-0 flex-col rounded-xl border border-sky-100 bg-white p-4 shadow-[0_2px_8px_#0f467408] transition duration-300 hover:-translate-y-1 hover:border-cyan-300 hover:shadow-lg hover:shadow-sky-100 sm:p-5">
      <div className="mb-3 flex items-center gap-2.5">
        <span
          className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-cyan-900/50 ${iconColors[course.color]}`}
        >
          <Icon size={22} />
        </span>
        <span className="max-w-[calc(100%-3rem)] rounded-md bg-sky-100 px-2 py-1 text-[9px] font-bold text-sky-800">
          {course.category}
        </span>
      </div>
      <h2 className="mb-1.5 text-sm font-extrabold text-slate-900 sm:text-[15px]">
        {course.title}
      </h2>
      <p className="mb-4 line-clamp-3 min-h-[54px] text-xs leading-[1.55] text-slate-500">
        {course.description}
      </p>
      <div className="mb-4 mt-auto flex items-center justify-between gap-2 text-[11px] text-slate-500">
        <span className="flex items-center gap-1.5">
          <Clock3 size={14} className="text-cyan-700" />
          {course.duration}
        </span>
        <strong className="text-sm font-extrabold text-slate-900">
          NPR {course.price}
        </strong>
      </div>
      <Link
        to={`/courses/${course.id}`}
        className="mb-2 flex min-h-10 w-full items-center justify-center rounded-md border border-sky-200 px-3 text-xs font-bold text-sky-700 transition hover:border-cyan-300 hover:bg-sky-50 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2"
      >
        View Details
      </Link>
      <button
        onClick={() => onRegister(course)}
        className="flex min-h-10 w-full items-center justify-center gap-2 rounded-md bg-gradient-to-r from-sky-600 to-cyan-600 px-3 text-xs font-bold text-white shadow-sm transition hover:from-sky-700 hover:to-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 active:scale-[.98]"
      >
        Register Now{" "}
        <ArrowRight
          size={15}
          className="transition-transform group-hover:translate-x-1"
        />
      </button>
    </article>
  );
}

function Courses() {
  const [category, setCategory] = useState("All");
  const [level, setLevel] = useState("All Levels");
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const search = searchParams.get("search") ?? "";

  function updateSearch(value) {
    setSearchParams(
      (current) => {
        const next = new URLSearchParams(current);
        if (value) {
          next.set("search", value);
        } else {
          next.delete("search");
        }
        return next;
      },
      { replace: true },
    );
  }

  const filteredCourses = useMemo(
    () =>
      courses.filter((course) => {
        const matchesCategory =
          category === "All" || course.category === category;
        const matchesLevel = level === "All Levels" || course.level === level;
        const term = search.trim().toLowerCase();
        const matchesSearch =
          !term ||
          `${course.title} ${course.category} ${course.description} ${course.level}`
            .toLowerCase()
            .includes(term);
        return matchesCategory && matchesLevel && matchesSearch;
      }),
    [category, level, search],
  );

  return (
    <div id="home" className="min-h-screen bg-[#f8fbff] text-slate-900">
      <section className="relative overflow-hidden border-b border-cyan-900/40 bg-[radial-gradient(ellipse_at_78%_30%,#06466b55,transparent_40%),linear-gradient(110deg,#04101e,#031426)] px-4 py-8 text-white sm:px-6 sm:py-10 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-6 sm:flex-row sm:items-center">
          <div>
            <p className="mb-2 text-[10px] font-bold uppercase tracking-[.2em] text-cyan-300">
              Learn • Build • Secure • Grow
            </p>
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
              Our Courses
            </h1>
            <p className="mt-2 max-w-xl text-xs leading-6 text-slate-300 sm:text-sm">
              Learn in-demand skills and build your future with our expert-led
              training.
            </p>
          </div>
          <label className="flex w-full items-center gap-2 rounded-lg border border-cyan-800 bg-[#041321]/80 px-3 py-2.5 text-slate-300 shadow-inner shadow-black/20 focus-within:border-cyan-400 sm:max-w-xs">
            <Search size={17} className="shrink-0 text-cyan-300" />
            <input
              value={search}
              onChange={(e) => updateSearch(e.target.value)}
              placeholder="Search courses..."
              aria-label="Search courses"
              className="w-full bg-transparent text-xs text-white outline-none placeholder:text-slate-400"
            />
            {search && (
              <button
                type="button"
                onClick={() => updateSearch("")}
                aria-label="Clear search"
              >
                <X size={15} />
              </button>
            )}
          </label>
        </div>
      </section>

      <main
        id="courses"
        className="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-7 lg:px-8"
      >
        <div className="mb-4 flex gap-2 overflow-x-auto pb-1 sm:flex-wrap">
          {categories.map((item) => (
            <button
              key={item}
              onClick={() => setCategory(item)}
              className={`shrink-0 rounded-lg border px-4 py-2.5 text-[11px] font-semibold transition focus:outline-none focus:ring-2 focus:ring-cyan-300 ${category === item ? "border-sky-800 bg-sky-900 text-white shadow-sm" : "border-sky-100 bg-white text-slate-600 hover:border-cyan-300 hover:text-sky-800"}`}
            >
              {item}
            </button>
          ))}
        </div>
        <div className="mb-5 flex gap-2 overflow-x-auto pb-1 sm:flex-wrap">
          {levels.map((item) => (
            <button
              key={item}
              onClick={() => setLevel(item)}
              className={`shrink-0 rounded-lg border px-4 py-2 text-[11px] font-semibold transition focus:outline-none focus:ring-2 focus:ring-cyan-300 ${level === item ? "border-cyan-300 bg-cyan-50 text-sky-800" : "border-sky-100 bg-white text-slate-600 hover:border-cyan-300"}`}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="mb-3 flex items-center justify-between gap-3">
          <p className="text-xs text-slate-500">
            <strong className="text-slate-800">{filteredCourses.length}</strong>{" "}
            courses found
          </p>
          {(category !== "All" || level !== "All Levels" || search) && (
            <button
              onClick={() => {
                setCategory("All");
                setLevel("All Levels");
                updateSearch("");
              }}
              className="text-xs font-bold text-sky-700 hover:text-cyan-700"
            >
              Clear filters <XCircle size={13} className="ml-1 inline" />
            </button>
          )}
        </div>

        {filteredCourses.length ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
            {filteredCourses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                onRegister={(selected) =>
                  navigate(`/register?courseId=${selected.id}`)
                }
              />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-sky-200 bg-white px-5 py-14 text-center">
            <Search className="mx-auto mb-3 text-sky-500" size={30} />
            <h2 className="font-bold text-slate-800">No courses found</h2>
            <p className="mt-1 text-sm text-slate-500">
              Try another search term or change the filters.
            </p>
            <button
              onClick={() => {
                setCategory("All");
                setLevel("All Levels");
                updateSearch("");
              }}
              className="mt-4 rounded-lg bg-sky-700 px-4 py-2 text-xs font-bold text-white hover:bg-sky-800"
            >
              Reset filters
            </button>
          </div>
        )}
      </main>

      <section
        id="services"
        className="mx-auto mb-0 mt-5 max-w-7xl border-t border-cyan-900/40 bg-[#031426] px-5 py-7 text-white sm:px-8 sm:py-8"
      >
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full border border-cyan-800 bg-cyan-950/50 text-cyan-300">
              <Headset size={29} />
            </span>
            <div>
              <h2 className="text-base font-bold sm:text-lg">
                Not sure which course is right for you?
              </h2>
              <p className="mt-1 text-xs leading-5 text-slate-300">
                Talk to our experts and get personalized guidance.
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate("/contact")}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-cyan-400 px-5 py-3 text-xs font-bold text-cyan-300 transition hover:bg-cyan-400 hover:text-slate-950"
          >
            Contact Us <ArrowRight size={15} />
          </button>
        </div>
      </section>
      <footer
        id="contact"
        className="flex flex-col gap-2 bg-[#020d18] px-5 py-5 text-center text-[10px] text-slate-500 sm:flex-row sm:justify-between sm:text-left"
      >
        <span>
          © {new Date().getFullYear()} AskYRA Tech. All rights reserved.
        </span>
        <span>Learn • Build • Secure • Grow</span>
      </footer>

    </div>
  );
}

export default Courses;
