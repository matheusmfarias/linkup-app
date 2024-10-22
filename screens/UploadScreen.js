import React, { useContext, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Button, Image, Dimensions } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const UploadScreen = ({ navigation }) => {
  const { user } = useContext(AuthContext);
  const [selectedPicture, setSelectedPicture] = useState(null);
  const { width } = Dimensions.get('window');

  const handlePhotoUpload = async () => {
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
        text: 'Cancelar',
        style: 'cancel',
      },
    ]);
  };

  const saveUploadPicture = async () => {
    try {
      let data = new FormData();
      data.append('photo', {
        uri: selectedPicture.uri,
        type: 'image/jpeg',
        name: 'photo.jpg',
      });

      const response = await axios.post('http://192.168.118.163:3000/api/profile/upload-photo', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${user.token}`,
        },
      });

      Alert.alert('Foto carregada com sucesso');
      const newPhotoUri = { uri: `http://192.168.118.163:3000${response.data.photo}` };
      navigation.navigate('ProfileScreen', { newPhoto: newPhotoUri });
      setSelectedPicture(null);
    } catch (error) {
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={handlePhotoUpload} style={styles.uploadButton}>
        <Text style={styles.uploadButtonText}>Escolher Foto</Text>
      </TouchableOpacity>
      <Image source={selectedPicture} style={[styles.uploadPicture, { width, height: width }]} />
      {selectedPicture && (
        <Button title="Publicar foto" onPress={saveUploadPicture} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadPicture: {
    margin: 20,
    resizeMode: 'cover',
  },
  uploadButton: {
    backgroundColor: '#FF6347',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  uploadButtonText: {
    color: '#FFF',
    fontSize: 16,
  },
});

export default UploadScreen;