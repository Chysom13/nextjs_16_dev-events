import mongoose, { Model, Schema } from "mongoose"

export interface IEvent {
  title: string
  slug: string
  description: string
  overview: string
  image: string
  venue: string
  location: string
  date: string
  time: string
  mode: string
  audience: string
  agenda: string[]
  organizer: string
  tags: string[]
  createdAt: Date
  updatedAt: Date
}

const nonEmptyStringValidator = {
  validator: (value: string): boolean => value.trim().length > 0,
  message: "This field cannot be empty.",
}

const nonEmptyStringArrayValidator = {
  validator: (values: string[]): boolean =>
    Array.isArray(values) &&
    values.length > 0 &&
    values.every((item) => item.trim().length > 0),
  message: "This array must contain at least one non-empty value.",
}

const eventSchema = new Schema<IEvent>(
  {
    title: {
      type: String,
      required: [true, "Title is required."],
      trim: true,
      validate: nonEmptyStringValidator,
    },
    slug: {
      type: String,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required."],
      trim: true,
      validate: nonEmptyStringValidator,
    },
    overview: {
      type: String,
      required: [true, "Overview is required."],
      trim: true,
      validate: nonEmptyStringValidator,
    },
    image: {
      type: String,
      required: [true, "Image is required."],
      trim: true,
      validate: nonEmptyStringValidator,
    },
    venue: {
      type: String,
      required: [true, "Venue is required."],
      trim: true,
      validate: nonEmptyStringValidator,
    },
    location: {
      type: String,
      required: [true, "Location is required."],
      trim: true,
      validate: nonEmptyStringValidator,
    },
    date: {
      type: String,
      required: [true, "Date is required."],
      trim: true,
      validate: nonEmptyStringValidator,
    },
    time: {
      type: String,
      required: [true, "Time is required."],
      trim: true,
      validate: nonEmptyStringValidator,
    },
    mode: {
      type: String,
      required: [true, "Mode is required."],
      trim: true,
      validate: nonEmptyStringValidator,
    },
    audience: {
      type: String,
      required: [true, "Audience is required."],
      trim: true,
      validate: nonEmptyStringValidator,
    },
    agenda: {
      type: [String],
      required: [true, "Agenda is required."],
      validate: nonEmptyStringArrayValidator,
    },
    organizer: {
      type: String,
      required: [true, "Organizer is required."],
      trim: true,
      validate: nonEmptyStringValidator,
    },
    tags: {
      type: [String],
      required: [true, "Tags are required."],
      validate: nonEmptyStringArrayValidator,
    },
  },
  {
    timestamps: true,
  },
)

eventSchema.index({ slug: 1 }, { unique: true })

const slugify = (value: string): string =>
  value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")

const normalizeDateToISO = (value: string): string => {
  const parsedDate = new Date(value)

  if (Number.isNaN(parsedDate.getTime())) {
    throw new Error("Invalid date format. Use a valid date value.")
  }

  // Keep date values consistent as ISO date strings: YYYY-MM-DD.
  return parsedDate.toISOString().split("T")[0]
}

const normalizeTime = (value: string): string => {
  const normalized = value.trim()
  const amPmMatch = normalized.match(/^(\d{1,2}):(\d{2})\s*([AaPp][Mm])$/)

  if (amPmMatch) {
    const [, hoursRaw, minutesRaw, periodRaw] = amPmMatch
    const minutes = Number(minutesRaw)

    if (minutes < 0 || minutes > 59) {
      throw new Error("Invalid time format. Minutes must be between 00 and 59.")
    }

    let hours = Number(hoursRaw)
    if (hours < 1 || hours > 12) {
      throw new Error("Invalid time format. Hours must be between 1 and 12.")
    }

    const period = periodRaw.toUpperCase()
    if (period === "PM" && hours !== 12) {
      hours += 12
    } else if (period === "AM" && hours === 12) {
      hours = 0
    }

    // Persist times in 24-hour format for consistent storage/querying.
    return `${hours.toString().padStart(2, "0")}:${minutesRaw}`
  }

  const twentyFourHourMatch = normalized.match(/^(\d{1,2}):(\d{2})$/)
  if (twentyFourHourMatch) {
    const [, hoursRaw, minutesRaw] = twentyFourHourMatch
    const hours = Number(hoursRaw)
    const minutes = Number(minutesRaw)

    if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
      throw new Error("Invalid time format. Use HH:mm in a valid range.")
    }

    return `${hours.toString().padStart(2, "0")}:${minutesRaw}`
  }

  throw new Error("Invalid time format. Use HH:mm or hh:mm AM/PM.")
}

eventSchema.pre("save", function (next) {
  try {
    // Regenerate slug only when title changes to keep stable URLs.
    if (this.isModified("title")) {
      const generatedSlug = slugify(this.title)
      if (!generatedSlug) {
        throw new Error("Unable to generate slug from title.")
      }
      this.slug = generatedSlug
    }

    if (this.isModified("date")) {
      this.date = normalizeDateToISO(this.date)
    }

    if (this.isModified("time")) {
      this.time = normalizeTime(this.time)
    }

    next()
  } catch (error) {
    next(error as Error)
  }
})

export const Event: Model<IEvent> =
  (mongoose.models.Event as Model<IEvent>) ||
  mongoose.model<IEvent>("Event", eventSchema)

export default Event
