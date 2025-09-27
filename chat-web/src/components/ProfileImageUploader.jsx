import React, { useState } from 'react';
import { uploadToCloudinary } from '../utils/uploadToCloudinary';

const ProfileImageUploader = ({ onImageUploaded }) => {
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = async (e) => {
    setError('');
    const file = e.target.files[0];
    if (!file) return;

    // Show preview
    const localPreview = URL.createObjectURL(file);
    setPreview(localPreview);
    setLoading(true);
    // Upload to Cloudinary
    const url = await uploadToCloudinary(file);
    setLoading(false);
    if (url) {
      onImageUploaded(url); // Send image URL back to parent or save in DB
    } else {
      setError('Failed to upload image. Check Cloudinary preset and network.');
    }
  };

  return (
    <div>
      <input type="file" accept="image/*" onChange={handleFileChange} />
      {loading && <p>Uploading DP...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {preview && (
        <div className="mt-2">
          <img
            src={preview}
            alt="Preview"
            style={{
              width: 60,
              height: 60,
              borderRadius: '50%',
              objectFit: 'cover',
              border: '2px solid #fff',
              marginBottom: 12,
            }}
          />
        </div>
      )}
    </div>
  );
};

export default ProfileImageUploader;
