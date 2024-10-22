import React, { useState, useEffect, useContext } from 'react';
import { FlatList, StyleSheet, Alert, View } from 'react-native';
import PhotoCard from '../components/PhotoCard';
import { useRoute, useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const PhotoDetailScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { photoUri, user, canDelete } = route.params;
  const { user: loggedUser } = useContext(AuthContext);
  const [photo, setPhoto] = useState(null);

  useEffect(() => {
    const fetchPhotoDetails = async () => {
      try {
        console.log('Fetching photo details for URI:', photoUri);
        const response = await axios.get('http://192.168.118.163:3000/api/profile/photo-details', {
          headers: {
            'Authorization': `Bearer ${loggedUser.token}`,
          },
          params: { photoUri },
        });
        console.log('Photo details fetched:', response.data);
        setPhoto({ ...response.data, user, uri: photoUri });
      } catch (error) {
        console.error('Error fetching photo details:', error);
        Alert.alert('Erro ao buscar detalhes da foto');
      }
    };

    fetchPhotoDetails();
  }, [photoUri, loggedUser.token]);

  const removePhotoFromFeed = (photoUri) => {
    setPhoto(null);
  };

  if (!photo) {
    return null;
  }

  return (
    <FlatList
      data={[photo]}
      renderItem={({ item }) => <PhotoCard photo={item} removePhotoFromFeed={removePhotoFromFeed} />}
      keyExtractor={(item) => item.uri}
      style={styles.container}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F2',
  },
});

export default PhotoDetailScreen;
