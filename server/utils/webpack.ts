import fs from "fs";
import { resolve, relative } from "path";

// Solution from https://juejin.cn/post/7112056626081136676
const readDirSync = (dirPath: string) => {
  const result: string[] = [],
    dirs: string[] = [];
  const files = fs.readdirSync(dirPath);
  files.forEach((file) => {
    const stat = fs.statSync(resolve(dirPath, file));
    stat.isDirectory() ? dirs.push(file) : result.push(resolve(dirPath, file));
  });
  dirs.forEach((dir) => result.push(...readDirSync(resolve(dirPath, dir))));
  return result;
};

/**
 * Alternative for webpack's require.context.
 *
 * Please don't use ts-config path in this function as the complier
 * cannot recognize the path.
 * */
export const requireContext = (dirPath: string, deep = false, reg?: RegExp) => {
  let files = deep ? readDirSync(dirPath) : fs.readdirSync(dirPath).filter((file) => !fs.statSync(resolve(dirPath, file)).isDirectory());
  if (reg instanceof RegExp) {
    files = files.filter((file) => reg.test(file));
  }

  const context = (file: string) => require(resolve(dirPath, file));

  context.keys = () => files.map((file) => relative(dirPath, resolve(dirPath, file)));

  return context;
};
