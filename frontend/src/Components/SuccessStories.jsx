import { useState } from "react";
import { ArrowRight, ArrowUpRight, Quote } from "lucide-react";

const stories = [
  {
    name: "Robin Shrestha",
    role: "Student",
    quote:
      "The Ethical Hacking course at AskYra Tech gave me the skills and confidence to start my career in cybersecurity.",
    image:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80",
  },
  {
    name: "Sujata Sharma",
    role: "IT Manager, Himalayan Pvt. Ltd.",
    quote:
      "Their VAPT service helped us identify critical vulnerabilities and strengthen our security posture. Highly professional team!",
    image:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80",
  },
  {
    name: "Bijan Gurung",
    role: "Student",
    quote:
      "The web development training was practical and easy to follow. Now I feel much more confident as a developer.",
    image:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=120&q=80",
  },
  {
    name: "Anisha Thapa",
    role: "Frontend Developer",
    quote:
      "The hands-on projects helped me understand React and build real-world applications. The mentors were very supportive.",
    image:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=120&q=80",
  },
  {
    name: "Sagar Adhikari",
    role: "Business Owner",
    quote:
      "AskYra Tech helped us build a professional website that improved our online presence and customer experience.",
    image:
      "https://images.unsplash.com/photo-1504257432389-52343af06ae3?auto=format&fit=crop&w=120&q=80",
  },
  {
    name: "Priya Karki",
    role: "Cybersecurity Trainee",
    quote:
      "The training made complex security concepts easier to understand. I especially enjoyed the practical lab sessions.",
    image:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=120&q=80",
  },
];

function StoryCard({ story }) {
  return (
    <article className="group flex h-full flex-col rounded-xl border border-sky-100 bg-white p-4 shadow-[0_3px_15px_rgba(15,60,100,0.04)] transition duration-300 hover:-translate-y-1 hover:border-sky-200 hover:shadow-lg sm:p-5">
      <div className="mb-3 flex items-center gap-3">
        <img
          src={story.image}
          alt={story.name}
          loading="lazy"
          className="h-11 w-11 rounded-full border-2 border-sky-100 object-cover"
        />
        <span className="grid h-7 w-7 place-items-center rounded-full bg-sky-50 text-sky-700">
          <Quote size={15} />
        </span>
      </div>

      <blockquote className="flex-1 text-xs leading-6 text-slate-600 sm:text-[13px]">
        “{story.quote}”
      </blockquote>

      <div className="mt-5 border-t border-slate-100 pt-3">
        <h3 className="text-xs font-extrabold text-slate-900">{story.name}</h3>
        <p className="mt-1 text-[11px] leading-5 text-slate-500">
          {story.role}
        </p>
      </div>
    </article>
  );
}

export default function SuccessStories() {
  const [showAll, setShowAll] = useState(false);

  const visibleStories = showAll ? stories : stories.slice(0, 3);

  return (
    <section
      id="success-stories"
      className="bg-gradient-to-br from-[#f7fbff] to-[#edf6fd] px-4 py-10 sm:px-6 sm:py-14 lg:px-8"
    >
      <div className="mx-auto max-w-7xl">
        {/* Section heading */}
        <div className="mb-6 flex items-end justify-between gap-4 sm:mb-8">
          <div>
            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-sky-600">
              Trusted by learners and businesses
            </p>

            <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
              Success Stories
            </h2>

            <p className="mt-2 text-xs text-slate-600 sm:text-sm">
              Real People. Real Growth.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowAll((previous) => !previous)}
            aria-expanded={showAll}
            className="flex shrink-0 items-center gap-1.5 rounded-md px-2 py-2 text-xs font-bold text-sky-700 underline decoration-sky-300 underline-offset-4 transition hover:text-cyan-600 focus:outline-none focus:ring-2 focus:ring-sky-300 sm:text-sm"
          >
            {showAll ? "Show Less" : "View All"}
            {showAll ? (
              <ArrowRight size={15} className="-rotate-90" />
            ) : (
              <ArrowRight size={15} />
            )}
          </button>
        </div>

        {/* Testimonial cards */}
        <div
          className={`grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 ${
            showAll ? "animate-in" : ""
          }`}
        >
          {visibleStories.map((story) => (
            <StoryCard key={story.name} story={story} />
          ))}
        </div>

        {/* Bottom call to action */}
        <div className="mt-7 flex flex-col items-start justify-between gap-4 rounded-xl border border-sky-100 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:px-7">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 sm:text-base">
              Ready to write your success story?
            </h3>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              Learn new skills, build projects, and grow with AskYra Tech.
            </p>
          </div>

          <a
            href="/courses"
            className="inline-flex items-center justify-center gap-2 rounded-md bg-gradient-to-r from-cyan-500 to-sky-600 px-5 py-3 text-xs font-bold text-white shadow-sm transition hover:from-cyan-600 hover:to-sky-700 focus:outline-none focus:ring-2 focus:ring-cyan-300"
          >
            Explore Courses
            <ArrowUpRight size={15} />
          </a>
        </div>
      </div>
    </section>
  );
}
