import { checkSchema, validationResult } from "express-validator";
import createHttpError from "http-errors";

const commentSchema = {
  creator: {
    in: ["body"],
    isString: {
      errorMessage: "Creator is a mandatory field and needs to be a string!",
    },
  },

  comment: {
    in: ["body"],
    isString: {
      errorMessage: "Comment is a mandatory field and needs to be a string!",
    },
  },

  likes: {
    in: ["body"],
    isNumeric: {
      errorMessage: "Likes is a mandatory field and needs to be a Number",
    },
  },
};

export const checkCommentSchema = checkSchema(commentSchema);

export const triggerBadRequest = (req, res, next) => {
  const errors = validationResult(req);

  console.log(errors.array());

  if (errors.isEmpty()) {
    next();
  } else {
    next(
      createHttpError(400, "Errors during comment validation", {
        errorsList: errors.array(),
      })
    );
  }
};
