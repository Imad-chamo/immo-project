import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export { cloudinary };

export async function uploadToCloudinary(
  file: Buffer | string,
  folder: string,
  options?: Record<string, unknown>
): Promise<string> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `immo-verify-maroc/${folder}`,
        resource_type: "auto",
        ...options,
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result!.secure_url);
      }
    );

    if (typeof file === "string") {
      // base64 string
      cloudinary.uploader.upload(
        file,
        {
          folder: `immo-verify-maroc/${folder}`,
          resource_type: "auto",
          ...options,
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result!.secure_url);
        }
      );
    } else {
      uploadStream.end(file);
    }
  });
}

export async function deleteFromCloudinary(publicId: string) {
  return cloudinary.uploader.destroy(publicId);
}

export function getCloudinaryPublicId(url: string): string {
  const parts = url.split("/");
  const filename = parts[parts.length - 1];
  const publicId = filename.split(".")[0];
  return `immo-verify-maroc/${parts[parts.length - 2]}/${publicId}`;
}
