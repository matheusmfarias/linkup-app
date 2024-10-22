import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Alert } from 'react-native';
import axios from 'axios';
import { useNavigation, useRoute } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';

const UserProfileScreen = () => {
  const [user, setUser] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followingCount, setFollowingCount] = useState(0);
  const [followersCount, setFollowersCount] = useState(0);
  const navigation = useNavigation();
  const route = useRoute();
  const { userId, token } = route.params;
  const { user: loggedUser } = useContext(AuthContext);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userResponse = await axios.get(`http://192.168.118.163:3000/api/profile/user/${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        setUser(userResponse.data);

        const photosResponse = await axios.get(`http://192.168.118.163:3000/api/profile/photos/${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        setPhotos(photosResponse.data.photos.map(photo => ({ uri: `http://192.168.118.163:3000${photo.uri}` }))); // Certifique-se de que o caminho da URI está correto

        const countersResponse = await axios.get(`http://192.168.118.163:3000/api/profile/counters/${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        setFollowingCount(countersResponse.data.following);
        setFollowersCount(countersResponse.data.followers);

        setIsFollowing(loggedUser.following.includes(userId));
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, [userId, token, loggedUser.following]);

  const handleFollow = async () => {
    try {
      await axios.post('http://192.168.118.163:3000/api/profile/follow', { userId }, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      setIsFollowing(true);
      setFollowersCount(followersCount + 1);
      loggedUser.following.push(userId);
    } catch (error) {
      console.error('Error following user:', error);
      Alert.alert('Erro ao seguir usuário');
    }
  };

  const handleUnfollow = async () => {
    try {
      await axios.post('http://192.168.118.163:3000/api/profile/unfollow', { userId }, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      setIsFollowing(false);
      setFollowersCount(followersCount - 1);
      loggedUser.following = loggedUser.following.filter(id => id !== userId);
    } catch (error) {
      console.error('Error unfollowing user:', error);
      Alert.alert('Erro ao deixar de seguir usuário');
    }
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <Text>Carregando...</Text>
      </View>
    );
  }

  const renderPhotoItem = (photoUri) => (
    <TouchableOpacity
      key={photoUri.uri}
      style={styles.photoContainer}
      onPress={() => navigation.navigate('PhotoDetailScreen', { photoUri: photoUri.uri, user, canDelete: false })}
    >
      <Image source={{ uri: photoUri.uri }} style={styles.photo} />
    </TouchableOpacity>
  );

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
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        </TouchableOpacity>
      </View>
      <View style={styles.profileInfo}>
        <Image source={{ uri: `http://192.168.118.163:3000${user.profilePicture}` }} style={styles.profilePicture} />
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
      <View style={styles.buttonContainer}>
        <TouchableOpacity onPress={isFollowing ? handleUnfollow : handleFollow} style={styles.followButton}>
          <Text style={styles.followButtonText}>{isFollowing ? 'Deixar de Seguir' : 'Seguir'}</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.photoGrid}>
      {getPhotosWithPlaceholders(photos).map(photoUri => (
          photoUri.uri ? renderPhotoItem(photoUri) : <View key={Math.random()} style={styles.photoContainer} />
        ))}
      </View>
    </ScrollView >
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F2',
  },
  backButton: {
    marginRight: 10,
  },
  backButtonText: {
    color: '#007BFF',
    fontSize: 18,
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
  buttonContainer: {
    alignItems: 'center',
  },
  followButton: {
    width: '50%',
    alignItems: 'center',
    backgroundColor: '#007BFF',
    padding: 10,
    borderRadius: 5,
    margin: 20,
  },
  followButtonText: {
    color: '#FFF',
    fontSize: 16,
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between'
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
});

export default UserProfileScreen;
