import { checkSchema, validationResult } from "express-validator";
import createHttpError from "http-errors";

const blogPostsSchema = {
  category: {
    in: ["body"],
    isString: {
      errorMessage: "Category is a mandatory field and needs to be a string!",
    },
  },

  title: {
    in: ["body"],
    isString: {
      errorMessage: "Title is a mandatory field and needs to be a string!",
    },
  },

  cover: {
    in: ["body"],
    isString: {
      errorMessage: "Cover is a mandatory field and needs to be a string!",
    },
  },

  "readTime.value": {
    in: ["body"],
    isNumeric: {
      errorMessage: "value is a mandatory field and needs to be a Number",
    },
  },
  "readTime.unit": {
    in: ["body"],
    isString: {
      errorMessage: "unit is a mandatory field and needs to be a string!",
    },
  },

  "author.name": {
    in: ["body"],
    isString: {
      errorMessage: "Name is a mandatory field and needs to be a string!",
    },
  },
  "author.avatar": {
    in: ["body"],
    isString: {
      errorMessage: "Avatar is a mandatory field and needs to be a string!",
    },
  },

  content: {
    in: ["body"],
    isString: {
      errorMessage: "Content is a mandatory field and needs to be a string!",
    },
  },
};

export const checkBlogPostSchema = checkSchema(blogPostsSchema);

export const triggerBadRequest = (req, res, next) => {
  const errors = validationResult(req);

  console.log(errors.array());

  if (errors.isEmpty()) {
    next();
  } else {
    next(
      createHttpError(400, "Errors during blogPost validation", {
        errorsList: errors.array(),
      })
    );
  }
};
