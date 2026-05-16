import mongoose, { Model, Schema, Types } from "mongoose"
import { Event } from "./event.model"

export interface IBooking {
  eventId: Types.ObjectId
  email: string
  createdAt: Date
  updatedAt: Date
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const bookingSchema = new Schema<IBooking>(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: [true, "eventId is required."],
    },
    email: {
      type: String,
      required: [true, "Email is required."],
      trim: true,
      lowercase: true,
      validate: {
        validator: (value: string): boolean => emailPattern.test(value),
        message: "Invalid email format.",
      },
    },
  },
  {
    timestamps: true,
  },
)

bookingSchema.index({ eventId: 1 })

bookingSchema.pre("save", async function (next) {
  try {
    // Confirm the referenced event exists before persisting a booking.
    if (this.isModified("eventId")) {
      const eventExists = await Event.exists({ _id: this.eventId })
      if (!eventExists) {
        throw new Error("Referenced event does not exist.")
      }
    }

    next()
  } catch (error) {
    next(error as Error)
  }
})

export const Booking: Model<IBooking> =
  (mongoose.models.Booking as Model<IBooking>) ||
  mongoose.model<IBooking>("Booking", bookingSchema)

export default Booking
