"use client";

import React, { useState, useEffect, useRef } from 'react';
import { UploadCloud, Download, Image as ImageIcon, CheckCircle2, AlertCircle } from 'lucide-react';

const socialFormats = {
  "Instagram Square (1:1)": { width: 1080, height: 1080 },
  "Instagram Portrait (4:5)": { width: 1080, height: 1350 },
  "Twitter Post (16:9)": { width: 1200, height: 675 },
  "Twitter Header (3:1)": { width: 1500, height: 500 },
  "Facebook Cover (205:78)": { width: 820, height: 312 }
};

type SocialFormat = keyof typeof socialFormats;

export default function SocialSharePage() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<SocialFormat>("Instagram Square (1:1)");
  const [isUploading, setIsUploading] = useState(false);
  const [isTransforming, setIsTransforming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transformedUrl, setTransformedUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const CLOUDINARY_CLOUD_NAME = "djcwh56jw";

  useEffect(() => {
    if (uploadedImage) {
      setIsTransforming(true);
      setError(null);
      const format = socialFormats[selectedFormat];
      const transformations = `c_fill,g_auto,w_${format.width},h_${format.height},q_auto`;
      const url = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/${transformations}/${uploadedImage}`;
      setTransformedUrl(url);
    }
  }, [selectedFormat, uploadedImage]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/image-upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload image. Please try again.");
      }

      const data = await response.json();
      setUploadedImage(data.publicId);
    } catch (err) {
      // FIX: Typed the error object safely
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred.");
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownload = () => {
    if (!imageRef.current?.src) {
        setError("Could not find the image source to download.");
        return;
    }
    
    fetch(imageRef.current.src)
      .then((response) => response.blob())
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${selectedFormat.replace(/[^a-zA-Z0-9]/g, "_").toLowerCase()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      })
      .catch(() => setError("Failed to download the image."));
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-5xl">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 tracking-tight">
            AI Social Media Resizer
          </h1>
          <p className="text-lg text-gray-600 mt-2">
            Upload an image and instantly get content-aware crops for all your social platforms.
          </p>
        </header>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <div className="bg-white p-6 rounded-xl shadow-md space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-700 mb-3 flex items-center">
                <UploadCloud className="w-6 h-6 mr-2 text-indigo-600" />
                1. Upload Your Image
              </h2>
              <div 
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-indigo-500 hover:bg-indigo-50 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-sm text-gray-600">
                  Click to browse or drag and drop
                </p>
                <p className="text-xs text-gray-500">PNG, JPG, WEBP up to 10MB</p>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                className="hidden"
                accept="image/png, image/jpeg, image/webp"
              />
              {isUploading && (
                <div className="mt-4">
                  <progress className="progress w-full"></progress>
                  <p className="text-sm text-center text-gray-500 mt-1">Uploading...</p>
                </div>
              )}
            </div>
            {uploadedImage && (
              <div>
                <h2 className="text-xl font-semibold text-gray-700 mb-3 flex items-center">
                  <CheckCircle2 className="w-6 h-6 mr-2 text-green-600" />
                  2. Choose a Format
                </h2>
                <select
                  className="select select-bordered w-full"
                  value={selectedFormat}
                  onChange={(e) => setSelectedFormat(e.target.value as SocialFormat)}
                  disabled={isTransforming || isUploading}
                >
                  {Object.keys(socialFormats).map((format) => (
                    <option key={format} value={format}>
                      {format}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md min-h-[400px] flex flex-col justify-center items-center">
            {!uploadedImage ? (
              <div className="text-center text-gray-500">
                <ImageIcon size={48} className="mx-auto mb-4" />
                <h3 className="text-lg font-semibold">Image Preview</h3>
                <p>Your transformed image will appear here.</p>
              </div>
            ) : (
              <>
                <div className="w-full relative flex justify-center items-center bg-gray-100 rounded-lg p-4 min-h-[300px]">
                  {isTransforming && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10 rounded-lg">
                      <span className="loading loading-spinner loading-lg text-indigo-600"></span>
                    </div>
                  )}
                  {transformedUrl && (
                    <img
                      key={transformedUrl} 
                      src={transformedUrl}
                      // FIX: Added a meaningful alt prop
                      alt={`Preview for ${selectedFormat}`}
                      ref={imageRef}
                      onLoad={() => setIsTransforming(false)}
                      onError={() => {
                          setIsTransforming(false);
                          setError("Could not load the transformed image. The format might be too extreme for the original aspect ratio.");
                      }}
                      className={`transition-opacity duration-300 ${isTransforming ? 'opacity-0' : 'opacity-100'} max-w-full max-h-[400px] object-contain rounded-md shadow-inner`}
                    />
                  )}
                </div>
                <button 
                  className="btn btn-primary w-full mt-6" 
                  onClick={handleDownload}
                  disabled={isTransforming || isUploading || !transformedUrl}
                >
                  <Download className="w-5 h-5 mr-2" />
                  Download for {selectedFormat}
                </button>
              </>
            )}
          </div>
        </div>
        {error && (
            <div role="alert" className="alert alert-error mt-8 shadow-lg">
                <AlertCircle className="w-6 h-6" />
                <div>
                    <h3 className="font-bold">An Error Occurred</h3>
                    <div className="text-xs">{error}</div>
                </div>
            </div>
        )}
      </div>
    </div>
  );
}
