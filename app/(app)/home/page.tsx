"use client";

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { Video } from '@prisma/client';
import VideoCard from '@/components/VideoCard';
import { Upload, Video as VideoIcon, Loader2, Sparkles, Play, Image } from 'lucide-react';

export default function HomePage() {
  // --- State Management ---
  console.log("Cloud Name on HomePage:", process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME);
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- Data Fetching ---
  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get('/api/videos');
        setVideos(response.data);
      } catch (err) {
        console.error("Failed to fetch videos:", err);
        setError("Could not load videos. Please try refreshing the page.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchVideos();
  }, []);

  // --- Event Handlers ---
  /**
   * Triggers a browser download for a given URL.
   * @param url - The direct URL of the file to download.
   * @param title - The desired filename for the downloaded file.
   */
  const handleDownload = (url: string, title: string) => {
    const link = document.createElement("a");
    link.href = url;
    const fileName = `${title.replace(/[^a-zA-Z0-9]/g, "_")}.mp4`;
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- Render Logic ---
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col justify-center items-center h-96">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 blur-lg opacity-30 animate-pulse"></div>
            <Loader2 className="relative w-16 h-16 animate-spin text-white" />
          </div>
          <p className="mt-4 text-gray-400 animate-pulse">Loading your video library...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-16 px-6 bg-gradient-to-br from-red-50 to-pink-50 rounded-2xl border border-red-100">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <VideoIcon className="w-8 h-8 text-red-500" />
          </div>
          <p className="text-red-600 font-medium">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      );
    }

    if (videos.length === 0) {
      return (
        <div className="text-center py-20 px-8">
          <div className="relative mx-auto w-32 h-32 mb-8">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 rounded-full blur-2xl opacity-20 animate-pulse"></div>
            <div className="relative w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 rounded-full flex items-center justify-center border-4 border-gray-700">
              <VideoIcon className="w-12 h-12 text-gray-400" />
            </div>
          </div>
          
          <h3 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-4">
            Your Video Journey Starts Here
          </h3>
          <p className="text-gray-400 text-lg mb-8 max-w-md mx-auto leading-relaxed">
            Transform your videos with AI-powered optimization and create something amazing.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/video-upload">
              <button className="group relative px-8 py-4 bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 text-white font-semibold rounded-xl shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 hover:scale-105 active:scale-95">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 rounded-xl blur opacity-75 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative flex items-center">
                  <Upload className="w-5 h-5 mr-3 group-hover:animate-bounce" />
                  Upload Video
                  <Sparkles className="w-4 h-4 ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </button>
            </Link>
            
            <Link href="/image-upload">
              <button className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 text-white font-semibold rounded-xl shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 hover:scale-105 active:scale-95">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 rounded-xl blur opacity-75 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative flex items-center">
                  <Image className="w-5 h-5 mr-3 group-hover:animate-pulse" />
                  Upload Image
                  <Sparkles className="w-4 h-4 ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </button>
            </Link>
          </div>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {videos.map((video, index) => (
          <div 
            key={video.id}
            className="animate-fade-in-up"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <VideoCard 
              video={video} 
              onDownload={handleDownload} 
            />
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-1/2 w-80 h-80 bg-red-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative container mx-auto p-6 lg:p-12">
        {/* Header Section */}
        <header className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-full text-purple-300 text-sm font-medium mb-6 backdrop-blur-sm">
            <Play className="w-4 h-4 mr-2" />
            Video Library Dashboard
          </div>
          
          <h1 className="text-6xl lg:text-7xl font-bold bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent mb-6 tracking-tight">
            Pixel
            <span className="block bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent">
              Perfect
            </span>
          </h1>
          
          <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Discover, manage, and download all your AI-optimized videos in one beautiful space.
          </p>
          
          {/* Stats Bar */}
          {videos.length > 0 && (
            <div className="flex justify-center mt-8">
              <div className="flex items-center space-x-8 px-8 py-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{videos.length}</div>
                  <div className="text-sm text-gray-400">Videos</div>
                </div>
                <div className="w-px h-8 bg-gray-600"></div>
                <div className="text-center">
                  <div className="text-2xl font-bold bg-gradient-to-r from-green-400 to-green-500 bg-clip-text text-transparent">
                    ∞
                  </div>
                  <div className="text-sm text-gray-400">Possibilities</div>
                </div>
              </div>
            </div>
          )}
        </header>

        {/* Main Content */}
        <main className="relative">
          {renderContent()}
        </main>

        {/* Upload Buttons for existing videos */}
        {videos.length > 0 && (
          <div className="fixed bottom-8 right-8 z-50 flex flex-col gap-4">
            <Link href="/video-upload">
              <button className="group w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 hover:scale-110 active:scale-95">
                <Upload className="w-6 h-6 mx-auto group-hover:animate-bounce" />
              </button>
            </Link>
            
            <Link href="/social-share">
              <button className="group w-16 h-16 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-full shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 hover:scale-110 active:scale-95">
                <Image className="w-6 h-6 mx-auto group-hover:animate-pulse" />
              </button>
            </Link>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
        }
        
        .animate-blob {
          animation: blob 7s infinite;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}