import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ShieldCheck,
  Check,
  Clock3,
  Star,
  CalendarDays,
  GraduationCap,
  BookOpen,
  Monitor,
  Award,
  MapPin,
  Users,
  ArrowRight,
  Laptop,
  BadgeCheck,
} from "lucide-react";
import courseDetails from "./courseDetailsData";

const tabs = ["Overview", "Syllabus", "Trainer", "Schedule", "Reviews"];

export default function CourseDetails() {
  const { id } = useParams();
  const course = courseDetails[id];
  const [activeTab, setActiveTab] = useState("Overview");
  const navigate = useNavigate();

  if (!course) {
    return (
      <main className="grid min-h-[60vh] place-items-center bg-[#f7fbff] px-4 text-center">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            Course not found
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            The course you are looking for does not exist.
          </p>
          <Link
            to="/courses"
            className="mt-5 inline-flex rounded-md bg-sky-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-sky-800"
          >
            Browse courses
          </Link>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7fbff] font-sans text-slate-900">
      {/* Course hero */}
      <section className="border-b border-cyan-900/50 bg-[radial-gradient(ellipse_at_80%_40%,#07507155,transparent_45%),linear-gradient(110deg,#03101e,#04172a)] px-4 py-7 text-white sm:px-6 sm:py-9 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 sm:flex-row sm:items-center">
          <div className="grid h-24 w-24 shrink-0 place-items-center rounded-2xl border border-cyan-400/60 bg-[#041a2a] sm:h-28 sm:w-28">
            <ShieldCheck
              size={57}
              strokeWidth={1.3}
              className="text-cyan-300"
            />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-extrabold sm:text-3xl">
                {course.title}
              </h1>
              <span className="rounded-md bg-cyan-950 px-2 py-1 text-[10px] font-bold text-cyan-300">
                {course.category}
              </span>
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-4 text-xs">
              <strong className="text-cyan-300">NPR {course.price}</strong>
              <span className="flex items-center gap-1 text-slate-300">
                <Star size={13} className="fill-amber-400 text-amber-400" />
                {course.rating} ({course.reviewCount} Reviews)
              </span>
            </div>

            <p className="mt-3 text-xs leading-6 text-slate-300 sm:text-sm">
              {course.overview}
            </p>

            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-[10px] text-slate-300">
              <span className="flex items-center gap-1.5">
                <Clock3 size={14} className="text-cyan-300" />
                {course.duration}
              </span>
              <span className="flex items-center gap-1.5">
                <GraduationCap size={14} className="text-cyan-300" />
                {course.level}
              </span>
              <span className="flex items-center gap-1.5">
                <Monitor size={14} className="text-cyan-300" />
                {course.mode}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <div className="border-b border-sky-100 bg-white px-4 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl gap-5 overflow-x-auto sm:gap-8">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`shrink-0 border-b-2 px-1 py-4 text-xs font-semibold transition ${
                activeTab === tab
                  ? "border-sky-600 text-sky-800"
                  : "border-transparent text-slate-500 hover:text-sky-700"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <main
        id="courses"
        className="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-7 lg:px-8"
      >
        {activeTab === "Overview" && (
          <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[1.2fr_.9fr] lg:gap-6">
            <section className="rounded-xl border border-sky-100 bg-white p-5 sm:p-6">
              <h2 className="mb-5 text-sm font-extrabold">What You’ll Learn</h2>
              <ul className="space-y-3">
                {course.outcomes.map((topic) => (
                  <li
                    key={topic}
                    className="flex items-start gap-2.5 text-xs leading-5 text-slate-600"
                  >
                    <Check
                      size={15}
                      className="mt-0.5 shrink-0 text-cyan-500"
                      strokeWidth={3}
                    />
                    {topic}
                  </li>
                ))}
              </ul>

              <h2 className="mb-5 mt-8 text-sm font-extrabold">
                Course Details
              </h2>
              <div className="space-y-4">
                {[
                  [CalendarDays, "Duration", course.duration],
                  [BookOpen, "Level", course.level],
                  [Monitor, "Mode", course.mode],
                  [Award, "Certificate", course.certificate],
                ].map(([Icon, label, value]) => (
                  <div
                    key={label}
                    className="grid grid-cols-[18px_75px_1fr] items-start gap-2 text-xs"
                  >
                    <Icon size={15} className="text-sky-700" />
                    <span className="text-slate-500">{label}</span>
                    <strong className="font-semibold text-slate-700">
                      {value}
                    </strong>
                  </div>
                ))}
              </div>
            </section>

            <div className="space-y-5">
              <section className="px-2 py-1 sm:px-3">
                <h2 className="mb-4 text-sm font-extrabold">
                  Meet Your Trainer
                </h2>
                <div className="flex items-center gap-3">
                  <div className="grid h-14 w-14 shrink-0 place-items-center rounded-full border-2 border-sky-100 bg-gradient-to-br from-amber-100 to-slate-300 text-2xl">
                    {course.trainerEmoji}
                  </div>
                  <div>
                    <h3 className="text-xs font-extrabold">{course.trainer}</h3>
                    <p className="mt-1 text-[10px] text-slate-500">
                      {course.trainerRole}
                    </p>
                  </div>
                </div>
                <p className="mt-3 text-xs leading-5 text-slate-500">
                  {course.trainerBio}
                </p>
                <div className="mt-3 flex gap-3 text-sky-700">
                  <MapPin size={17} />
                  <BadgeCheck size={17} />
                  <Users size={17} />
                </div>
              </section>

              <section className="rounded-xl border border-sky-100 bg-white p-4">
                <h2 className="mb-4 text-sm font-extrabold">Course Schedule</h2>
                <p className="text-xs text-slate-500">
                  Starts: {course.startDate}
                </p>
                <p className="mt-3 flex items-center gap-2 text-xs text-slate-600">
                  <Clock3 size={14} className="text-cyan-600" />
                  {course.schedule} | {course.hours}
                </p>
                <div className="mt-4 border-t border-sky-100 pt-4">
                  <button
                    onClick={() => navigate(`/register?courseId=${id}`)}
                    className="flex w-full items-center justify-center gap-2 rounded-md bg-cyan-500 px-4 py-3 text-xs font-extrabold text-white transition hover:bg-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-300 focus:ring-offset-2"
                  >
                    Register Now <ArrowRight size={15} />
                  </button>
                </div>
              </section>
            </div>
          </div>
        )}

        {activeTab === "Syllabus" && (
          <section className="rounded-xl border border-sky-100 bg-white p-5 sm:p-6">
            <h2 className="mb-5 text-base font-extrabold">Course Syllabus</h2>
            <div className="space-y-3">
              {course.syllabus.map(([title, description], index) => (
                <div
                  key={title}
                  className="flex items-center gap-3 rounded-lg border border-sky-100 p-4"
                >
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-cyan-50 text-sm font-bold text-sky-800">
                    {index + 1}
                  </span>
                  <div>
                    <h3 className="text-sm font-bold">{title}</h3>
                    <p className="mt-1 text-xs text-slate-500">
                      {description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {activeTab === "Trainer" && (
          <section className="rounded-xl border border-sky-100 bg-white p-6">
            <h2 className="text-base font-extrabold">Meet Your Trainer</h2>
            <div className="mt-5 flex flex-col gap-4 sm:flex-row">
              <div className="grid h-20 w-20 shrink-0 place-items-center rounded-full bg-gradient-to-br from-amber-100 to-slate-300 text-4xl">
                {course.trainerEmoji}
              </div>
              <div>
                <h3 className="font-bold">{course.trainer}</h3>
                <p className="mt-1 text-xs text-slate-500">
                  {course.trainerRole}
                </p>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
                  {course.trainerBio}
                </p>
              </div>
            </div>
          </section>
        )}

        {activeTab === "Schedule" && (
          <section className="rounded-xl border border-sky-100 bg-white p-5 sm:p-6">
            <h2 className="text-base font-extrabold">Course Schedule</h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-sky-100 p-4">
                <CalendarDays className="mb-3 text-cyan-600" />
                <p className="text-xs text-slate-500">Start date</p>
                <p className="mt-1 text-sm font-bold">{course.startDate}</p>
              </div>
              <div className="rounded-lg border border-sky-100 p-4">
                <Clock3 className="mb-3 text-cyan-600" />
                <p className="text-xs text-slate-500">Class hours</p>
                <p className="mt-1 text-sm font-bold">
                  {course.schedule}, {course.hours}
                </p>
              </div>
            </div>
          </section>
        )}

        {activeTab === "Reviews" && (
          <section className="rounded-xl border border-sky-100 bg-white p-5 sm:p-6">
            <h2 className="text-base font-extrabold">Student Reviews</h2>
            <div className="mt-4 flex items-center gap-3">
              <span className="text-3xl font-extrabold">{course.rating}</span>
              <div>
                <div className="flex text-amber-400">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Star key={n} size={16} className="fill-current" />
                  ))}
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  {course.reviewCount} reviews · Sample data
                </p>
              </div>
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-600">
              Student reviews can be displayed here when connected to your
              backend.
            </p>
          </section>
        )}

        {/* Dark promotional banner */}
        <section
          id="contact"
          className="relative isolate mt-6 overflow-hidden rounded-xl border border-cyan-900/60 bg-[#03101e] p-5 text-white sm:p-7"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_80%_50%,#07507170,transparent_45%)]"
          />
          <div className="flex flex-col gap-5 sm:min-h-32 sm:flex-row sm:items-center sm:justify-between sm:pr-40">
            <div className="max-w-lg">
              <h2 className="text-lg font-extrabold">Secure Your Future</h2>
              <p className="mt-2 text-xs leading-6 text-slate-300">
                Explore the {course.title} curriculum and learn with
                instructor guidance and practical projects.
              </p>
              <button
                onClick={() => navigate("/contact")}
                className="mt-4 inline-flex items-center gap-2 rounded-md border border-cyan-700 bg-sky-900/70 px-4 py-2.5 text-xs font-bold text-cyan-200 transition hover:bg-cyan-800"
              >
                Contact Us <ArrowRight size={14} />
              </button>
            </div>
            <div
              aria-hidden="true"
              className="absolute bottom-0 right-7 hidden h-36 w-32 items-end justify-center sm:flex"
            >
              <div className="relative h-28 w-20 rounded-t-[45%] border border-cyan-900 bg-gradient-to-b from-slate-700 to-[#020914]">
                <div className="absolute left-3 top-4 h-12 w-14 rounded-t-[50%] border border-cyan-800 bg-[#061a2b]" />
                <Laptop
                  className="absolute -left-5 bottom-2 text-cyan-400"
                  size={58}
                  strokeWidth={1}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Light promotional banner */}
        <section className="relative mt-5 overflow-hidden rounded-xl border border-sky-100 bg-gradient-to-r from-white via-sky-50 to-[#d9eff9] p-5 sm:p-7">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(ellipse_at_80%_70%,#93c5fd70,transparent_65%)]"
          />
          <div className="relative max-w-lg sm:pr-36">
            <h2 className="text-base font-extrabold">Secure Your Future</h2>
            <p className="mt-2 text-xs leading-6 text-slate-600">
              Build practical skills in {course.title} through a structured
              curriculum and instructor guidance.
            </p>
            <button
              onClick={() => navigate(`/register?courseId=${id}`)}
              className="mt-3 inline-flex items-center gap-2 text-xs font-bold text-sky-800 hover:text-cyan-600"
            >
              Explore Course <ArrowRight size={14} />
            </button>
          </div>
          <div
            aria-hidden="true"
            className="absolute bottom-0 right-6 hidden h-28 w-24 items-end justify-center sm:flex"
          >
            <div className="relative h-24 w-16 rounded-t-[45%] border border-slate-400/60 bg-gradient-to-b from-slate-600 to-slate-950">
              <div className="absolute -left-2 top-1 h-8 w-20 -rotate-12 rounded-t-full border border-slate-400 bg-slate-800" />
              <Laptop
                className="absolute -left-4 bottom-2 text-sky-700"
                size={50}
                strokeWidth={1}
              />
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-cyan-900/60 bg-[#020d18] px-5 py-4 text-center text-[10px] text-slate-400 sm:flex sm:items-center sm:justify-between sm:px-8">
        <span>
          © {new Date().getFullYear()} AskYRA Tech. All rights reserved.
        </span>
        <span className="mt-2 block sm:mt-0">
          Learn • Build • Secure • Grow
        </span>
      </footer>

    </div>
  );
}
