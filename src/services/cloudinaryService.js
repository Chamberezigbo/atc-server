import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

// Uploads an in-memory image buffer (from multer) to Cloudinary.
// quality/fetch_format "auto" + a width cap is Cloudinary's own
// compression — it picks the best format (e.g. WebP) per browser and
// the best quality level per image, and never upscales past 1600px wide.
export function uploadImageBuffer(buffer, folder) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        quality: 'auto:good',
        fetch_format: 'auto',
        width: 1600,
        crop: 'limit',
      },
      (error, result) => {
        if (error) return reject(error)
        resolve(result)
      },
    )
    stream.end(buffer)
  })
}

export default cloudinary
