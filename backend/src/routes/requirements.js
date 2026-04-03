const express = require("express");
const { z } = require("zod");
const { Requirement } = require("../models/Requirement");

const router = express.Router();

const CategoryEnum = z.enum(["planner", "performer", "crew"]);

const EventBasicsSchema = z.object({
  eventName: z.string().min(1),
  eventType: z.string().min(1),
  dateMode: z.enum(["single", "range"]),
  startDate: z.string().min(1),
  endDate: z.string().optional(),
  location: z.string().min(1),
  venue: z.string().optional(),
});

const PlannerDetailsSchema = z.object({
  guestCount: z.number().int().nonnegative().optional(),
  budgetMin: z.number().nonnegative().optional(),
  budgetMax: z.number().nonnegative().optional(),
  servicesNeeded: z.array(z.string()).default([]),
});

const PerformerDetailsSchema = z.object({
  performanceType: z.string().min(1),
  genre: z.string().optional(),
  setLengthMinutes: z.number().int().positive().optional(),
  equipmentProvidedByClient: z.boolean().optional(),
});

const CrewDetailsSchema = z.object({
  rolesNeeded: z.array(z.string()).min(1),
  crewCount: z.number().int().positive().optional(),
  hoursNeeded: z.number().positive().optional(),
});

const CreateRequirementSchema = z.discriminatedUnion("category", [
  z.object({
    category: z.literal("planner"),
    eventBasics: EventBasicsSchema,
    details: PlannerDetailsSchema,
  }),
  z.object({
    category: z.literal("performer"),
    eventBasics: EventBasicsSchema,
    details: PerformerDetailsSchema,
  }),
  z.object({
    category: z.literal("crew"),
    eventBasics: EventBasicsSchema,
    details: CrewDetailsSchema,
  }),
]);

router.post("/", async (req, res) => {
  const parsed = CreateRequirementSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: "Validation error",
      issues: parsed.error.issues,
    });
  }

  const created = await Requirement.create(parsed.data);
  return res.status(201).json(created);
});

router.get("/", async (req, res) => {
  const category = CategoryEnum.optional().safeParse(req.query.category);
  if (!category.success) {
    return res.status(400).json({ error: "Invalid category" });
  }

  const filter = category.data ? { category: category.data } : {};
  const docs = await Requirement.find(filter).sort({ createdAt: -1 }).limit(50);
  return res.json(docs);
});

module.exports = { requirementsRouter: router };

