import {
  UsersRound,
  Send,
  BriefcaseBusiness,
  Tv,
  Camera,
  MapPin,
  Phone,
  Mail,
  ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Brand } from "./Navbar";

const socialLinks = [
  { label: "Facebook", Icon: UsersRound },
  { label: "Twitter", Icon: Send },
  { label: "LinkedIn", Icon: BriefcaseBusiness },
  { label: "YouTube", Icon: Tv },
  { label: "Instagram", Icon: Camera },
];

const links = {
  "Quick Links": [
    ["Home", "/"],
    ["Courses", "/courses"],
    ["Services", "/services"],
    ["About Us", "/"],
    ["Contact", "/contact"],
  ],
  "Our Services": [
    ["Cybersecurity Services", "/services"],
    ["Web Development", "/services"],
    ["Digital Marketing", "/services"],
    ["Graphics Design", "/services"],
  ],
};

export default function Footer() {
  return (
    <footer
      id="contact"
      className="relative overflow-hidden border-t border-cyan-900/60
      bg-[#03101e] text-slate-200"
    >
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0
        h-36 opacity-30"
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 1200 180"
          preserveAspectRatio="xMidYMax slice"
          className="h-full w-full"
        >
          <path
            d="M0 155 L100 120 L180 140 L280 75
            L350 110 L450 25 L530 105 L630 45
            L720 115 L820 65 L900 120 L1010 60
            L1100 125 L1200 90 L1200 180 L0 180Z"
            fill="#07506d"
            stroke="#00bde8"
            strokeWidth="2"
          />
        </svg>
      </div>

      <div
        className="relative mx-auto grid max-w-7xl
        grid-cols-1 gap-8 px-5 py-9 sm:grid-cols-2
        lg:grid-cols-4 lg:px-8"
      >
        <div>
          <Brand />

          <p className="max-w-xs text-xs leading-6 text-slate-300">
            Empowering individuals and businesses with digital skills, secure
            solutions, and technology.
          </p>

          <div className="mt-4 flex gap-3">
            {socialLinks.map(({ label, Icon }) => (
              <a
                key={label}
                href="#contact"
                aria-label={label}
                className="text-slate-300 transition
                hover:text-cyan-300"
              >
                <Icon size={17} />
              </a>
            ))}
          </div>
        </div>

        {Object.entries(links).map(([heading, items]) => (
          <div key={heading}>
            <h3 className="mb-4 text-xs font-extrabold text-white">
              {heading}
            </h3>
            <ul className="space-y-3">
              {items.map(([label, href]) => (
                <li key={label}>
                  <Link
                    to={href}
                    className="text-xs text-slate-300
                    transition hover:text-cyan-300"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div>
          <h3 className="mb-4 text-xs font-extrabold text-white">Contact Us</h3>
          <div className="space-y-3 text-xs text-slate-300">
            <p className="flex gap-2">
              <MapPin size={15} className="shrink-0 text-cyan-400" />
              Kathmandu, Nepal
            </p>
            <p className="flex gap-2">
              <Phone size={15} className="shrink-0 text-cyan-400" />
              Your phone number
            </p>
            <p className="flex gap-2">
              <Mail size={15} className="shrink-0 text-cyan-400" />
              Your email address
            </p>
          </div>

          <h3 className="mb-3 mt-6 text-xs font-extrabold text-white">
            Newsletter
          </h3>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              alert("Connect this form to your backend.");
            }}
            className="flex gap-2"
          >
            <input
              required
              type="email"
              placeholder="Your email"
              aria-label="Your email"
              className="min-w-0 w-full rounded-md border
              border-cyan-900 bg-[#020d18] px-3 py-2
              text-xs text-white outline-none
              focus:border-cyan-400"
            />
            <button
              aria-label="Subscribe"
              className="rounded-md bg-cyan-400 px-3
              text-slate-950 hover:bg-cyan-300"
            >
              <ArrowRight size={16} />
            </button>
          </form>
        </div>
      </div>

      <div
        className="relative border-t border-cyan-900/60
        bg-[#020d18]/80"
      >
        <div
          className="mx-auto flex max-w-7xl flex-col
          gap-3 px-5 py-4 text-[10px] text-slate-400
          sm:flex-row sm:items-center sm:justify-between
          lg:px-8"
        >
          <p>© {new Date().getFullYear()} AskYRA Tech. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#privacy" className="hover:text-cyan-300">
              Privacy Policy
            </a>
            <a href="#terms" className="hover:text-cyan-300">
              Terms &amp; Conditions
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
