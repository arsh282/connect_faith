// YouTube service for extracting video metadata and handling YouTube URLs

/**
 * Extract YouTube video ID from various YouTube URL formats
 * @param {string} url - YouTube URL
 * @returns {string|null} - Video ID or null if invalid
 */
export const extractYouTubeVideoId = (url) => {
  if (!url) return null;
  
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^#&?]*).*/,
    /youtube\.com\/v\/([^#&?]*).*/,
    /youtube\.com\/watch\?.*v=([^#&?]*).*/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1] && match[1].length === 11) {
      return match[1];
    }
  }
  
  return null;
};

/**
 * Generate YouTube embed URL
 * @param {string} videoId - YouTube video ID
 * @param {object} options - Embed options
 * @returns {string} - Embed URL
 */
export const getYouTubeEmbedUrl = (videoId, options = {}) => {
  if (!videoId) return null;
  
  const defaultOptions = {
    autoplay: 0,
    controls: 1,
    showinfo: 1,
    rel: 0,
    modestbranding: 1,
    ...options
  };
  
  const params = new URLSearchParams(defaultOptions);
  return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
};

/**
 * Generate YouTube thumbnail URL
 * @param {string} videoId - YouTube video ID
 * @param {string} quality - Thumbnail quality (default, medium, high, standard, maxres)
 * @returns {string} - Thumbnail URL
 */
export const getYouTubeThumbnailUrl = (videoId, quality = 'maxresdefault') => {
  if (!videoId) return null;
  
  const qualityMap = {
    default: 'default',
    medium: 'mqdefault',
    high: 'hqdefault',
    standard: 'sddefault',
    maxres: 'maxresdefault'
  };
  
  const qualityKey = qualityMap[quality] || 'maxresdefault';
  return `https://img.youtube.com/vi/${videoId}/${qualityKey}.jpg`;
};

/**
 * Validate YouTube URL format
 * @param {string} url - YouTube URL to validate
 * @returns {boolean} - True if valid YouTube URL
 */
export const isValidYouTubeUrl = (url) => {
  if (!url) return false;
  
  const youtubePatterns = [
    /^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\/.+/,
    /^https?:\/\/youtube\.com\/embed\/.+/,
    /^https?:\/\/youtube\.com\/v\/.+/
  ];
  
  return youtubePatterns.some(pattern => pattern.test(url));
};

/**
 * Get YouTube video info (mock implementation - in real app, you'd use YouTube API)
 * @param {string} videoId - YouTube video ID
 * @returns {Promise<object>} - Video information
 */
export const getYouTubeVideoInfo = async (videoId) => {
  if (!videoId) return null;
  
  // This is a mock implementation
  // In a real application, you would use the YouTube Data API v3
  // to fetch actual video metadata like title, duration, description, etc.
  
  return {
    id: videoId,
    title: 'Sermon Video',
    duration: '45:30',
    thumbnail: getYouTubeThumbnailUrl(videoId),
    description: 'Sermon video description',
    publishedAt: new Date().toISOString(),
    viewCount: 0,
    likeCount: 0
  };
};

/**
 * Format duration from seconds to MM:SS or HH:MM:SS format
 * @param {number} seconds - Duration in seconds
 * @returns {string} - Formatted duration
 */
export const formatDuration = (seconds) => {
  if (!seconds || seconds < 0) return '0:00';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  } else {
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
};

/**
 * Parse duration string to seconds
 * @param {string} durationString - Duration string (e.g., "45:30" or "1:23:45")
 * @returns {number} - Duration in seconds
 */
export const parseDurationToSeconds = (durationString) => {
  if (!durationString) return 0;
  
  const parts = durationString.split(':').map(part => parseInt(part, 10));
  
  if (parts.length === 2) {
    // MM:SS format
    return parts[0] * 60 + parts[1];
  } else if (parts.length === 3) {
    // HH:MM:SS format
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }
  
  return 0;
};
