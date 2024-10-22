import React, { useState, useEffect, useContext } from 'react';
import { FlatList, StyleSheet, Alert, View, Text } from 'react-native';
import PhotoCard from '../components/PhotoCard';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const FeedScreen = () => {
  const { user } = useContext(AuthContext);
  const [photos, setPhotos] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchFeedPhotos = async () => {
    try {
      const response = await axios.get('http://192.168.118.163:3000/api/profile/feed', {
        headers: {
          'Authorization': `Bearer ${user.token}`,
        },
      });

      console.log('Feed photos response:', response.data);

      const photosData = response.data.map(photo => ({
        ...photo,
        uri: `http://192.168.118.163:3000${photo.uri}`,
      }));

      setPhotos(photosData);
    } catch (error) {
      console.error('Error fetching feed photos:', error);
      Alert.alert('Erro ao buscar fotos do feed');
    }
  };

  useEffect(() => {
    fetchFeedPhotos();
  }, [user.token]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchFeedPhotos();
    setRefreshing(false);
  };

  const removePhotoFromFeed = (photoUri) => {
    setPhotos(photos.filter(photo => photo.uri !== photoUri));
  };

  const renderPhotoItem = ({ item }) => (
    <PhotoCard photo={item} removePhotoFromFeed={removePhotoFromFeed} />
  );

  return (
    <FlatList
      data={photos}
      renderItem={renderPhotoItem}
      keyExtractor={(item) => item.uri}
      contentContainerStyle={styles.container}
      refreshing={refreshing}
      onRefresh={handleRefresh}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F2F2F2',
  },
  noPhotosText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 18,
    color: '#888',
  },
});

export default FeedScreen;
