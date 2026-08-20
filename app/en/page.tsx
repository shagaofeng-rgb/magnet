import Link from "next/link";

const products = [
  {
    title: "Conveyor Magnetic Separators",
    note: "Conveyor protection and ferrous control",
  },
  {
    title: "Mineral & Bulk Separation",
    note: "Bulk processing and material-purity improvement",
  },
  {
    title: "Recycling & Metal Sorting",
    note: "Ferrous and non-ferrous sorting workflows",
  },
  {
    title: "Process Magnets & Filters",
    note: "Dry materials, powders and process streams",
  },
];

const solutions = [
  "Mining & Minerals",
  "Cement & Aggregates",
  "Recycling",
  "Coal & Bulk Handling",
];

const stories = [
  "Featured product selection checklist",
  "How to compare conveyor magnetic routes",
  "Practical QA for bulk-material projects",
];

export default function EnHomePage() {
  return (
    <div className="min-h-screen bg-[#f7f8fb] text-[#10264d]">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-12 px-4 py-10">
        <section className="rounded-3xl border border-[#d8e2f2] bg-white p-8">
          <p className="inline-flex rounded-full border border-[#e4ebf7] px-3 py-1 text-xs font-semibold text-[#0f5ac8]">
            BZMAGNET Industrial Solutions
          </p>
          <h1 className="mt-6 text-3xl leading-snug font-bold md:text-5xl">
            Find the right magnetic separation solution for industrial material
            workflows
          </h1>
          <p className="mt-4 max-w-3xl text-base text-[#3f5478]">
            We help buyers and distributors quickly match product types to real
            conveyor, crushing, and sorting scenarios.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/en/products"
              className="rounded-full bg-[#f59e0b] px-6 py-3 text-sm font-semibold text-[#182339]"
            >
              Browse Products
            </Link>
            <Link
              href="/en/quote"
              className="rounded-full border border-[#1d4ed8] px-6 py-3 text-sm font-semibold text-[#1d4ed8]"
            >
              Request a Quote
            </Link>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold">Products</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {products.map((item) => (
              <div key={item.title} className="rounded-2xl border border-[#d8e2f2] bg-white p-5">
                <p className="text-sm font-semibold text-[#f59e0b]">Category</p>
                <h3 className="mt-2 text-lg font-bold">{item.title}</h3>
                <p className="mt-1 text-sm text-[#4a5b77]">{item.note}</p>
                <Link
                  href="/en/products"
                  className="mt-3 inline-flex text-sm font-semibold text-[#1d4ed8]"
                >
                  View Category →
                </Link>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold">Industry Solutions</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {solutions.map((item) => (
              <Link
                key={item}
                href="/en/industry-solutions"
                className="rounded-2xl border border-[#d8e2f2] bg-white p-5"
              >
                <h3 className="text-lg font-semibold">{item}</h3>
                <p className="mt-1 text-sm text-[#4a5b77]">
                  Explore practical use cases and selection checkpoints.
                </p>
              </Link>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-[#dbe7fb] bg-[#0f2f5f] p-8 text-white">
          <h2 className="text-2xl font-bold">Latest Insights</h2>
          <div className="mt-3 grid gap-3 md:grid-cols-3">
            {stories.map((item) => (
              <Link
                key={item}
                href="/en/news"
                className="rounded-2xl border border-[#2f4e87] bg-[#162c52] p-4"
              >
                <p className="text-xs text-[#b6c9f2]">News</p>
                <p className="mt-1 text-sm font-semibold">{item}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-[#d8e2f2] bg-[#14263d] p-8 text-white">
          <h2 className="text-2xl font-bold">Need Help Finding Suitable Equipment?</h2>
          <p className="mt-2 text-sm text-[#c9d7f2]">
            Send your material and process details and we will help with a practical
            matching route.
          </p>
          <Link
            href="/en/quote"
            className="mt-4 inline-flex rounded-full bg-[#f59e0b] px-6 py-3 text-sm font-semibold text-[#1e2e4a]"
          >
            Request a Quote
          </Link>
        </section>
      </div>
    </div>
  );
}

