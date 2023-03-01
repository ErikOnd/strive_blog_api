import Express from "express";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import uniqid from "uniqid";
import createHttpError from "http-errors";
import { checkBlogPostSchema, triggerBadRequest } from "./validation.js";

const blogPostsRouter = Express.Router();

const blogPostsJSONPATH = join(
  dirname(fileURLToPath(import.meta.url)),
  "blogPosts.json"
);

const blogPostsArray = JSON.parse(fs.readFileSync(blogPostsJSONPATH));

blogPostsRouter.post(
  "/",
  checkBlogPostSchema,
  triggerBadRequest,
  (request, response) => {
    const newBlogPost = {
      ...request.body,
      createdAt: new Date(),
      updatedAt: new Date(),
      id: uniqid(),
    };
    blogPostsArray.push(newBlogPost);
    fs.writeFileSync(blogPostsJSONPATH, JSON.stringify(blogPostsArray));
    response.status(201).send({ id: newBlogPost.id });
  }
);

blogPostsRouter.get("/", (request, response) => {
  response.send(blogPostsArray);
});

blogPostsRouter.get("/:id", (request, response, next) => {
  try {
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

blogPostsRouter.put("/:id", (request, response, next) => {
  try {
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
      fs.writeFileSync(blogPostsJSONPATH, JSON.stringify(blogPostsArray));
      response.send(updatedUser);
    } else {
      next(
        createHttpError(
          404,
          `Blog post with id ${request.params.id} not found!`
        )
      ); //
    }
  } catch (error) {
    next(error);
  }
});

blogPostsRouter.delete("/:id", (request, response, next) => {
  try {
    const remainingblogPosts = blogPostsArray.filter(
      (blogPost) => blogPost.id !== request.params.id
    );

    if (remainingblogPosts.length !== blogPostsArray.length) {
      fs.writeFileSync(blogPostsJSONPATH, JSON.stringify(remainingblogPosts));
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
