import Express from "express";
import uniqid from "uniqid";
import createHttpError from "http-errors";
import { checkBlogPostSchema, triggerBadRequest } from "./validation.js";
import { getBlogPosts, writeBlogPosts } from "../../lib/fs-tools.js";

const blogPostsRouter = Express.Router();

blogPostsRouter.post(
  "/",
  checkBlogPostSchema,
  triggerBadRequest,
  async (request, response) => {
    try {
      const newBlogPost = {
        ...request.body,
        createdAt: new Date(),
        updatedAt: new Date(),
        id: uniqid(),
      };
      const blogPostsArray = await getBlogPosts();
      blogPostsArray.push(newBlogPost);
      await writeBlogPosts(blogPostsArray);

      response.status(201).send({ id: newBlogPost.id });
    } catch (error) {
      next(error);
    }
  }
);

blogPostsRouter.get("/", async (request, response) => {
  try {
    const blogPosts = await getBlogPosts();
    response.send(blogPosts);
  } catch (error) {
    next(error);
  }
});

blogPostsRouter.get("/:id", async (request, response, next) => {
  try {
    const blogPostsArray = await getBlogPosts();
    const blogPost = blogPostsArray.find(
      (blogPost) => blogPost.id === request.params.id
    );
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
    const blogPostsArray = await getBlogPosts();
    const index = blogPostsArray.findIndex(
      (blogPost) => blogPost.id === request.params.id
    );
    if (index !== -1) {
      const oldBlogPost = blogPostsArray[index];
      const updatedUser = {
        ...oldBlogPost,
        ...request.body,
        updatedAt: new Date(),
      };
      blogPostsArray[index] = updatedUser;
      await writeBlogPosts(blogPostsArray);
      response.send(updatedUser);
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
    const blogPostsArray = await getBlogPosts();
    const remainingblogPosts = blogPostsArray.filter(
      (blogPost) => blogPost.id !== request.params.id
    );

    if (remainingblogPosts.length !== blogPostsArray.length) {
      writeBlogPosts(remainingblogPosts);
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
