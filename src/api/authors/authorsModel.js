import mongoose from "mongoose";
import bcrypt from "bcrypt";
const { Schema, model } = mongoose;

const AuthorSchema = new Schema(
  {
    name: { type: String, required: true },
    surname: { type: String, require: true },
    email: { type: String, require: true },
    dataOfBirth: { type: Date, require: true },
    avatar: { type: String, require: true },
    blogPosts: [{ type: Schema.Types.ObjectId, ref: "BlogPost" }],
    password: { type: String, required: true },
    role: {
      type: String,
      required: true,
      enum: ["Admin", "User"],
      default: "User",
    },
  },

  {
    timestamps: true,
  }
);

AuthorSchema.pre("save", async function () {
  const newAuthorData = this;

  if (newAuthorData.isModified("password")) {
    const plainPW = newAuthorData.password;

    const hash = await bcrypt.hash(plainPW, 5);
    newAuthorData.password = hash;
  }
});

AuthorSchema.methods.toJSON = function () {
  const currentAuthorDocument = this;
  const currentAuthor = currentAuthorDocument.toObject();
  delete currentAuthor.password;
  delete currentAuthor.createdAt;
  delete currentAuthor.updatedAt;
  delete currentAuthor.__v;
  return currentAuthor;
};

AuthorSchema.static("checkCredentials", async function (email, plainPW) {
  const author = await this.findOne({ email });

  if (author) {
    const passwordMatch = await bcrypt.compare(plainPW, author.password);
    if (passwordMatch) {
      return author;
    } else {
      return null;
    }
  } else {
    return null;
  }
});

export default model("author", AuthorSchema);
