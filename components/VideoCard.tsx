import React, { useState, useEffect, useCallback } from 'react';
// The helper functions from next-cloudinary have been removed to fix the error.
import { Download, Clock, FileDown, FileUp, Percent } from 'lucide-react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { filesize } from 'filesize';
import { Video } from '@prisma/client';

dayjs.extend(relativeTime);

interface VideoCardProps {
  video: Video;
  onDownload: (url: string, title: string) => void;
}

const VideoCard: React.FC<VideoCardProps> = ({ video, onDownload }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [previewError, setPreviewError] = useState(false);

  // --- FIX: Manually define your Cloud Name here ---
  // This bypasses the process.env issue entirely for this component.
  const CLOUDINARY_CLOUD_NAME = "djcwh56jw";

  // --- URL Generation Callbacks (Now Manual) ---
  const getThumbnailUrl = useCallback((publicId: string) => {
    const transformations = "c_fill,g_auto,w_400,h_225,q_auto,f_jpg";
    return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/video/upload/${transformations}/${publicId}`;
  }, [CLOUDINARY_CLOUD_NAME]);

  const getFullVideoUrl = useCallback((publicId: string) => {
    const transformations = "w_1920,h_1080,f_mp4";
    return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/video/upload/${transformations}/${publicId}`;
  }, [CLOUDINARY_CLOUD_NAME]);

  const getPreviewVideoUrl = useCallback((publicId: string) => {
    // AI Smart Preview Transformation
    const transformations = "c_fill,w_400,h_225,e_preview:duration_10:max_seg_3:min_seg_dur_3";
    return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/video/upload/${transformations}/${publicId}`;
  }, [CLOUDINARY_CLOUD_NAME]);

  // --- Formatting Callbacks ---
  const formatSize = useCallback((size: number) => {
    return filesize(size, { base: 2, standard: "jedec" });
  }, []);

  const formatDuration = useCallback((seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.round(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  }, []);

  const compressionPercentage = Math.round(
    (1 - video.compressedSize / video.originalSize) * 100
  );

  useEffect(() => {
    if (!isHovered) {
      setPreviewError(false);
    }
  }, [isHovered]);

  return (
    <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden">
      <figure
        className="aspect-video relative bg-gray-200"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {isHovered && !previewError ? (
          <video
            className="w-full h-full object-cover"
            src={getPreviewVideoUrl(video.publicId)}
            autoPlay
            muted
            loop
            onError={() => setPreviewError(true)}
          />
        ) : (
          <img
            className="w-full h-full object-cover"
            src={getThumbnailUrl(video.publicId)}
            alt={video.title}
          />
        )}
      </figure>

      <div className="card-body p-4">
        <h2 className="card-title text-lg truncate" title={video.title}>
          {video.title}
        </h2>
        <p className="text-sm text-gray-500 h-10 overflow-hidden">
          {video.description || "No description provided."}
        </p>

        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-gray-600 mt-4">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-gray-400" />
            <span>{formatDuration(video.duration || 0)}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Percent className="w-4 h-4 text-gray-400" />
            <span>{compressionPercentage}% compressed</span>
          </div>
          <div className="flex items-center space-x-2">
            <FileUp className="w-4 h-4 text-gray-400" />
            <span>{formatSize(video.originalSize)}</span>
          </div>
          <div className="flex items-center space-x-2">
            <FileDown className="w-4 h-4 text-gray-400" />
            <span>{formatSize(video.compressedSize)}</span>
          </div>
        </div>
        
        <p className="text-xs text-gray-400 mt-3">
            Uploaded {dayjs(video.createdAt).fromNow()}
        </p>

        <div className="card-actions justify-end mt-4">
          <button 
            className="btn btn-primary btn-sm"
            onClick={() => onDownload(getFullVideoUrl(video.publicId), video.title)}
          >
            <Download className="w-4 h-4 mr-1" />
            Download
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoCard;
