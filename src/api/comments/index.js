import Express from "express";
import uniqid from "uniqid";
import createHttpError from "http-errors";
import { checkCommentSchema, triggerBadRequest } from "./validation.js";
import { getComments, writeComments } from "../../lib/fs-tools.js";

const commentsRouter = Express.Router();

commentsRouter.post(
  "/:blogPostId",
  checkCommentSchema,
  triggerBadRequest,
  async (request, response, next) => {
    try {
      const newComment = {
        ...request.body,
        blogPostId: request.params.blogPostId,
        createdAt: new Date(),
        updatedAt: new Date(),
        id: uniqid(),
      };
      const commentsArray = await getComments();
      commentsArray.push(newComment);
      await writeComments(commentsArray);

      response.status(201).send({ id: newComment.id });
    } catch (error) {
      next(error);
    }
  }
);

commentsRouter.get(
  "/blogComments/:blogPostId",
  async (request, response, next) => {
    try {
      const commentsArray = await getComments();
      console.log("commentsArray:", commentsArray);
      const blogComments = commentsArray.filter(
        (comment) => comment.blogPostId === request.params.blogPostId
      );
      console.log("blogComments:", blogComments);
      response.send(blogComments);
    } catch (error) {
      next(error);
    }
  }
);

commentsRouter.get("/:id", async (request, response, next) => {
  try {
    const commentsArray = await getComments();
    const comment = commentsArray.find(
      (comment) => comment.id === request.params.id
    );
    if (comment) {
      response.send(comment);
    } else {
      next(
        createHttpError(
          404,
          `Comment post with id ${request.params.id} not found!`
        )
      );
    }
  } catch (error) {
    next(error);
  }
});

commentsRouter.put("/:id", async (request, response, next) => {
  try {
    const commentsArray = await getComments();
    const index = commentsArray.findIndex(
      (comment) => comment.id === request.params.id
    );
    if (index !== -1) {
      const oldComment = commentsArray[index];
      const updatedUser = {
        ...oldComment,
        ...request.body,
        updatedAt: new Date(),
      };
      commentsArray[index] = updatedUser;
      await writeComments(commentsArray);
      response.send(updatedUser);
    } else {
      next(
        createHttpError(
          404,
          `Comment post with id ${request.params.id} not found!`
        )
      );
    }
  } catch (error) {
    next(error);
  }
});

commentsRouter.delete("/:id", async (request, response, next) => {
  try {
    const commentsArray = await getComments();
    const remainingcomments = commentsArray.filter(
      (comment) => comment.id !== request.params.id
    );

    if (remainingcomments.length !== commentsArray.length) {
      writeComments(remainingcomments);
      response.status(204).send();
    } else {
      next(
        createHttpError(
          404,
          `Comment post with id ${request.params.id} not found!`
        )
      );
    }
  } catch (error) {
    next(error);
  }
});

export default commentsRouter;
