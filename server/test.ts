import path from "path";
import { requireContext } from "./utils/webpack";

async function run() {
  const schema = requireContext("./server/db", true, /\.(js|ts)$/);
  const contextList = Array.isArray(schema) ? schema : [schema];
  const schemas = contextList.flatMap((ictx) => {
    const [ctx, args] = Array.isArray(ictx) ? ictx : [ictx, null];
    return ctx.keys().map((key) => {
      const mkey = path.join(path.dirname(key), path.basename(key, path.extname(key)));
      const filename = key.replace(/(.*\/)*([^.]+(js|ts)$)./gi);
      return [filename, mkey, ctx(key), args] as const;
    });
  });
  schemas.forEach(([filename, dirName, item, args]) => {
    if (item.default) console.log(item.default, typeof item.default);
  });
}

run().catch(console.dir);
