import { uploadImageBuffer } from '../services/cloudinaryService.js'

export async function uploadImage(req, res) {
  if (!req.file) {
    return res.status(400).json({ error: 'No image file provided' })
  }

  try {
    const result = await uploadImageBuffer(req.file.buffer, 'atclean')
    res.status(201).json({ url: result.secure_url })
  } catch (err) {
    res.status(502).json({ error: 'Image upload failed' })
  }
}
