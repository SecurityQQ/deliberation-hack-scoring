import { NextApiRequest, NextApiResponse } from 'next';
import formidable, { Fields, Files } from 'formidable';
import { Writable } from 'stream';
import cloudinary from 'cloudinary';

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const config = {
  api: {
    bodyParser: false, // Disallow body parsing, we want formidable to take care of that
  },
  maxDuration: 30,  // Vercel config for 30sec timeout
};

const formidableConfig = {
  keepExtensions: true,
  maxFileSize: 10_000_000, // 10 MB
  maxFieldsSize: 10_000_000,
  maxFields: 7,
  allowEmptyFiles: false,
  multiples: false,
};

const fileConsumer = (acc: Buffer[]): Writable => {
  const writable = new Writable({
    write: (chunk, _enc, next) => {
      acc.push(chunk);
      next();
    },
  });
  return writable;
};

const formidablePromise = (req: NextApiRequest, opts: formidable.Options): Promise<{ fields: Fields; files: Files }> => {
  return new Promise((resolve, reject) => {
    const form = formidable(opts);
    form.parse(req, (err, fields, files) => {
      if (err) {
        return reject(err);
      }
      resolve({ fields, files });
    });
  });
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const chunks: Buffer[] = [];
    const { fields, files } = await formidablePromise(req, {
      ...formidableConfig,
      fileWriteStreamHandler: () => fileConsumer(chunks),
    });

    if (!files.file) {
      return res.status(500).json({ error: 'Internal Server Error: Bad File' });
    }

    const fileBuffer = Buffer.concat(chunks);
    const fileName = files.file[0].originalFilename || "";

    const uploadedFile = await uploadFileToCloudinary(fileBuffer, fileName);

    res.status(200).json({ 
      message: 'File uploaded successfully', 
      url: uploadedFile.secure_url,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

async function uploadFileToCloudinary(fileBuffer: Buffer, fileName: string): Promise<cloudinary.UploadApiResponse> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.v2.uploader.upload_stream({ resource_type: 'auto' }, (error, result) => {
      if (error) {
        reject(error);
      } else if (result) {
        resolve(result);
      } else {
        reject(new Error("Upload result is undefined"));
      }
    });

    const readableBufferStream = new Writable({
      write(chunk, _enc, next) {
        uploadStream.write(chunk);
        next();
      },
      final(cb) {
        uploadStream.end();
        cb();
      },
    });

    readableBufferStream.end(fileBuffer);
  });
}

export default handler;
