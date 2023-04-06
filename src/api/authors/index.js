import Express from "express";
import { sendsRegistrationEmail } from "../../lib/email-tools.js";
import AuthorsModel from "./authorsModel.js";
import { JWTAuthMiddleware } from "../../lib/auth/jwt.js";
import { adminOnlyMiddleware } from "../../lib/auth/admin.js";
import { createAccessToken } from "../../lib/auth/tools.js";
import createHttpError from "http-errors";

const authorsRouter = Express.Router();

authorsRouter.post("/", async (req, res, next) => {
  try {
    const newAuthor = await AuthorsModel(req.body);
    const authorList = await AuthorsModel.find();

    const found = authorList.find((author) => author.email === req.body.email);
    if (found === undefined) {
      const _id = await newAuthor.save();
      res.status(201).send({ id: _id }, " successfully logged in");
    } else {
      res.status(400).send("User with that email already exists");
    }
  } catch (error) {
    next(error);
  }
});

authorsRouter.get(
  "/",
  JWTAuthMiddleware,
  adminOnlyMiddleware,
  async (req, res, next) => {
    try {
      const authorsArray = await AuthorsModel.find({});
      res.send(authorsArray);
    } catch (error) {
      next(error);
    }
  }
);

authorsRouter.get("/me", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const author = await AuthorsModel.findById(req.user._id);
    res.send(author);
  } catch (error) {
    next(error);
  }
});

authorsRouter.put("/me", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const updatedAuthor = await AuthorsModel.findByIdAndUpdate(
      req.author._id,
      req.body,
      { new: true, runValidators: true }
    );
    res.send(updatedAuthor);
  } catch (error) {
    next(error);
  }
});

authorsRouter.delete("/me", JWTAuthMiddleware, async (req, res, next) => {
  try {
    await AuthorsModel.findOneAndDelete(req.author._id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

authorsRouter.get("/:id", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const author = await AuthorsModel.findById(req.params.id).populate({
      path: "blogPosts",
      select: "title",
    });
    res.send(author);
  } catch (error) {
    next(error);
  }
});

authorsRouter.put(
  "/:id",
  JWTAuthMiddleware,
  adminOnlyMiddleware,
  async (req, res, next) => {
    try {
      const updatedAuthor = await AuthorsModel.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      );

      res.send(updatedAuthor);
    } catch (error) {
      next(error);
    }
  }
);

authorsRouter.delete(
  "/:id",
  JWTAuthMiddleware,
  adminOnlyMiddleware,
  async (req, res, next) => {
    try {
      await AuthorsModel.findByIdAndDelete(req.params.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
);

authorsRouter.post("/sendMail", JWTAuthMiddleware, async (req, res, next) => {
  try {
    console.log("sendMail");
    const email = req.body.email;
    await sendsRegistrationEmail(email);
    res.send();
  } catch (error) {
    next(error);
  }
});

authorsRouter.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    console.log("email:", email, "password:", password);
    const author = await AuthorsModel.checkCredentials(email, password);
    if (author) {
      const payload = { _id: author._id, role: author.role };
      const accessToken = await createAccessToken(payload);
      res.send({ accessToken });
    } else {
      next(createHttpError(401, "Credentials are not ok!"));
    }
  } catch (error) {
    next(error);
  }
});

export default authorsRouter;
