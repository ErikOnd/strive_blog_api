import Express from "express";
import { sendsRegistrationEmail } from "../../lib/email-tools.js";
import AuthorsModel from "./authorsModel.js";
import { basicAuthMiddleware } from "../../lib/auth/basic.js";
import { adminOnlyMiddleware } from "../../lib/auth/admin.js";

const authorsRouter = Express.Router();

authorsRouter.post("/", async (req, res, next) => {
  try {
    const newAuthor = await AuthorsModel(req.body);
    const authorList = await AuthorsModel.find();

    const found = authorList.find((author) => author.email === req.body.email);
    if (found === undefined) {
      const _id = await newAuthor.save();
      res.status(201).send({ id: _id });
    } else {
      res.status(400).send("User with that email already exists");
    }
  } catch (error) {
    next(error);
  }
});

authorsRouter.get(
  "/",
  basicAuthMiddleware,
  adminOnlyMiddleware,
  async (req, res, next) => {
    try {
      const authorsArray = await AuthorsModel.find();
      res.send(authorsArray);
    } catch (error) {
      next(error);
    }
  }
);

authorsRouter.get("/me", basicAuthMiddleware, async (req, res, next) => {
  try {
    res.send(req.author);
  } catch (error) {
    next(error);
  }
});

authorsRouter.put("/me", basicAuthMiddleware, async (req, res, next) => {
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

authorsRouter.delete("/me", basicAuthMiddleware, async (req, res, next) => {
  try {
    await AuthorsModel.findOneAndDelete(req.author._id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

authorsRouter.get("/:id", basicAuthMiddleware, async (req, res, next) => {
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
  basicAuthMiddleware,
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
  basicAuthMiddleware,
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

authorsRouter.post("/sendMail", basicAuthMiddleware, async (req, res, next) => {
  try {
    console.log("sendMail");
    const email = req.body.email;
    await sendsRegistrationEmail(email);
    res.send();
  } catch (error) {
    next(error);
  }
});

export default authorsRouter;
