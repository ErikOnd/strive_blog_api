import mongoose from "mongoose";

const { Schema, model } = mongoose;

const authorSchema = new Schema(
  {
    name: { type: String, required: true },
    surname: { type: String, require: true },
    email: { type: String, require: true },
    dataOfBirth: { type: Date, require: true },
    avatar: { type: String, require: true },
    blogPosts: [{ type: Schema.Types.ObjectId, ref: "BlogPost" }],
  },

  {
    timestamps: true,
  }
);

export default model("Author", authorSchema);
