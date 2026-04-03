"use client";

import { useMemo, useState, type ReactNode } from "react";
import Link from "next/link";

type Category = "planner" | "performer" | "crew";
type DateMode = "single" | "range";

type EventBasics = {
  eventName: string;
  eventType: string;
  dateMode: DateMode;
  startDate: string;
  endDate?: string;
  location: string;
  venue?: string;
};

type PlannerDetails = {
  guestCount?: number;
  servicesNeeded: string[];
  budgetMin?: number;
  budgetMax?: number;
};

type PerformerDetails = {
  performanceType: string;
  genre?: string;
  setLengthMinutes?: number;
  equipmentProvidedByClient?: boolean;
};

type CrewDetails = {
  rolesNeeded: string[];
  crewCount?: number;
  hoursNeeded?: number;
};

type FormState =
  | { category: "planner"; eventBasics: EventBasics; details: PlannerDetails }
  | { category: "performer"; eventBasics: EventBasics; details: PerformerDetails }
  | { category: "crew"; eventBasics: EventBasics; details: CrewDetails };

function classNames(...xs: Array<string | false | undefined>) {
  return xs.filter(Boolean).join(" ");
}

function toNumberOrUndefined(v: string): number | undefined {
  if (!v.trim()) return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={classNames(
        "rounded-full border px-3 py-1 text-sm transition-colors",
        active
          ? "border-transparent bg-foreground text-background"
          : "border-black/[.12] bg-white hover:bg-zinc-50 dark:border-white/[.18] dark:bg-black dark:hover:bg-white/[.06]"
      )}
    >
      {children}
    </button>
  );
}

export default function PostRequirementPage() {
  const apiBase =
    process.env.NEXT_PUBLIC_API_BASE?.trim() || "http://localhost:5000";

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [createdId, setCreatedId] = useState<string | null>(null);

  const [eventBasics, setEventBasics] = useState<EventBasics>({
    eventName: "",
    eventType: "",
    dateMode: "single",
    startDate: "",
    endDate: "",
    location: "",
    venue: "",
  });

  const [category, setCategory] = useState<Category>("planner");

  const [planner, setPlanner] = useState<PlannerDetails>({
    guestCount: undefined,
    servicesNeeded: [],
    budgetMin: undefined,
    budgetMax: undefined,
  });

  const [performer, setPerformer] = useState<PerformerDetails>({
    performanceType: "",
    genre: "",
    setLengthMinutes: undefined,
    equipmentProvidedByClient: undefined,
  });

  const [crew, setCrew] = useState<CrewDetails>({
    rolesNeeded: [],
    crewCount: undefined,
    hoursNeeded: undefined,
  });

  const payload: FormState = useMemo(() => {
    if (category === "planner") {
      return { category, eventBasics, details: planner };
    }
    if (category === "performer") {
      return { category, eventBasics, details: performer };
    }
    return { category, eventBasics, details: crew };
  }, [category, crew, eventBasics, performer, planner]);

  function canContinueFromBasics() {
    if (!eventBasics.eventName.trim()) return false;
    if (!eventBasics.eventType.trim()) return false;
    if (!eventBasics.location.trim()) return false;
    if (!eventBasics.startDate.trim()) return false;
    if (eventBasics.dateMode === "range" && !eventBasics.endDate?.trim())
      return false;
    return true;
  }

  function canContinueFromStep2() {
    if (category === "planner") return true;
    if (category === "performer") return !!performer.performanceType.trim();
    return crew.rolesNeeded.length > 0;
  }

  function canContinueFromStep3() {
    if (category === "planner") return true;
    if (category === "performer") return true;
    return true;
  }

  async function submit() {
    setSubmitting(true);
    setSubmitError(null);
    setCreatedId(null);
    try {
      const res = await fetch(`${apiBase}/api/requirements`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        const msg =
          (data && (data.error || data.message)) ||
          `Request failed (${res.status})`;
        throw new Error(msg);
      }
      setCreatedId(data?._id ?? "created");
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : "Submission failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-full bg-zinc-50 px-4 py-10 font-sans dark:bg-black">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-semibold tracking-tight">
              Post a requirement
            </h1>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Step {step} of 4
            </p>
          </div>
          <Link
            href="/"
            className="text-sm font-medium text-zinc-700 hover:underline dark:text-zinc-300"
          >
            Home
          </Link>
        </div>

        <div className="rounded-2xl border border-black/[.08] bg-white p-6 shadow-sm dark:border-white/[.12] dark:bg-black">
          {step === 1 && (
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <h2 className="text-lg font-semibold">Step 1 — Event basics</h2>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Capture the event details and choose what you’re hiring for.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="flex flex-col gap-1">
                  <span className="text-sm font-medium">Event name</span>
                  <input
                    className="h-11 rounded-xl border border-black/[.12] bg-white px-3 outline-none focus:ring-2 focus:ring-black/10 dark:border-white/[.18] dark:bg-black dark:focus:ring-white/10"
                    value={eventBasics.eventName}
                    onChange={(e) =>
                      setEventBasics((p) => ({ ...p, eventName: e.target.value }))
                    }
                    placeholder="e.g. Wedding Reception"
                  />
                </label>

                <label className="flex flex-col gap-1">
                  <span className="text-sm font-medium">Event type</span>
                  <input
                    className="h-11 rounded-xl border border-black/[.12] bg-white px-3 outline-none focus:ring-2 focus:ring-black/10 dark:border-white/[.18] dark:bg-black dark:focus:ring-white/10"
                    value={eventBasics.eventType}
                    onChange={(e) =>
                      setEventBasics((p) => ({ ...p, eventType: e.target.value }))
                    }
                    placeholder="e.g. Corporate / Private / Festival"
                  />
                </label>

                <div className="flex flex-col gap-2 sm:col-span-2">
                  <span className="text-sm font-medium">Date</span>
                  <div className="flex flex-wrap gap-2">
                    <Chip
                      active={eventBasics.dateMode === "single"}
                      onClick={() =>
                        setEventBasics((p) => ({
                          ...p,
                          dateMode: "single",
                          endDate: "",
                        }))
                      }
                    >
                      Single date
                    </Chip>
                    <Chip
                      active={eventBasics.dateMode === "range"}
                      onClick={() =>
                        setEventBasics((p) => ({ ...p, dateMode: "range" }))
                      }
                    >
                      Date range
                    </Chip>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <label className="flex flex-col gap-1">
                      <span className="text-xs text-zinc-600 dark:text-zinc-400">
                        Start date
                      </span>
                      <input
                        type="date"
                        className="h-11 rounded-xl border border-black/[.12] bg-white px-3 outline-none focus:ring-2 focus:ring-black/10 dark:border-white/[.18] dark:bg-black dark:focus:ring-white/10"
                        value={eventBasics.startDate}
                        onChange={(e) =>
                          setEventBasics((p) => ({
                            ...p,
                            startDate: e.target.value,
                          }))
                        }
                      />
                    </label>
                    <label
                      className={classNames(
                        "flex flex-col gap-1",
                        eventBasics.dateMode !== "range" && "opacity-50"
                      )}
                    >
                      <span className="text-xs text-zinc-600 dark:text-zinc-400">
                        End date
                      </span>
                      <input
                        type="date"
                        disabled={eventBasics.dateMode !== "range"}
                        className="h-11 rounded-xl border border-black/[.12] bg-white px-3 outline-none focus:ring-2 focus:ring-black/10 disabled:cursor-not-allowed dark:border-white/[.18] dark:bg-black dark:focus:ring-white/10"
                        value={eventBasics.endDate ?? ""}
                        onChange={(e) =>
                          setEventBasics((p) => ({
                            ...p,
                            endDate: e.target.value,
                          }))
                        }
                      />
                    </label>
                  </div>
                </div>

                <label className="flex flex-col gap-1">
                  <span className="text-sm font-medium">Location</span>
                  <input
                    className="h-11 rounded-xl border border-black/[.12] bg-white px-3 outline-none focus:ring-2 focus:ring-black/10 dark:border-white/[.18] dark:bg-black dark:focus:ring-white/10"
                    value={eventBasics.location}
                    onChange={(e) =>
                      setEventBasics((p) => ({ ...p, location: e.target.value }))
                    }
                    placeholder="e.g. Hyderabad"
                  />
                </label>

                <label className="flex flex-col gap-1">
                  <span className="text-sm font-medium">
                    Venue <span className="text-zinc-500">(optional)</span>
                  </span>
                  <input
                    className="h-11 rounded-xl border border-black/[.12] bg-white px-3 outline-none focus:ring-2 focus:ring-black/10 dark:border-white/[.18] dark:bg-black dark:focus:ring-white/10"
                    value={eventBasics.venue ?? ""}
                    onChange={(e) =>
                      setEventBasics((p) => ({ ...p, venue: e.target.value }))
                    }
                    placeholder="e.g. Novotel, Hall A"
                  />
                </label>
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-sm font-medium">Hiring for</span>
                <div className="flex flex-wrap gap-2">
                  <Chip active={category === "planner"} onClick={() => setCategory("planner")}>
                    Event Planner
                  </Chip>
                  <Chip
                    active={category === "performer"}
                    onClick={() => setCategory("performer")}
                  >
                    Performer
                  </Chip>
                  <Chip active={category === "crew"} onClick={() => setCategory("crew")}>
                    Crew
                  </Chip>
                </div>
              </div>
            </div>
          )}

          {step === 2 && category === "planner" && (
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <h2 className="text-lg font-semibold">
                  Step 2 — Planner fields
                </h2>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Choose the planning services you need.
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <span className="text-sm font-medium">Services needed</span>
                <div className="flex flex-wrap gap-2">
                  {[
                    "Full planning",
                    "Day-of coordination",
                    "Vendor sourcing",
                    "Budgeting",
                    "Timeline management",
                  ].map((s) => {
                    const active = planner.servicesNeeded.includes(s);
                    return (
                      <Chip
                        key={s}
                        active={active}
                        onClick={() =>
                          setPlanner((p) => ({
                            ...p,
                            servicesNeeded: active
                              ? p.servicesNeeded.filter((x) => x !== s)
                              : [...p.servicesNeeded, s],
                          }))
                        }
                      >
                        {s}
                      </Chip>
                    );
                  })}
                </div>
              </div>

              <label className="flex flex-col gap-1">
                <span className="text-sm font-medium">
                  Guest count <span className="text-zinc-500">(optional)</span>
                </span>
                <input
                  inputMode="numeric"
                  className="h-11 rounded-xl border border-black/[.12] bg-white px-3 outline-none focus:ring-2 focus:ring-black/10 dark:border-white/[.18] dark:bg-black dark:focus:ring-white/10"
                  value={planner.guestCount ?? ""}
                  onChange={(e) =>
                    setPlanner((p) => ({
                      ...p,
                      guestCount: toNumberOrUndefined(e.target.value),
                    }))
                  }
                  placeholder="e.g. 250"
                />
              </label>
            </div>
          )}

          {step === 2 && category === "performer" && (
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <h2 className="text-lg font-semibold">
                  Step 2 — Performer fields
                </h2>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Tell us what kind of performer you need.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="flex flex-col gap-1">
                  <span className="text-sm font-medium">Performance type</span>
                  <input
                    className="h-11 rounded-xl border border-black/[.12] bg-white px-3 outline-none focus:ring-2 focus:ring-black/10 dark:border-white/[.18] dark:bg-black dark:focus:ring-white/10"
                    value={performer.performanceType}
                    onChange={(e) =>
                      setPerformer((p) => ({
                        ...p,
                        performanceType: e.target.value,
                      }))
                    }
                    placeholder="e.g. DJ / Band / Dancer"
                  />
                </label>

                <label className="flex flex-col gap-1">
                  <span className="text-sm font-medium">
                    Genre <span className="text-zinc-500">(optional)</span>
                  </span>
                  <input
                    className="h-11 rounded-xl border border-black/[.12] bg-white px-3 outline-none focus:ring-2 focus:ring-black/10 dark:border-white/[.18] dark:bg-black dark:focus:ring-white/10"
                    value={performer.genre ?? ""}
                    onChange={(e) =>
                      setPerformer((p) => ({ ...p, genre: e.target.value }))
                    }
                    placeholder="e.g. Bollywood / Rock / EDM"
                  />
                </label>
              </div>
            </div>
          )}

          {step === 2 && category === "crew" && (
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <h2 className="text-lg font-semibold">Step 2 — Crew fields</h2>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Select the crew roles you need.
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <span className="text-sm font-medium">Roles needed</span>
                <div className="flex flex-wrap gap-2">
                  {["Sound", "Lighting", "Stagehand", "Security", "Runner"].map(
                    (r) => {
                      const active = crew.rolesNeeded.includes(r);
                      return (
                        <Chip
                          key={r}
                          active={active}
                          onClick={() =>
                            setCrew((p) => ({
                              ...p,
                              rolesNeeded: active
                                ? p.rolesNeeded.filter((x) => x !== r)
                                : [...p.rolesNeeded, r],
                            }))
                          }
                        >
                          {r}
                        </Chip>
                      );
                    }
                  )}
                </div>
                {crew.rolesNeeded.length === 0 && (
                  <p className="text-xs text-zinc-600 dark:text-zinc-400">
                    Pick at least one role to continue.
                  </p>
                )}
              </div>
            </div>
          )}

          {step === 3 && category === "planner" && (
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <h2 className="text-lg font-semibold">
                  Step 3 — Planner fields
                </h2>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Optional budget range.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="flex flex-col gap-1">
                  <span className="text-sm font-medium">
                    Budget min <span className="text-zinc-500">(optional)</span>
                  </span>
                  <input
                    inputMode="numeric"
                    className="h-11 rounded-xl border border-black/[.12] bg-white px-3 outline-none focus:ring-2 focus:ring-black/10 dark:border-white/[.18] dark:bg-black dark:focus:ring-white/10"
                    value={planner.budgetMin ?? ""}
                    onChange={(e) =>
                      setPlanner((p) => ({
                        ...p,
                        budgetMin: toNumberOrUndefined(e.target.value),
                      }))
                    }
                    placeholder="e.g. 50000"
                  />
                </label>

                <label className="flex flex-col gap-1">
                  <span className="text-sm font-medium">
                    Budget max <span className="text-zinc-500">(optional)</span>
                  </span>
                  <input
                    inputMode="numeric"
                    className="h-11 rounded-xl border border-black/[.12] bg-white px-3 outline-none focus:ring-2 focus:ring-black/10 dark:border-white/[.18] dark:bg-black dark:focus:ring-white/10"
                    value={planner.budgetMax ?? ""}
                    onChange={(e) =>
                      setPlanner((p) => ({
                        ...p,
                        budgetMax: toNumberOrUndefined(e.target.value),
                      }))
                    }
                    placeholder="e.g. 150000"
                  />
                </label>
              </div>
            </div>
          )}

          {step === 3 && category === "performer" && (
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <h2 className="text-lg font-semibold">
                  Step 3 — Performer fields
                </h2>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Optional performance details.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="flex flex-col gap-1">
                  <span className="text-sm font-medium">
                    Set length (minutes){" "}
                    <span className="text-zinc-500">(optional)</span>
                  </span>
                  <input
                    inputMode="numeric"
                    className="h-11 rounded-xl border border-black/[.12] bg-white px-3 outline-none focus:ring-2 focus:ring-black/10 dark:border-white/[.18] dark:bg-black dark:focus:ring-white/10"
                    value={performer.setLengthMinutes ?? ""}
                    onChange={(e) =>
                      setPerformer((p) => ({
                        ...p,
                        setLengthMinutes: toNumberOrUndefined(e.target.value),
                      }))
                    }
                    placeholder="e.g. 90"
                  />
                </label>

                <label className="flex items-center gap-3 rounded-xl border border-black/[.12] bg-white px-3 py-3 dark:border-white/[.18] dark:bg-black">
                  <input
                    type="checkbox"
                    checked={!!performer.equipmentProvidedByClient}
                    onChange={(e) =>
                      setPerformer((p) => ({
                        ...p,
                        equipmentProvidedByClient: e.target.checked,
                      }))
                    }
                  />
                  <span className="text-sm">
                    Client provides equipment (optional)
                  </span>
                </label>
              </div>
            </div>
          )}

          {step === 3 && category === "crew" && (
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <h2 className="text-lg font-semibold">Step 3 — Crew fields</h2>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Optional staffing details.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="flex flex-col gap-1">
                  <span className="text-sm font-medium">
                    Crew count <span className="text-zinc-500">(optional)</span>
                  </span>
                  <input
                    inputMode="numeric"
                    className="h-11 rounded-xl border border-black/[.12] bg-white px-3 outline-none focus:ring-2 focus:ring-black/10 dark:border-white/[.18] dark:bg-black dark:focus:ring-white/10"
                    value={crew.crewCount ?? ""}
                    onChange={(e) =>
                      setCrew((p) => ({
                        ...p,
                        crewCount: toNumberOrUndefined(e.target.value),
                      }))
                    }
                    placeholder="e.g. 6"
                  />
                </label>

                <label className="flex flex-col gap-1">
                  <span className="text-sm font-medium">
                    Hours needed <span className="text-zinc-500">(optional)</span>
                  </span>
                  <input
                    inputMode="numeric"
                    className="h-11 rounded-xl border border-black/[.12] bg-white px-3 outline-none focus:ring-2 focus:ring-black/10 dark:border-white/[.18] dark:bg-black dark:focus:ring-white/10"
                    value={crew.hoursNeeded ?? ""}
                    onChange={(e) =>
                      setCrew((p) => ({
                        ...p,
                        hoursNeeded: toNumberOrUndefined(e.target.value),
                      }))
                    }
                    placeholder="e.g. 8"
                  />
                </label>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <h2 className="text-lg font-semibold">Step 4 — Review & submit</h2>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  This will be saved under{" "}
                  <span className="font-medium">{payload.category}</span>.
                </p>
              </div>

              <div className="rounded-xl border border-black/[.08] bg-zinc-50 p-4 text-sm dark:border-white/[.12] dark:bg-white/[.06]">
                <pre className="whitespace-pre-wrap break-words">
                  {JSON.stringify(payload, null, 2)}
                </pre>
              </div>

              {submitError && (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-700 dark:text-red-300">
                  {submitError}
                </div>
              )}
              {createdId && (
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-800 dark:text-emerald-200">
                  Saved successfully. ID: <span className="font-mono">{createdId}</span>
                </div>
              )}
            </div>
          )}

          <div className="mt-6 flex items-center justify-between gap-3 border-t border-black/[.06] pt-5 dark:border-white/[.10]">
            <button
              type="button"
              className="h-11 rounded-xl border border-black/[.12] bg-white px-4 text-sm font-medium hover:bg-zinc-50 disabled:opacity-50 dark:border-white/[.18] dark:bg-black dark:hover:bg-white/[.06]"
              onClick={() => {
                setSubmitError(null);
                setCreatedId(null);
                setStep((s) => (s === 1 ? 1 : ((s - 1) as 1 | 2 | 3 | 4)));
              }}
              disabled={step === 1 || submitting}
            >
              Back
            </button>

            <div className="flex items-center gap-2">
              {step < 4 ? (
                <button
                  type="button"
                  className="h-11 rounded-xl bg-foreground px-5 text-sm font-medium text-background hover:bg-[#383838] disabled:opacity-50 dark:hover:bg-[#ccc]"
                  onClick={() => {
                    setSubmitError(null);
                    setCreatedId(null);
                    setStep((s) => ((s + 1) as 1 | 2 | 3 | 4));
                  }}
                  disabled={
                    submitting ||
                    (step === 1 && !canContinueFromBasics()) ||
                    (step === 2 && !canContinueFromStep2()) ||
                    (step === 3 && !canContinueFromStep3())
                  }
                >
                  Continue
                </button>
              ) : (
                <button
                  type="button"
                  className="h-11 rounded-xl bg-foreground px-5 text-sm font-medium text-background hover:bg-[#383838] disabled:opacity-50 dark:hover:bg-[#ccc]"
                  onClick={submit}
                  disabled={submitting}
                >
                  {submitting ? "Submitting..." : "Submit"}
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="text-xs text-zinc-600 dark:text-zinc-400">
          Backend: <span className="font-mono">{apiBase}</span>
        </div>
      </div>
    </div>
  );
}

