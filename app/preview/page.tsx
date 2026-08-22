import Link from "next/link";

export default function PreviewHome() {
  return (
    <div className="min-h-screen bg-[#f7f8fb] text-[#13223a]">
      <div className="mx-auto flex min-h-screen max-w-[1200px] items-center justify-center px-4">
        <section className="w-full rounded-3xl border border-[#d8e2f2] bg-white p-8 shadow-sm">
          <p className="inline-flex items-center rounded-full border border-[#e4ebf7] px-3 py-1 text-xs font-semibold text-[#0f5ac8]">
            BZMAGNET Home Preview
          </p>
          <h1 className="mt-6 text-3xl font-bold text-[#0f2f5f]">
            Magnetic Equipment for Industrial Applications
          </h1>
          <p className="mt-4 max-w-2xl text-[#314566]">
            The redesigned homepage is now working under a stable preview route first.
            This route only serves as a temporary preview gate.
          </p>
          <div className="mt-6 flex gap-3">
            <Link
              href="/en"
              className="inline-flex rounded-full bg-[#f59e0b] px-5 py-3 text-sm font-semibold text-[#1a1a1a]"
            >
              Open /en/
            </Link>
            <Link
              href="/"
              className="inline-flex rounded-full border border-[#1d4ed8] px-5 py-3 text-sm font-semibold text-[#1d4ed8]"
            >
              Back to home
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}

