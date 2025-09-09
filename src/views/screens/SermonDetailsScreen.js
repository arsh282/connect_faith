import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Alert,
    Dimensions,
    Image,
    Linking,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { WebView } from 'react-native-webview';
import { extractYouTubeVideoId, getYouTubeEmbedUrl, getYouTubeThumbnailUrl } from '../../services/youtubeService';

const { width, height } = Dimensions.get('window');

export default function SermonDetailsScreen({ navigation, route }) {
  const { sermon: rawSermon } = route?.params || {
    id: 1,
    title: 'The Power of Forgiveness',
    speaker: 'Pastor John Smith',
    date: '2024-03-10T10:00:00',
    type: 'VIDEO',
    image: require('../../../assets/images/sermon-church-1.png'),
    icon: 'videocam',
    description: 'A powerful message about the transformative power of forgiveness in our lives. This sermon explores how forgiveness can heal relationships, bring peace to our hearts, and align us with God\'s will.',
    duration: '45:30',
    youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    tags: ['forgiveness', 'healing', 'relationships', 'peace'],
    createdAt: '2024-03-10T10:00:00',
    viewCount: 1250,
    likeCount: 89
  };

  // Ensure sermon has all required properties with defaults
  const sermon = {
    ...rawSermon,
    youtubeUrl: rawSermon?.youtubeUrl || rawSermon?.videoUrl || null,
    duration: rawSermon?.duration || '45:30',
    description: rawSermon?.description || 'No description available.',
    tags: rawSermon?.tags || [],
    viewCount: rawSermon?.viewCount || 0,
    likeCount: rawSermon?.likeCount || 0,
    createdAt: rawSermon?.createdAt || rawSermon?.date || new Date().toISOString()
  };

  const [isPlaying, setIsPlaying] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);

  const videoId = extractYouTubeVideoId(sermon.youtubeUrl);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return {
      full: date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      time: date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      }),
      short: date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      })
    };
  };

  const dateInfo = formatDate(sermon.createdAt);

  const handlePlayVideo = () => {
    if (sermon.youtubeUrl) {
      if (Platform.OS === 'web') {
        // For web, open in new tab
        window.open(sermon.youtubeUrl, '_blank');
      } else {
        // For mobile, open in YouTube app or browser
        Linking.openURL(sermon.youtubeUrl);
      }
    } else {
      Alert.alert('Video Not Available', 'This sermon does not have a video available.');
    }
  };

  const handleShare = () => {
    const shareText = `Check out this sermon: "${sermon.title}" by ${sermon.speaker}`;
    if (Platform.OS === 'web') {
      if (navigator.share) {
        navigator.share({
          title: sermon.title,
          text: shareText,
          url: sermon.youtubeUrl || window.location.href
        });
      } else {
        // Fallback to copying to clipboard
        navigator.clipboard.writeText(shareText + (sermon.youtubeUrl ? `\n${sermon.youtubeUrl}` : ''));
        Alert.alert('Copied', 'Sermon details copied to clipboard!');
      }
    } else {
      // For React Native, you would use Share API here
      Alert.alert('Share', 'Share functionality would be implemented here');
    }
  };

  const renderYouTubeEmbed = () => {
    if (!videoId) return null;

    const embedUrl = getYouTubeEmbedUrl(videoId, {
      autoplay: 0,
      controls: 1,
      showinfo: 1,
      rel: 0,
      modestbranding: 1
    });
    
    return (
      <View style={styles.videoContainer}>
        <WebView
          source={{ uri: embedUrl }}
          style={styles.videoPlayer}
          allowsFullscreenVideo={true}
          mediaPlaybackRequiresUserAction={false}
          onError={(error) => console.log('WebView error:', error)}
          onLoadStart={() => console.log('Video loading started')}
          onLoadEnd={() => console.log('Video loading ended')}
        />
      </View>
    );
  };

  const renderVideoThumbnail = () => {
    if (videoId) {
      const thumbnailUrl = getYouTubeThumbnailUrl(videoId, 'maxres');
      return (
        <Image 
          source={{ uri: thumbnailUrl }}
          style={styles.videoThumbnail}
          resizeMode="cover"
        />
      );
    }
    return (
      <Image 
        source={sermon.image}
        style={styles.videoThumbnail}
        resizeMode="cover"
      />
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#6699CC" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sermon Details</Text>
        <TouchableOpacity 
          style={styles.shareButton}
          onPress={handleShare}
        >
          <Ionicons name="share-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Video Section */}
        {sermon.type === 'VIDEO' && sermon.youtubeUrl ? (
          renderYouTubeEmbed()
        ) : (
          <View style={styles.thumbnailContainer}>
            {renderVideoThumbnail()}
            {sermon.type === 'VIDEO' && (
              <TouchableOpacity 
                style={styles.playButton}
                onPress={handlePlayVideo}
                activeOpacity={0.8}
              >
                <Ionicons name="play" size={40} color="#fff" />
              </TouchableOpacity>
            )}
            <View style={styles.mediaTypeLabel}>
              <Text style={styles.mediaTypeText}>{sermon.type}</Text>
            </View>
            {sermon.duration && (
              <View style={styles.durationLabel}>
                <Text style={styles.durationText}>{sermon.duration}</Text>
              </View>
            )}
          </View>
        )}

        {/* Sermon Info */}
        <View style={styles.sermonInfo}>
          <Text style={styles.sermonTitle}>{sermon.title}</Text>
          <Text style={styles.speakerName}>{sermon.speaker}</Text>
          
          {/* Date and Time Info */}
          <View style={styles.dateTimeContainer}>
            <View style={styles.dateTimeItem}>
              <Ionicons name="calendar-outline" size={20} color="#6699CC" />
              <View style={styles.dateTimeText}>
                <Text style={styles.dateTimeLabel}>Date</Text>
                <Text style={styles.dateTimeValue}>{dateInfo.full}</Text>
              </View>
            </View>
            
            <View style={styles.dateTimeItem}>
              <Ionicons name="time-outline" size={20} color="#6699CC" />
              <View style={styles.dateTimeText}>
                <Text style={styles.dateTimeLabel}>Time</Text>
                <Text style={styles.dateTimeValue}>{dateInfo.time}</Text>
              </View>
            </View>
          </View>

          {/* Stats */}
          <View style={styles.statsContainer}>
            {sermon.viewCount > 0 && (
              <View style={styles.statItem}>
                <Ionicons name="eye-outline" size={16} color="#999" />
                <Text style={styles.statText}>{sermon.viewCount.toLocaleString()} views</Text>
              </View>
            )}
            {sermon.likeCount > 0 && (
              <View style={styles.statItem}>
                <Ionicons name="heart-outline" size={16} color="#999" />
                <Text style={styles.statText}>{sermon.likeCount} likes</Text>
              </View>
            )}
            {sermon.duration && (
              <View style={styles.statItem}>
                <Ionicons name="time-outline" size={16} color="#999" />
                <Text style={styles.statText}>{sermon.duration}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Description */}
        <View style={styles.descriptionContainer}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>
            {showFullDescription ? sermon.description : sermon.description.substring(0, 200)}
            {sermon.description.length > 200 && !showFullDescription && '...'}
          </Text>
          {sermon.description.length > 200 && (
            <TouchableOpacity 
              style={styles.readMoreButton}
              onPress={() => setShowFullDescription(!showFullDescription)}
            >
              <Text style={styles.readMoreText}>
                {showFullDescription ? 'Read Less' : 'Read More'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Tags */}
        {sermon.tags && sermon.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            <Text style={styles.sectionTitle}>Tags</Text>
            <View style={styles.tagsList}>
              {sermon.tags.map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          {sermon.youtubeUrl && (
            <TouchableOpacity 
              style={styles.primaryButton}
              onPress={handlePlayVideo}
            >
              <Ionicons name="play" size={20} color="#fff" />
              <Text style={styles.primaryButtonText}>Watch on YouTube</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity 
            style={styles.secondaryButton}
            onPress={handleShare}
          >
            <Ionicons name="share-outline" size={20} color="#6699CC" />
            <Text style={styles.secondaryButtonText}>Share</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 20,
    backgroundColor: '#6699CC',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
  },
  shareButton: {
    padding: 5,
  },
  content: {
    flex: 1,
  },
  videoContainer: {
    height: 250,
    backgroundColor: '#000',
  },
  videoPlayer: {
    flex: 1,
  },
  thumbnailContainer: {
    position: 'relative',
    height: 250,
    backgroundColor: '#000',
  },
  videoThumbnail: {
    width: '100%',
    height: '100%',
  },
  playButton: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -30 }, { translateY: -30 }],
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mediaTypeLabel: {
    position: 'absolute',
    top: 15,
    right: 15,
    backgroundColor: '#FFCC00',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  mediaTypeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  durationLabel: {
    position: 'absolute',
    bottom: 15,
    right: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  durationText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  sermonInfo: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 10,
  },
  sermonTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
    lineHeight: 32,
  },
  speakerName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6699CC',
    marginBottom: 20,
  },
  dateTimeContainer: {
    marginBottom: 20,
  },
  dateTimeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  dateTimeText: {
    marginLeft: 12,
  },
  dateTimeLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#999',
    marginBottom: 2,
  },
  dateTimeValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  statText: {
    fontSize: 14,
    color: '#999',
  },
  descriptionContainer: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#666',
  },
  readMoreButton: {
    marginTop: 8,
  },
  readMoreText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6699CC',
  },
  tagsContainer: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 10,
  },
  tagsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#F0F8FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#6699CC',
  },
  tagText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6699CC',
  },
  actionButtons: {
    backgroundColor: '#fff',
    padding: 20,
    gap: 12,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6699CC',
    paddingVertical: 15,
    borderRadius: 12,
    gap: 8,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    paddingVertical: 15,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#6699CC',
    gap: 8,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6699CC',
  },
});
