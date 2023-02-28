import Express from "express";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import uniqid from "uniqid";

const authorsRouter = Express.Router();

const authorsJSONPATH = join(
  dirname(fileURLToPath(import.meta.url)),
  "authors.json"
);

authorsRouter.post("/", (request, response) => {
  const newAuthor = {
    ...request.body,
    createdAt: new Date(),
    updatedAt: new Date(),
    id: uniqid(),
  };
  const authorsArray = JSON.parse(fs.readFileSync(authorsJSONPATH));
  const found = authorsArray.find(
    (author) => author.email === request.body.email
  );
  if (found === undefined) {
    authorsArray.push(newAuthor);
    fs.writeFileSync(authorsJSONPATH, JSON.stringify(authorsArray));
    response.status(201).send({ id: newAuthor.id });
  } else {
    response.status(400).send("User with that email already exists");
  }
});

authorsRouter.get("/", (request, response) => {
  const fileContentAsBuffer = fs.readFileSync(authorsJSONPATH);
  const authorsArray = JSON.parse(fileContentAsBuffer);
  response.send(authorsArray);
});

authorsRouter.get("/:id", (request, response) => {
  const authorsArray = JSON.parse(fs.readFileSync(authorsJSONPATH));
  const author = authorsArray.find((author) => author.id === request.params.id);
  response.send(author);
});

authorsRouter.put("/:id", (request, response) => {
  const authorsArray = JSON.parse(fs.readFileSync(authorsJSONPATH));
  const index = authorsArray.findIndex(
    (author) => author.id === request.params.id
  );
  const oldAuthor = authorsArray[index];
  const updatedUser = { ...oldAuthor, ...request.body, updatedAt: new Date() };
  authorsArray[index] = updatedUser;
  fs.writeFileSync(authorsJSONPATH, JSON.stringify(authorsArray));
  response.send(updatedUser);
});

authorsRouter.delete("/:id", (request, response) => {
  const authorsArray = JSON.parse(fs.readFileSync(authorsJSONPATH));
  const remainingAuthors = authorsArray.filter(
    (author) => author.id !== request.params.id
  );
  fs.writeFileSync(authorsJSONPATH, JSON.stringify(remainingAuthors));
  response.status(204).send();
});

export default authorsRouter;
