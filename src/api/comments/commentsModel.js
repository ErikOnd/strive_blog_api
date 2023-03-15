import mongoose from "mongoose";

const { Schema, model } = mongoose;

const commentSchema = new Schema(
  {
    creator: { type: String, required: true },
    comment: { type: String, require: true },
    likes: { type: Number, require: true },
  },

  {
    timestamps: true,
  }
);

export default model("Comment", commentSchema);
