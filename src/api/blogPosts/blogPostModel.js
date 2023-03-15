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

const blogPostSchema = new Schema(
  {
    category: { type: String, required: true },
    title: { type: String, required: true },
    cover: { type: String, required: false },
    readTime: {
      value: { type: Number },
      unit: { type: String },
    },
    author: {
      name: { type: String },
      avatar: { type: String },
    },
    content: { type: String, required: true },
    comments: [commentSchema],
  },

  {
    timestamps: true,
  }
);

export default model("BlogPost", blogPostSchema);
