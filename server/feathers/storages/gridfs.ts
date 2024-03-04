import { Application } from "@feathersjs/feathers";
import { AttachmentOpts, AttachmentStorage, InfoType, findSize } from "../attachments";
import { GridFSBucket, Db, ObjectId, MongoClient } from "mongodb";
import sharp from "sharp";
import { memoryStorage } from "multer";

const getByteRange = function (header) {
  if (header) {
    const matches = header.match(/(\d+)-(\d*)/);
    if (matches) {
      return {
        start: parseInt(matches[1], 10),
        stop: matches[2] ? parseInt(matches[2], 10) : null,
      };
    }
  }
  return null;
};

export default (opts: AttachmentOpts, app: Application): AttachmentStorage => {
  const storage = memoryStorage();

  setTimeout(() => {
    const attachments = app.service("attachments");
    if (attachments) {
      attachments.hooks({
        after: {
          remove(hook) {
            const item: InfoType = hook.result;
            if (item) {
              const filesToRemove: string[] = [];
              if (item.src.startsWith("gridfs://")) {
                filesToRemove.push(item.src.substring(9));
              }
              if (item.sizes) {
                for (let size of item.sizes) {
                  if (size.src.startsWith("gridfs://")) {
                    filesToRemove.push(size.src.substring(9));
                  }
                }
              }
              if (filesToRemove.length > 0) {
                const db: Db = (<MongoClient>(<any>app).mdb).db();

                const bucket = new GridFSBucket(db, {
                  bucketName: "fs",
                });

                for (let file of filesToRemove) {
                  bucket.delete(new ObjectId(file));
                }
              }
            }
          },
        },
      });
    }
  }, 500);

  const result: AttachmentStorage = {
    storage,
    async updateInfo(info) {
      const db: Db = (<MongoClient>(<any>app).mdb).db();
      try {
        const bucket = new GridFSBucket(db, {
          bucketName: "fs",
        });
        info.src = info.src ?? "gridfs://" + info.id;
        const id = info.id ? info.id : new ObjectId(info.src.substring(9));

        if (info.type === "image") {
          try {
            const image = sharp();
            const stream = bucket.openDownloadStream(id);
            stream.pipe(image);
            const metadata = await image.metadata();

            info.width = metadata.width;
            info.height = metadata.height;

            info.thumb = await image
              .clone()
              .rotate()
              .resize(200, 200, {
                fit: "inside",
              })
              .toBuffer();

            info.thumbWebp = await image
              .clone()
              .rotate()
              .resize(200, 200, {
                fit: "inside",
              })
              .toFormat("webp")
              .toBuffer();
          } catch (e) {
            if (opts.thumbRequired) throw new Error("Image is invalid");
            console.log(e);
          }
        }
      } catch (error) {
        console.log("multer gridfs error", error);
      }
    },
    async handleImage(req, res, img, { acceptWebp, size }) {
      if (!img.src?.startsWith("gridfs://")) return false;
      const range = getByteRange(req.headers.range);
      let outOfRange = false;
      if (range) {
        if (range.stop === null) range.stop = img.size;
        outOfRange = range.start >= img.size || range.stop < range.start;
        if (range.stop >= img.size - 1) {
          range.stop = img.size - 1;
        }
      }

      if (range && outOfRange) {
        res.removeHeader("Content-Length");
        res.removeHeader("Content-Type");
        res.removeHeader("Content-Disposition");
        res.removeHeader("Last-Modified");
        res.setHeader("Content-Range", `bytes */${img.size}`);
        res.writeHead(416);
        res.end();
        return;
      }

      const db: Db = (<MongoClient>(<any>app).mdb).db();

      const bucket = new GridFSBucket(db, {
        bucketName: "fs",
      });

      let target = new ObjectId(img.src.substring(9));
      let mime = img.mime;

      if (size && img.type === "image") {
        const newSize = findSize(img.sizes, size, acceptWebp);
        if (newSize && newSize.src.startsWith("gridfs://")) {
          target = new ObjectId(newSize.src.substring(9));
          if (newSize.format === "webp") {
            mime = "image/webp";
          }
        }
      }

      const oetag = req.headers["if-none-match"];

      const info = (await bucket.find({ _id: target }).toArray())[0];
      if (!info) return false;

      const etag = (<any>info).md5 || `${target}`;

      if (oetag === etag) {
        res.set("Cache-Control", "public, max-age=31557600");
        res.setHeader("Content-Type", mime);
        res.setHeader("ETag", etag);
        res.setHeader("Content-Length", info.length);
        res.status(304);
        res.send("Not Modified");
        return true;
      }

      res.set("Cache-Control", "public, max-age=31557600");
      res.setHeader("Content-Type", mime);
      res.setHeader("ETag", etag);
      res.setHeader("Content-Length", info.length);
      if (range) {
        res.setHeader("Content-Range", `bytes ${range.start}-${range.stop}/${img.size}`);
        res.removeHeader("Content-Length");
        res.setHeader("Content-Length", range.stop - range.start + 1);
        res.writeHead(206);
      }

      bucket.openDownloadStream(target, range ? { start: range.start, end: range.stop } : undefined).pipe(res);
      return true;
    },
    async upload(path, data, mime) {
      const db: Db = (<MongoClient>(<any>app).mdb).db();

      try {
        const bucket = new GridFSBucket(db, {
          bucketName: "fs",
        });

        const s = bucket.openUploadStream(path, {
          contentType: mime,
        });
        await new Promise((resolve, reject) => {
          s.once("error", reject);
          s.write(data);
          s.end(resolve);
        });

        return { id: s.id };
      } catch (error) {
        console.warn("upload error", error);
      }
    },
  };

  return result;
};
