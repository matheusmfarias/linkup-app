import React, { useState, useContext, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, TextInput, Button, FlatList, Alert, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Menu, Provider, Divider } from 'react-native-paper';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const PhotoCard = ({ photo, removePhotoFromFeed }) => {
  const { user: loggedUser } = useContext(AuthContext);
  const [likes, setLikes] = useState(photo.likes.length);
  const [comments, setComments] = useState(photo.comments);
  const [newComment, setNewComment] = useState('');
  const [isLikedByUser, setIsLikedByUser] = useState(photo.likes.includes(loggedUser._id));
  const [menuVisible, setMenuVisible] = useState(false);
  const navigation = useNavigation();
  const { width } = Dimensions.get('window');

  console.log('Rendering PhotoCard with photo URI:', photo.uri);

  const handleToggleLikePhoto = async () => {
    if (isLikedByUser) {
      handleUnlikePhoto();
    } else {
      handleLikePhoto();
    }
  };

  const handleLikePhoto = async () => {
    try {
      await axios.post('http://192.168.118.163:3000/api/profile/like-photo', { photoUri: photo.uri }, {
        headers: {
          'Authorization': `Bearer ${loggedUser.token}`,
        },
      });
      setLikes(likes + 1);
      setIsLikedByUser(true);
    } catch (error) {
      console.error('Error liking photo:', error);
      Alert.alert('Erro ao curtir a foto');
    }
  };

  const handleUnlikePhoto = async () => {
    try {
      await axios.post('http://192.168.118.163:3000/api/profile/unlike-photo', { photoUri: photo.uri }, {
        headers: {
          'Authorization': `Bearer ${loggedUser.token}`,
        },
      });
      setLikes(likes - 1);
      setIsLikedByUser(false);
    } catch (error) {
      console.error('Error unliking photo:', error);
      Alert.alert('Erro ao descurtir a foto');
    }
  };

  const handleAddComment = async () => {
    if (!newComment) return;

    try {
      const response = await axios.post('http://192.168.118.163:3000/api/profile/comment-photo', { photoUri: photo.uri, comment: newComment }, {
        headers: {
          'Authorization': `Bearer ${loggedUser.token}`,
        },
      });

      const newCommentData = {
        ...response.data,
        user: {
          firstName: loggedUser.firstName,
          lastName: loggedUser.lastName,
          profilePicture: loggedUser.profilePicture,
        },
      };

      setComments([...comments, newCommentData]);
      setNewComment('');
    } catch (error) {
      console.error('Error commenting on photo:', error);
      Alert.alert('Erro ao comentar na foto');
    }
  };

  const renderCommentItem = ({ item }) => (
    <View style={styles.commentContainer}>
      <Image source={{ uri: `http://192.168.118.163:3000${item.user.profilePicture}` }} style={styles.commentProfilePicture} />
      <View>
        <Text style={styles.commentUserName}>{item.user.firstName} {item.user.lastName}</Text>
        <Text style={styles.commentText}>{item.comment}</Text>
      </View>
    </View>
  );

  const handleProfileNavigation = () => {
    if (photo.user._id === loggedUser._id) {
      navigation.navigate('ProfileScreen');
    } else {
      navigation.navigate('UserProfileScreen', { userId: photo.user._id, token: loggedUser.token });
    }
  };

  const handleDeletePhoto = async () => {
    Alert.alert(
      'Confirmar Exclusão',
      'Tem certeza de que deseja deletar esta publicação?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Deletar',
          onPress: async () => {
            try {
              const response = await axios.delete('http://192.168.118.163:3000/api/profile/delete-photo', {
                headers: {
                  'Authorization': `Bearer ${loggedUser.token}`,
                },
                data: {
                  photoUri: photo.uri,
                },
              });
              console.log('Delete response:', response.data);
              Alert.alert('Foto deletada com sucesso', '', [
                {
                  text: 'OK',
                  onPress: () => {
                    if (removePhotoFromFeed) {
                      removePhotoFromFeed(photo.uri);
                    }
                    navigation.navigate('ProfileScreen');
                  },
                },
              ]);
            } catch (error) {
              console.error('Error deleting photo:', error);
              Alert.alert('Erro ao deletar a foto');
            }
          },
          style: 'destructive',
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <Provider>
      <View style={styles.photoItem}>
        <View style={styles.userInfoContainer}>
          <TouchableOpacity onPress={handleProfileNavigation} style={styles.userInfo}>
            <Image source={{ uri: `http://192.168.118.163:3000${photo.user.profilePicture}` }} style={styles.profilePicture} />
            <Text style={styles.userName}>{photo.user.firstName} {photo.user.lastName}</Text>
          </TouchableOpacity>
          {photo.user._id === loggedUser._id && (
            <Menu
              visible={menuVisible}
              onDismiss={() => setMenuVisible(false)}
              anchor={
                <TouchableOpacity onPress={() => setMenuVisible(true)} style={styles.menuButton}>
                  <Ionicons name="ellipsis-vertical" size={25} color="#007BFF" />
                </TouchableOpacity>
              }
            >
              <Menu.Item onPress={handleDeletePhoto} title="Deletar Publicação" />
              <Divider />
              <Menu.Item onPress={() => setMenuVisible(false)} title="Cancelar" />
            </Menu>
          )}
        </View>
        <Image source={{ uri: photo.uri }} style={[styles.photo, { width, height: width }]} />
        <View style={styles.actionsContainer}>
          <TouchableOpacity onPress={handleToggleLikePhoto}>
            <Ionicons name={isLikedByUser ? 'heart' : 'heart-outline'} size={30} color={isLikedByUser ? '#FF0000' : '#007BFF'} />
          </TouchableOpacity>
          <Text>{likes}</Text>
        </View>
        <View style={styles.commentInputContainer}>
          <TextInput
            value={newComment}
            onChangeText={setNewComment}
            placeholder="Adicione um comentário..."
            style={styles.commentInput}
          />
          <Button title="Comentar" onPress={handleAddComment} />
        </View>
        <FlatList
          data={comments}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderCommentItem}
          contentContainerStyle={styles.commentsList}
          nestedScrollEnabled
        />
      </View>
    </Provider>
  );
};

const styles = StyleSheet.create({
  photoItem: {
    marginBottom: 20,
    backgroundColor: '#F2F2F2',
  },
  userInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profilePicture: {
    width: 40,
    height: 40,
    borderRadius: 25,
    marginRight: 10,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  photo: {
    resizeMode: 'cover',
    marginVertical: 10,
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  commentInput: {
    flex: 1,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginRight: 10,
  },
  commentsList: {
    padding: 10,
  },
  commentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    padding: 10,
  },
  commentProfilePicture: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10,
  },
  commentUserName: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  commentText: {
    fontSize: 14,
  },
  menuButton: {
    marginLeft: 'auto',
  },
});

export default PhotoCard;
