import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex w-full max-w-3xl flex-col gap-6 rounded-2xl border border-black/[.08] bg-white p-8 shadow-sm dark:border-white/[.12] dark:bg-black">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">
            Requirement Posting Flow
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Create an event requirement and submit it to the backend, categorized
            as planner, performer, or crew.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            className="inline-flex h-11 items-center justify-center rounded-xl bg-foreground px-5 font-medium text-background hover:bg-[#383838] dark:hover:bg-[#ccc]"
            href="/post"
          >
            Post a requirement
          </Link>
        </div>
      </main>
    </div>
  );
}
