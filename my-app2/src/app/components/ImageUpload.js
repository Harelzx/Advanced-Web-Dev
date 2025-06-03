"use client";
import { useState } from "react";
import { uploadImage } from "@/app/utils/imageUpload";
import { FaCloudUploadAlt, FaImage, FaTrash } from "react-icons/fa";

export default function ImageUpload({
  onImageUploaded,
  existingImage = null,
  path = "images",
}) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(existingImage?.url || null);
  const [imageData, setImageData] = useState(existingImage || null);
  const [error, setError] = useState(null);

  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image size should be less than 5MB");
      return;
    }

    setError(null);
    setUploading(true);

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);

    try {
      const uploadedImage = await uploadImage(file, path);
      setImageData(uploadedImage);

      if (onImageUploaded) {
        onImageUploaded(uploadedImage);
      }
    } catch (error) {
      setError("Failed to upload image. Please try again.");
      setPreview(null);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    setImageData(null);
    if (onImageUploaded) {
      onImageUploaded(null);
    }
  };

  return (
    <div className="w-full">
      {!preview ? (
        <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <FaCloudUploadAlt className="w-10 h-10 mb-3 text-gray-400" />
            <p className="mb-2 text-sm text-gray-500">
              <span className="font-semibold">Click to upload</span> or drag and
              drop
            </p>
            <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
          </div>
          <input
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleFileSelect}
            disabled={uploading}
          />
        </label>
      ) : (
        <div className="relative w-full">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-64 object-cover rounded-lg"
          />
          <button
            onClick={handleRemove}
            className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition"
            disabled={uploading}
          >
            <FaTrash />
          </button>
          {uploading && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
              <div className="text-white">Uploading...</div>
            </div>
          )}
        </div>
      )}

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
