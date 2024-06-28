import { v2 as cloudinary } from 'cloudinary'
import fs from 'fs'

// Configuration
cloudinary.config({
  cloud_name: 'dsko2jr4h',
  api_key: '236565748499321',
  api_secret: 'OY9a_x1I_cf1iDxILuJAorM32qg',
})
const uploadOnCLoudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null
    const result = await cloudinary.uploader.upload(localFilePath, {
      public_id: 'shoes',
    })

    //file has been uploaded successfully
    console.log('file uploaded successfully', result.url)
    return result
  } catch (error) {
    console.log(error)
    fs.unlinkSync(localFilePath)
    return null
  }
}

export default uploadOnCLoudinary
