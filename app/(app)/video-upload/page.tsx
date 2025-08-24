"use client";

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { UploadCloud, Video, FileCheck2, AlertCircle, Loader2 } from 'lucide-react';

export default function VideoUploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const MAX_FILE_SIZE = 60 * 1024 * 1024; 

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setError(null);
      setSuccess(null);
      if (selectedFile.size > MAX_FILE_SIZE) {
        setError("File is too large. Please select a file smaller than 60MB.");
        setFile(null);
      } else {
        setFile(selectedFile);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a video file to upload.");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setError("File is too large. Please select a file smaller than 60MB.");
      return;
    }

    setIsUploading(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", title);
    formData.append("description", description);
    formData.append("originalSize", file.size.toString());

    try {
      const response = await axios.post("/api/video-upload", formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status >= 200 && response.status < 300) {
        setSuccess("Video uploaded successfully! Redirecting...");
        setTimeout(() => {
          router.push('/home'); 
        }, 2000);
      } else {
        throw new Error(`Server responded with status: ${response.status}`);
      }
    } catch (err) {
      // FIX: Typed the error object safely
      const errorMessage = (err as any).response?.data?.error || "An unknown error occurred during upload.";
      setError(errorMessage);
      console.error("Upload error:", err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-2xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 tracking-tight">
            Upload Your Video
          </h1>
          <p className="text-lg text-gray-600 mt-2">
            {/* FIX: Escaped the apostrophe in "We'll" */}
            Share your content with the world. We&apos;ll handle the optimizations.
          </p>
        </header>

        <div className="bg-white p-6 sm:p-8 rounded-xl shadow-md">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Video File (Max 60MB)
              </label>
              <div 
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-indigo-500 hover:bg-indigo-50 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept="video/mp4,video/webm,video/quicktime"
                />
                {file ? (
                  <div className="text-green-600 flex flex-col items-center">
                    <FileCheck2 className="w-10 h-10 mb-2" />
                    <span className="font-semibold">{file.name}</span>
                    <span className="text-xs text-gray-500">
                      ({(file.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                  </div>
                ) : (
                  <div className="text-gray-500">
                    <UploadCloud className="mx-auto h-10 w-10 mb-2" />
                    <span className="font-semibold">Click to browse</span> or drag and drop
                  </div>
                )}
              </div>
            </div>
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Title
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="e.g., My Awesome Vacation"
                required
              />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="A short description of your video..."
              />
            </div>
            {error && (
              <div role="alert" className="alert alert-error">
                <AlertCircle className="w-6 h-6" />
                <span>{error}</span>
              </div>
            )}
            {success && (
              <div role="alert" className="alert alert-success">
                <FileCheck2 className="w-6 h-6" />
                <span>{success}</span>
              </div>
            )}
            <div>
              <button 
                type="submit"
                className="w-full btn btn-primary btn-lg"
                disabled={isUploading || !file}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Video className="mr-2 h-5 w-5" />
                    Upload Video
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
