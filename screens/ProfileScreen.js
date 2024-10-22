import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert, Button, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

const ProfileScreen = ({ navigation, route }) => {
  const { user, logout } = useContext(AuthContext);
  const [profilePicture, setProfilePicture] = useState(require('../assets/profile-placeholder.png'));
  const [photos, setPhotos] = useState([]);
  const [selectedPicture, setSelectedPicture] = useState(null);
  const [status, requestPermission] = ImagePicker.useCameraPermissions();
  const [followingCount, setFollowingCount] = useState(0);
  const [followersCount, setFollowersCount] = useState(0);

  useEffect(() => {
    if (status !== 'granted') {
      requestPermission();
    }
  }, [status]);

  const fetchProfileData = async () => {
    try {
      const response = await api.get('/profile/profile-picture', {
        headers: {
          'Authorization': `Bearer ${user.token}`,
        },
      });

      if (response.data.profilePicture) {
        const profilePictureUri = `http://192.168.118.163:3000${response.data.profilePicture}`;
        setProfilePicture({ uri: profilePictureUri });
      } else {
        setProfilePicture(require('../assets/profile-placeholder.png'));
      }
    } catch (error) {
      console.error('Error fetching profile picture:', error);
      setProfilePicture(require('../assets/profile-placeholder.png'));
    }

    try {
      const response = await api.get('/profile/photos', {
        headers: {
          'Authorization': `Bearer ${user.token}`,
        },
      });

      const photoUris = response.data.photos.map(photo => ({ uri: `http://192.168.118.163:3000${photo.uri}` }));
      setPhotos(photoUris.reverse());  // Inverter a ordem para que as fotos mais recentes apareçam primeiro
    } catch (error) {
      console.error('Error fetching photos:', error);
    }
  };

  const fetchCounters = async () => {
    try {
      const response = await api.get(`/profile/counters`, {
        headers: {
          'Authorization': `Bearer ${user.token}`,
        },
      });
      setFollowingCount(response.data.following);
      setFollowersCount(response.data.followers);
    } catch (error) {
      console.error('Error fetching counters:', error);
    }
  };

  useEffect(() => {
    fetchProfileData(user);
    fetchCounters();

    if (route.params?.newPhoto) {
      updatePhotos(route.params.newPhoto);
      navigation.setParams({ newPhoto: null }); // Limpar o parâmetro para evitar múltiplas adições
    }
  }, [route.params?.newPhoto]);

  useFocusEffect(
    React.useCallback(() => {
      fetchProfileData(user);
      fetchCounters();
    }, [])
  );

  const handleProfilePictureChange = async () => {
    Alert.alert('Escolha uma opção', '', [
      {
        text: 'Tirar foto',
        onPress: async () => {
          let result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
          });

          if (!result.canceled) {
            setSelectedPicture({ uri: result.assets[0].uri });
          }
        },
      },
      {
        text: 'Escolher da biblioteca',
        onPress: async () => {
          let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
          });

          if (!result.canceled) {
            setSelectedPicture({ uri: result.assets[0].uri });
          }
        },
      },
      {
        text: 'Remover foto',
        onPress: async () => {
          try {
            await api.delete('/profile/remove-profile-picture', {
              headers: {
                'Authorization': `Bearer ${user.token}`,
              },
            });
            setProfilePicture(require('../assets/profile-placeholder.png'));
            Alert.alert('Foto de perfil removida com sucesso!');
          } catch (error) {
            console.error('Error removing profile picture:', error);
            Alert.alert('Falha ao remover foto de perfil');
          }
        },
        style: 'destructive',
      },
      {
        text: 'Cancelar',
        style: 'cancel',
      },
    ]);
  };

  const saveProfilePicture = async () => {
    try {
      let data = new FormData();
      data.append('profilePicture', {
        uri: selectedPicture.uri,
        type: 'image/jpeg',
        name: 'profilePicture.jpg',
      });

      const response = await api.post('/profile/upload-profile-picture', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${user.token}`,
        },
      });

      const profilePictureUri = `http://192.168.118.163:3000${response.data.profilePicture}`;
      setProfilePicture({ uri: profilePictureUri });
      setSelectedPicture(null);
      
      // Atualize o estado do usuário com a nova foto de perfil
      user.profilePicture = response.data.profilePicture;
      Alert.alert('Foto de perfil atualizada');
    } catch (error) {
    }
  };

  const handleLogout = () => {
    logout();
  };

  const renderPhotoItem = (photoUri) => (
    <TouchableOpacity
      key={photoUri.uri}
      onPress={() => {
        console.log('Navigating to PhotoDetailScreen with URI:', photoUri.uri); // Log para depuração
        navigation.navigate('PhotoDetailScreen', { photoUri: photoUri.uri, user, canDelete: true });
      }}
      style={styles.photoContainer}
    >
      <Image source={{ uri: photoUri.uri }} style={styles.photo} />
    </TouchableOpacity>
  );

  const updatePhotos = (newPhoto) => {
    setPhotos(prevPhotos => [newPhoto, ...prevPhotos]);
  };

  const getPhotosWithPlaceholders = (photos) => {
    const photosWithPlaceholders = [...photos];
    const remainder = photos.length % 3;
    if (remainder !== 0) {
      for (let i = 0; i < 3 - remainder; i++) {
        photosWithPlaceholders.push({ uri: null });
      }
    }
    return photosWithPlaceholders;
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.profileInfo}>
        <TouchableOpacity onPress={handleProfilePictureChange}>
          <Image source={selectedPicture || profilePicture} style={styles.profilePicture} />
        </TouchableOpacity>
        <View>
          <Text style={styles.profileName}>{user.firstName} {user.lastName}</Text>
          <Text style={styles.profileEmail}>{user.email}</Text>
        </View>
      </View>
      <View style={styles.countersContainer}>
        <View style={styles.seguindoContainer}>
          <Text>{followingCount}</Text>
          <Text>Seguindo</Text>
        </View>
        <View style={styles.seguidoresContainer}>
          <Text>{followersCount}</Text>
          <Text>Seguidores</Text>
        </View>
      </View>
      {selectedPicture && (
        <Button title="Salvar Imagem" onPress={saveProfilePicture} />
      )}
      <View style={styles.photoGrid}>
        {getPhotosWithPlaceholders(photos).map(photoUri => (
          photoUri.uri ? renderPhotoItem(photoUri) : <View key={Math.random()} style={styles.photoContainer} />
        ))}
      </View>
      <View style={styles.logoutButtonContainer}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Sair</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F2',
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 20,
  },
  profilePicture: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 20,
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  profileEmail: {
    color: '#888',
  },
  countersContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  seguindoContainer: {
    alignItems: 'center',
  },
  seguidoresContainer: {
    alignItems: 'center',
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  photoContainer: {
    width: '30%',
    height: 100,
    margin: 5,
  },
  photo: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  logoutButtonContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  logoutButton: {
    backgroundColor: '#FF6347',
    padding: 10,
    borderRadius: 5,
  },
  logoutButtonText: {
    color: '#FFF',
    fontSize: 16,
  },
});

export default ProfileScreen;
