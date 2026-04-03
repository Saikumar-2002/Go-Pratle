const mongoose = require("mongoose");

const EventBasicsSchema = new mongoose.Schema(
  {
    eventName: { type: String, required: true, trim: true },
    eventType: { type: String, required: true, trim: true },
    dateMode: { type: String, required: true, enum: ["single", "range"] },
    startDate: { type: String, required: true },
    endDate: { type: String },
    location: { type: String, required: true, trim: true },
    venue: { type: String, trim: true },
  },
  { _id: false }
);

const RequirementSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      required: true,
      enum: ["planner", "performer", "crew"],
      index: true,
    },
    eventBasics: { type: EventBasicsSchema, required: true },
    details: { type: mongoose.Schema.Types.Mixed, required: true },
  },
  { timestamps: true }
);

const Requirement = mongoose.model("Requirement", RequirementSchema);

module.exports = { Requirement };

