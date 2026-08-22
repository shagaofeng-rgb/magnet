import Link from "next/link";

export default function RootPreviewHome() {
  return (
    <div className="min-h-screen bg-[#f7f8fb] text-[#10264d]">
      <div className="mx-auto flex min-h-screen max-w-[1200px] flex-col justify-center gap-6 px-4 py-10">
        <h1 className="text-4xl font-bold">BZMAGNET Homepage Preview</h1>
        <p className="max-w-2xl text-lg text-[#3f5478]">
          你现在打开的是可直接预览的新首页。点击下面入口进入正式语言首页。
        </p>
        <div className="flex flex-wrap gap-3">
          <Link href="/en" className="rounded-full bg-[#f59e0b] px-6 py-3 text-sm font-semibold text-[#1e2e4a]">
            Open /en/ Preview
          </Link>
          <Link href="/preview" className="rounded-full border border-[#1d4ed8] px-6 py-3 text-sm font-semibold text-[#1d4ed8]">
            Open /preview
          </Link>
          <Link href="/ar" className="rounded-full border border-[#0f2f5f] px-6 py-3 text-sm font-semibold text-[#0f2f5f]">
            Open /ar/
          </Link>
        </div>
      </div>
    </div>
  );
}

