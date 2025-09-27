import axios from 'axios';

export const uploadToCloudinary = async (file) => {
  const CLOUD_NAME = 'dwdvb6rp0'; // <-- Your actual Cloudinary cloud name
  const UPLOAD_PRESET = 'unsigned_upload'; // Must match your Cloudinary preset

  // Only declare formData once
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);
  // Remove folder param for unsigned uploads unless your preset allows it

  try {
    // Use fetch for upload
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );
    const data = await response.json();
    if (!response.ok) {
      console.error('Cloudinary error:', data);
      return null;
    }
    return data.secure_url;
  } catch (err) {
    console.error('Upload Error:', err);
    return null;
  }
};
