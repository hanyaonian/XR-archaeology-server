import { Application } from "@feathersjs/feathers";
import { AttachmentOpts, AttachmentStorage, InfoType } from "../attachments";
import { GridFsStorage } from "multer-gridfs-storage";
import configs from "@configs";
import { Db, GridFSBucket, ObjectId } from "mongodb";
import sharp from "sharp";

export default (opts: AttachmentOpts, app: Application): AttachmentStorage => {
  const storage = new GridFsStorage({ url: configs.mongodb });

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
                filesToRemove.push(item.src.substr(9));
              }
              if (item.sizes) {
                for (let size of item.sizes) {
                  if (size.src.startsWith("gridfs://")) {
                    filesToRemove.push(size.src.substr(9));
                  }
                }
              }
              if (filesToRemove.length > 0) {
                const db: Db = storage.db;
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
    async getInfo(info) {
      const db: Db = storage.db;
      const bucket = new GridFSBucket(db, {
        bucketName: "fs",
      });
      if (info.id) info.src = "gridfs://" + info.id;
      if (info.type === "image") {
        try {
          const image = sharp();
          const stream = bucket.openDownloadStream(info.id);
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
          // TODO opts.mipmaps
        } catch (e) {
          if (opts.thumbRequired) throw new Error("Image is invalid");
          console.log(e);
        }
      }
    },
    // async handleImage(req, res, img, { acceptWebp, size }) {
    //   if (!img.src.startsWith("gridfs://")) return false;
    // },
    async upload(path, data, mime) {
      const db: Db = storage.db;
      const bucket = new GridFSBucket(db, {
        bucketName: "fs",
      });
      const s = bucket.openUploadStream(path, {
        contentType: mime,
      });
      await new Promise((resolve, reject) => {
        s.once("error", reject);
        s.once("finish", resolve);
        s.write(data);
        s.end();
      });
      return { id: s.id };
    },
  };

  return result;
};
