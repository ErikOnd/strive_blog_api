import fs from "fs-extra";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const { readJSON, writeJSON, writeFile } = fs;

const dataFolderPath = join(dirname(fileURLToPath(import.meta.url)), "../data");
const blogPostsJSONPath = join(dataFolderPath, "blogPosts.json");
const authorsJSONPath = join(dataFolderPath, "authors.json");
const blogPostsPublicFolderPath = join(process.cwd(), "./public/img/blogPosts");
const authorsPublicFolderPath = join(process.cwd(), "./public/img/authors");

export const getBlogPosts = () => readJSON(blogPostsJSONPath);
export const writeBlogPosts = (blogPostsArray) =>
  writeJSON(blogPostsJSONPath, blogPostsArray);

export const getAuthors = () => readJSON(authorsJSONPath);
export const writeAuthors = (authorsArray) =>
  writeJSON(authorsJSONPath, authorsArray);

export const saveBlogPostsCover = (fileName, fileContentBuffer) =>
  writeFile(join(blogPostsPublicFolderPath, fileName), fileContentBuffer);
export const saveAuthorsAvatars = (fileName, fileContentBuffer) =>
  writeFile(join(authorsPublicFolderPath, fileName), fileContentBuffer);
