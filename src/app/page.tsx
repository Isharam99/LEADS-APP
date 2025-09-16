"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, Variants } from "framer-motion";

/* =========================================================
   Centralized contacts (easy to edit later)
   ========================================================= */
const CONTACTS = {
  email: "info@skyrek.com",
  socials: {
    facebook: "https://sample.com/skyrek-facebook",
    twitter: "https://sample.com/skyrek-twitter",
    linkedin: "https://sample.com/skyrek-linkedin",
  },
};

/* =========================================================
   Brand helpers (colors from globals.css)
   ========================================================= */
const GRADIENT =
  "conic-gradient(from 160deg at 50% 50%, var(--color-science-blue), var(--color-azure), var(--color-easter-purple), var(--color-artyclick-purple), var(--color-science-blue))";
const GLASS_BG = "rgba(255,255,255,0.06)";
const GLASS_BORDER = "rgba(255,255,255,0.16)";
const EASE = [0.16, 1, 0.3, 1] as const;

/* =========================================================
   Motion variants
   ========================================================= */
const fadeUp: Variants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
};

const softIn: Variants = {
  initial: { opacity: 0, scale: 0.98 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: EASE } },
};

/* =========================================================
   Page (single-screen, no scroll)
   ========================================================= */
export default function HomePage() {
  return (
    <main className="relative h-dvh w-full overflow-hidden bg-[var(--background)] text-[var(--foreground)]">
      {/* Animated brand gradient aura */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        initial={{ opacity: 0.6, scale: 1.05 }}
        animate={{ opacity: 0.8, scale: 1 }}
        transition={{ duration: 6, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
        style={{
          background: GRADIENT,
          filter: "blur(80px)",
          transform: "translateZ(0)",
          maskImage:
            "radial-gradient(1200px 600px at 50% 40%, rgba(0,0,0,1), rgba(0,0,0,0.05))",
          WebkitMaskImage:
            "radial-gradient(1200px 600px at 50% 40%, rgba(0,0,0,1), rgba(0,0,0,0.05))",
        }}
      />

      {/* Content shell (kept inside viewport to avoid scroll) */}
      <div className="relative z-10 mx-auto flex h-full max-w-6xl flex-col px-6 py-5 sm:px-8 lg:px-10">
        {/* Header */}
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Icon + wordmark (only your own assets) */}
            <Image
              src="/logo-icon.png" // if you don't have this yet, add an icon file; otherwise it will fallback below
              alt="Skyrek Icon"
              width={32}
              height={32}
              className="hidden h-8 w-8 sm:block"
              onError={(e) => {
                // fallback to logo if icon doesn't exist
                const img = e.currentTarget as HTMLImageElement;
                img.src = "/logo.png";
                img.className = "hidden h-8 w-auto sm:block";
              }}
              priority
            />
            <Image
              src="/logo.png"
              alt="Skyrek"
              width={160}
              height={40}
              className="h-8 w-auto"
              priority
            />
          </div>

          <nav className="flex items-center gap-3">
            <CTA href="/signup" small emphasis>
              Sign up
            </CTA>
            <CTA href="/signin" small>
              Sign in
            </CTA>
          </nav>
        </header>

        {/* Centerpiece */}
        <section className="flex flex-1 items-center justify-center">
          <motion.div
            variants={softIn}
            initial="initial"
            animate="animate"
            className="w-full max-w-3xl rounded-3xl px-6 py-8 sm:px-10 sm:py-10"
            style={{
              background: GLASS_BG,
              border: `1px solid ${GLASS_BORDER}`,
              boxShadow: "0 20px 80px rgba(0,0,0,0.25)",
            }}
          >
            <div className="flex flex-col items-center text-center">
              {/* Wordmark for presence */}
              <Image
                src="/logo.png"
                alt="Skyrek"
                width={200}
                height={48}
                className="h-10 w-auto opacity-95"
                priority
              />

              <motion.h1
                variants={fadeUp}
                initial="initial"
                animate="animate"
                className="mt-6 text-4xl font-semibold leading-tight sm:text-5xl"
                style={{
                  background:
                    "linear-gradient(135deg, var(--color-science-blue), var(--color-azure) 60%, var(--color-easter-purple), var(--color-artyclick-purple))",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  color: "transparent",
                }}
              >
                Simplicity that feels premium.
              </motion.h1>

              <motion.p
                variants={fadeUp}
                initial="initial"
                animate="animate"
                className="mx-auto mt-3 max-w-xl text-sm text-foreground/70 sm:text-base"
              >
                Meet the friendliest way to start. Two choices, no clutter—just a beautiful
                beginning to your journey with Skyrek.
              </motion.p>

              <motion.div
                variants={softIn}
                initial="initial"
                animate="animate"
                className="mt-7 flex flex-wrap items-center justify-center gap-3"
              >
                <CTA href="/signup" emphasis>
                  Sign up
                </CTA>
                <CTA href="/signin">Sign in</CTA>
              </motion.div>

              {/* Contact strip */}
              <motion.div
                variants={fadeUp}
                initial="initial"
                animate="animate"
                className="mx-auto mt-7 w-full max-w-md rounded-2xl px-4 py-3 text-xs sm:text-sm"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: `1px solid ${GLASS_BORDER}`,
                }}
              >
                <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
                  <span className="text-foreground/70">Contact</span>
                  <Dot />
                  <a
                    href={`mailto:${CONTACTS.email}`}
                    className="underline-offset-4 hover:text-foreground hover:underline"
                  >
                    {CONTACTS.email}
                  </a>
                  <Dot />
                  <a
                    href={CONTACTS.socials.linkedin}
                    target="_blank"
                    className="underline-offset-4 hover:text-foreground hover:underline"
                  >
                    LinkedIn
                  </a>
                  <Dot />
                  <a
                    href={CONTACTS.socials.facebook}
                    target="_blank"
                    className="underline-offset-4 hover:text-foreground hover:underline"
                  >
                    Facebook
                  </a>
                  <Dot />
                  <a
                    href={CONTACTS.socials.twitter}
                    target="_blank"
                    className="underline-offset-4 hover:text-foreground hover:underline"
                  >
                    X
                  </a>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </section>

        {/* Footer (tiny, within fold) */}
        <footer className="mt-3 flex items-center justify-center text-center text-xs text-foreground/60">
          © {new Date().getFullYear()} Skyrek. All rights reserved.
        </footer>
      </div>
    </main>
  );
}

/* =========================================================
   Tiny components
   ========================================================= */
function CTA({
  href,
  children,
  small,
  emphasis,
}: {
  href: string;
  children: React.ReactNode;
  small?: boolean;
  emphasis?: boolean;
}) {
  const base =
    "inline-flex items-center justify-center rounded-xl border transition-all duration-300 active:scale-[.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-azure)]";
  const size = small ? "px-3 py-1.5 text-sm" : "px-4 py-2 text-sm";
  const style = emphasis
    ? { background: "linear-gradient(135deg, var(--color-science-blue), var(--color-azure) 60%, var(--color-artyclick-purple))", color: "white", borderColor: "transparent", boxShadow: "0 10px 40px rgba(0,0,0,.25)" }
    : { background: "rgba(255,255,255,0.06)", color: "white", borderColor: "rgba(255,255,255,0.16)" };

  return (
    <Link href={href} className={`${base} ${size}`} style={style}>
      {children}
    </Link>
  );
}

function Dot() {
  return <span className="h-1 w-1 rounded-full bg-foreground/40" />;
}
