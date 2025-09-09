import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Dimensions,
    Image,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

const { width, height } = Dimensions.get('window');

export default function SermonArchiveScreen({ navigation }) {
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchText, setSearchText] = useState('');

  const filters = ['All', 'Audio', 'Video', 'Tags'];

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const sermons = [
    {
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
    },
    {
      id: 2,
      title: 'Finding Peace in Chaos',
      speaker: 'Deacon Jane Doe',
      date: '2024-02-25T10:00:00',
      type: 'AUDIO',
      image: require('../../../assets/images/sermon-church-2.png'),
      icon: 'volume-high',
      description: 'In times of uncertainty and chaos, we can find peace through our faith and trust in God\'s plan. This message offers practical guidance for maintaining inner peace.',
      duration: '38:15',
      audioUrl: 'https://example.com/sermon2.mp3',
      tags: ['peace', 'faith', 'trust', 'guidance'],
      createdAt: '2024-02-25T10:00:00',
      viewCount: 890,
      likeCount: 67
    },
    {
      id: 3,
      title: 'Walking in Faith',
      speaker: 'Pastor John Smith',
      date: '2024-02-18T10:00:00',
      type: 'VIDEO',
      image: require('../../../assets/images/sermon-church-3.png'),
      icon: 'videocam',
      description: 'Faith is not just believing, but actively walking in trust and obedience. This sermon challenges us to step out in faith and see God\'s faithfulness in action.',
      duration: '42:20',
      youtubeUrl: 'https://www.youtube.com/watch?v=example3',
      tags: ['faith', 'trust', 'obedience', 'challenge'],
      createdAt: '2024-02-18T10:00:00',
      viewCount: 2100,
      likeCount: 156
    },
    {
      id: 4,
      title: 'The Gift of Grace',
      speaker: 'Deacon Jane Doe',
      date: '2024-02-11T10:00:00',
      type: 'AUDIO',
      image: require('../../../assets/images/sermon-church-4.png'),
      icon: 'volume-high',
      description: 'Grace is the greatest gift we have received. This message explores the depth of God\'s grace and how it transforms our lives and relationships.',
      duration: '35:45',
      audioUrl: 'https://example.com/sermon4.mp3',
      tags: ['grace', 'gift', 'transformation', 'love'],
      createdAt: '2024-02-11T10:00:00',
      viewCount: 750,
      likeCount: 54
    }
  ];

  // Filter sermons based on active filter and search text
  const getFilteredSermons = () => {
    let filtered = sermons;

    // Filter by type (Audio/Video)
    if (activeFilter === 'Audio') {
      filtered = filtered.filter(sermon => sermon.type === 'AUDIO');
    } else if (activeFilter === 'Video') {
      filtered = filtered.filter(sermon => sermon.type === 'VIDEO');
    } else if (activeFilter === 'Tags') {
      // Show only sermons that have tags
      filtered = filtered.filter(sermon => sermon.tags && sermon.tags.length > 0);
    }

    // Filter by search text
    if (searchText.trim()) {
      const searchLower = searchText.toLowerCase();
      filtered = filtered.filter(sermon => 
        sermon.title.toLowerCase().includes(searchLower) ||
        sermon.speaker.toLowerCase().includes(searchLower) ||
        (sermon.tags && sermon.tags.some(tag => tag.toLowerCase().includes(searchLower)))
      );
    }

    return filtered;
  };

  const filteredSermons = getFilteredSermons();

  const renderFilterButton = (filter) => (
    <TouchableOpacity
      key={filter}
      style={[
        styles.filterButton,
        activeFilter === filter && styles.filterButtonActive
      ]}
      onPress={() => setActiveFilter(filter)}
    >
      <Text style={[
        styles.filterButtonText,
        activeFilter === filter && styles.filterButtonTextActive
      ]}>
        {filter}
      </Text>
    </TouchableOpacity>
  );

  const renderSermonCard = (sermon) => (
    <TouchableOpacity 
      key={sermon.id}
      style={styles.sermonCard}
      onPress={() => navigation.navigate('SermonDetails', { sermon })}
      activeOpacity={0.8}
    >
      <View style={styles.sermonImageContainer}>
        <Image 
          source={sermon.image}
          style={styles.sermonImage}
          resizeMode="cover"
        />
        <View style={styles.mediaTypeLabel}>
          <Text style={styles.mediaTypeText}>{sermon.type}</Text>
        </View>
        <View style={styles.mediaIcon}>
          <Ionicons name={sermon.icon} size={16} color="#007AFF" />
        </View>
      </View>
      <View style={styles.sermonContent}>
        <Text style={styles.sermonTitle}>{sermon.title}</Text>
        <Text style={styles.sermonMeta}>{sermon.speaker} • {formatDate(sermon.date)}</Text>
        {sermon.duration && (
          <Text style={styles.sermonDuration}>{sermon.duration}</Text>
        )}
      </View>
    </TouchableOpacity>
  );

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
        <Text style={styles.headerTitle}>Sermons</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Filter Buttons */}
        <View style={styles.filterContainer}>
          {filters.map(renderFilterButton)}
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search sermons..."
            placeholderTextColor="#999"
            value={searchText}
            onChangeText={setSearchText}
          />
          <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
        </View>

        {/* Results Count */}
        <View style={styles.resultsContainer}>
          <Text style={styles.resultsText}>
            {filteredSermons.length} sermon{filteredSermons.length !== 1 ? 's' : ''} 
            {activeFilter !== 'All' && ` in ${activeFilter}`}
            {searchText.trim() && ` matching "${searchText}"`}
          </Text>
        </View>

        {/* Sermon Cards */}
        <View style={styles.sermonsList}>
          {filteredSermons.length > 0 ? (
            filteredSermons.map(renderSermonCard)
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="search-outline" size={48} color="#999" />
              <Text style={styles.emptyStateText}>
                {searchText.trim() 
                  ? `No sermons found for "${searchText}"`
                  : `No ${activeFilter.toLowerCase()} sermons available`
                }
              </Text>
              <Text style={styles.emptyStateSubtext}>
                Try adjusting your search or filter
              </Text>
            </View>
          )}
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
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  filterContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 10,
  },
  filterButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  filterButtonActive: {
    backgroundColor: '#6699CC',
    borderColor: '#6699CC',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#999',
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  searchContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  searchInput: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 45,
    paddingVertical: 15,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  searchIcon: {
    position: 'absolute',
    right: 15,
    top: 15,
  },
  resultsContainer: {
    marginBottom: 15,
  },
  resultsText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  sermonsList: {
    gap: 15,
  },
  sermonCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
  },
  sermonImageContainer: {
    position: 'relative',
    height: 200,
  },
  sermonImage: {
    width: '100%',
    height: '100%',
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
  mediaIcon: {
    position: 'absolute',
    bottom: 15,
    right: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sermonContent: {
    padding: 20,
  },
  sermonTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  sermonMeta: {
    fontSize: 14,
    color: '#999',
    marginBottom: 4,
  },
  sermonDuration: {
    fontSize: 12,
    color: '#6699CC',
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    lineHeight: 20,
  },
});


