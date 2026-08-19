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

// Cloudinary URLs look like:
//   https://res.cloudinary.com/<cloud>/image/upload/v169.../atclean/abc123.png
// The "public_id" it needs for deletion is everything after the version
// segment, without the file extension — e.g. "atclean/abc123".
export function extractPublicId(url) {
  const match = url.match(/\/upload\/(?:v\d+\/)?(.+)\.\w+$/)
  return match ? match[1] : null
}

// Best-effort — a failed Cloudinary cleanup should never block the
// actual delete/update the caller is doing (the DB row is the source
// of truth; a leftover Cloudinary asset just wastes storage, it's not
// a broken feature). Silently no-ops for null/external URLs.
export async function deleteImageByUrl(url) {
  if (!url) return
  const publicId = extractPublicId(url)
  if (!publicId) return

  try {
    await cloudinary.uploader.destroy(publicId)
  } catch (err) {
    console.error(`Failed to delete Cloudinary image "${publicId}":`, err.message)
  }
}

export default cloudinary
