import React from "react";

const Skeleton = ({ className = "" }) => (
  <div
    aria-hidden="true"
    className={`animate-pulse rounded-lg bg-white/[0.07] ${className}`}
  />
);

const HomeSkeleton = () => {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#090b0f] text-white">
      {/* Ambient background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-[12%] h-96 w-96 rounded-full bg-[#f7ff72]/[0.05] blur-[120px]" />
        <div className="absolute right-[-10rem] top-[28rem] h-96 w-96 rounded-full bg-violet-500/[0.05] blur-[130px]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.018)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.018)_1px,transparent_1px)] bg-[size:52px_52px]" />
      </div>

      <div className="relative z-10">
        {/* Navbar */}
        <header className="sticky top-0 z-30 border-b border-white/[0.08] bg-[#090b0f]/85 backdrop-blur-xl">
          <nav className="mx-auto flex min-h-[76px] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
            {/* Logo */}
            <div className="flex shrink-0 items-center gap-2.5">
              <Skeleton className="h-10 w-10 rounded-xl bg-[#f7ff72]/20" />

              <div className="flex items-center gap-2">
                <Skeleton className="h-6 w-14 rounded-md" />
                <Skeleton className="hidden h-3 w-20 rounded sm:block" />
              </div>
            </div>

            {/* Navigation actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              <Skeleton className="h-10 w-24 rounded-xl bg-[#f7ff72]/20 sm:w-40" />

              <div className="hidden h-8 w-px bg-white/10 sm:block" />

              <div className="flex items-center gap-2.5">
                <Skeleton className="h-10 w-10 shrink-0 rounded-full bg-[#f7ff72]/10" />

                <div className="hidden space-y-2 lg:block">
                  <Skeleton className="h-3.5 w-36" />
                  <Skeleton className="h-2.5 w-24" />
                </div>
              </div>

              <Skeleton className="h-10 w-10 rounded-xl sm:w-24" />
            </div>
          </nav>
        </header>

        <main className="mx-auto max-w-7xl px-4 pb-10 pt-8 sm:px-6 sm:pt-11 lg:px-8 lg:pt-14">
          {/* Welcome hero */}
          <section className="relative mb-8 overflow-hidden rounded-[28px] border border-white/[0.09] bg-gradient-to-br from-[#171a20] via-[#111319] to-[#10120f] p-6 sm:p-8 lg:p-10">
            {/* Decorative circles */}
            <div className="absolute -right-10 -top-20 h-64 w-64 rounded-full border border-[#f7ff72]/[0.08] sm:h-80 sm:w-80" />
            <div className="absolute -right-2 -top-12 h-52 w-52 rounded-full border border-[#f7ff72]/[0.06] sm:h-64 sm:w-64" />

            <div className="relative flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
              <div className="w-full max-w-2xl">
                <Skeleton className="mb-5 h-8 w-48 rounded-full bg-[#f7ff72]/10" />

                <Skeleton className="mb-3 h-4 w-36" />

                <Skeleton className="h-9 w-full max-w-md rounded-lg sm:h-12" />

                <Skeleton className="mt-4 h-4 w-full max-w-lg" />
                <Skeleton className="mt-2 h-4 w-3/4 max-w-md" />
              </div>

              {/* Projects CTA */}
              <div className="flex w-full max-w-sm items-center justify-between gap-4 rounded-2xl border border-white/10 bg-black/20 p-4 sm:p-5 lg:min-w-[290px]">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-11 w-11 shrink-0 rounded-xl bg-[#f7ff72]/15" />

                  <div>
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="mt-2 h-3 w-32" />
                  </div>
                </div>

                <Skeleton className="h-5 w-5 rounded-full" />
              </div>
            </div>
          </section>

          {/* Account summary cards */}
          <section
            aria-label="Loading account summary"
            aria-busy="true"
            className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3"
          >
            {/* Active account */}
            <article className="rounded-2xl border border-white/[0.08] bg-[#11141a]/90 p-5 sm:p-6">
              <div className="mb-6 flex items-start justify-between">
                <Skeleton className="h-11 w-11 rounded-xl bg-emerald-400/10" />
                <Skeleton className="h-6 w-16 rounded-full bg-emerald-400/10" />
              </div>

              <Skeleton className="h-4 w-28" />
              <Skeleton className="mt-3 h-6 w-36" />
              <Skeleton className="mt-3 h-3 w-full max-w-xs" />
            </article>

            {/* Email address */}
            <article className="rounded-2xl border border-white/[0.08] bg-[#11141a]/90 p-5 sm:p-6">
              <Skeleton className="mb-6 h-11 w-11 rounded-xl bg-[#f7ff72]/10" />

              <Skeleton className="h-4 w-28" />
              <Skeleton className="mt-3 h-6 w-full max-w-xs" />
              <Skeleton className="mt-3 h-3 w-36" />
            </article>

            {/* Member since */}
            <article className="rounded-2xl border border-white/[0.08] bg-[#11141a]/90 p-5 sm:col-span-2 sm:p-6 xl:col-span-1">
              <Skeleton className="mb-6 h-11 w-11 rounded-xl bg-sky-400/10" />

              <Skeleton className="h-4 w-24" />
              <Skeleton className="mt-3 h-6 w-36" />
              <Skeleton className="mt-3 h-3 w-32" />
            </article>
          </section>

          {/* Account details + workspace panel */}
          <section className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,1.6fr)_minmax(270px,0.8fr)] lg:gap-6">
            {/* Account information */}
            <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#11141a]/90">
              <div className="flex flex-col gap-3 border-b border-white/[0.07] px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                <div>
                  <Skeleton className="h-5 w-44" />
                  <Skeleton className="mt-2 h-3.5 w-60 max-w-full" />
                </div>

                <Skeleton className="h-9 w-32 rounded-lg" />
              </div>

              <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 sm:p-6">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={index}
                    className="min-w-0 rounded-xl border border-white/[0.06] bg-[#0b0e12] p-4"
                  >
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="mt-3 h-4 w-full max-w-48" />
                  </div>
                ))}
              </div>
            </div>

            {/* Workspace sidebar */}
            <aside className="relative overflow-hidden rounded-2xl border border-[#f7ff72]/15 bg-gradient-to-br from-[#1a1d17] to-[#11141a] p-5 sm:p-6">
              <div className="absolute -right-12 -top-12 h-36 w-36 rounded-full bg-[#f7ff72]/[0.05] blur-2xl" />

              <div className="relative">
                <Skeleton className="mb-5 h-11 w-11 rounded-xl bg-[#f7ff72]/10" />

                <Skeleton className="h-3 w-28 bg-[#f7ff72]/10" />
                <Skeleton className="mt-3 h-6 w-full max-w-xs" />

                <Skeleton className="mt-4 h-3.5 w-full" />
                <Skeleton className="mt-2 h-3.5 w-11/12" />
                <Skeleton className="mt-2 h-3.5 w-3/4" />

                <div className="my-5 h-px bg-white/[0.08]" />

                <div className="flex items-center gap-3">
                  <Skeleton className="h-9 w-9 shrink-0 rounded-lg bg-[#f7ff72]/10" />

                  <div className="min-w-0 flex-1">
                    <Skeleton className="h-4 w-full max-w-44" />
                    <Skeleton className="mt-2 h-3 w-36 max-w-full" />
                  </div>
                </div>

                <Skeleton className="mt-5 h-12 w-full rounded-xl bg-[#f7ff72]/15" />
              </div>
            </aside>
          </section>

          {/* Footer */}
          <footer className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-white/[0.07] pt-6 sm:flex-row">
            <Skeleton className="h-3 w-48" />

            <Skeleton className="h-3 w-32" />
          </footer>
        </main>
      </div>
    </div>
  );
};

export default HomeSkeleton;
