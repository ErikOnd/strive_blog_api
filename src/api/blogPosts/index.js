import Express from "express";
import createHttpError from "http-errors";
import { checkBlogPostSchema, triggerBadRequest } from "./validation.js";
import BlogPostModel from "./blogPostModel.js";

const blogPostsRouter = Express.Router();

blogPostsRouter.post(
  "/",
  checkBlogPostSchema,
  triggerBadRequest,
  async (request, response, next) => {
    try {
      const newBlogPost = new BlogPostModel(request.body);

      const { _id } = await newBlogPost.save();

      response.status(201).send({ _id });
    } catch (error) {
      next(error);
    }
  }
);

blogPostsRouter.get("/", async (request, response, next) => {
  try {
    const blogPosts = await BlogPostModel.find();
    response.send(blogPosts);
  } catch (error) {
    next(error);
  }
});

blogPostsRouter.get("/:id", async (request, response, next) => {
  try {
    const blogPost = await BlogPostModel.findById(request.params.id);
    if (blogPost) {
      response.send(blogPost);
    } else {
      next(
        createHttpError(
          404,
          `Blog post with id ${request.params.id} not found!`
        )
      );
    }
  } catch (error) {
    next(error);
  }
});

blogPostsRouter.put("/:id", async (request, response, next) => {
  try {
    const updatedBlogPost = await BlogPostModel.findByIdAndUpdate(
      request.params.id,
      request.body,
      { new: true, runValidators: true }
    );
    console.log("updatedBlogPost", updatedBlogPost);

    if (updatedBlogPost) {
      response.send(updatedBlogPost);
    } else {
      next(
        createHttpError(
          404,
          `Blog post with id ${request.params.id} not found!`
        )
      );
    }
  } catch (error) {
    next(error);
  }
});

blogPostsRouter.delete("/:id", async (request, response, next) => {
  try {
    const deletedBlogPost = await BlogPostModel.findByIdAndDelete(
      request.params.id
    );

    if (deletedBlogPost) {
      response.status(204).send();
    } else {
      next(
        createHttpError(
          404,
          `Blog post with id ${request.params.id} not found!`
        )
      );
    }
  } catch (error) {
    next(error);
  }
});

export default blogPostsRouter;
