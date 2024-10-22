import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, Image } from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';

const SearchScreen = () => {
  const { user } = useContext(AuthContext);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const navigation = useNavigation();

  const handleSearch = async () => {
    try {
      const response = await axios.get(`http://192.168.118.163:3000/api/profile/search-users?q=${query}`, {
        headers: {
          'Authorization': `Bearer ${user.token}`,
        },
      });
      setResults(response.data);
    } catch (error) {
      console.error('Error searching users:', error);
    }
  };

  const handleUserPress = (userId) => {
    if (userId === user._id) {
      navigation.navigate('ProfileScreen');
    } else {
      navigation.navigate('UserProfileScreen', { userId, token: user.token });
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.userItem} onPress={() => handleUserPress(item._id)}>
      <Image source={{ uri: `http://192.168.118.163:3000${item.profilePicture}` }} style={styles.profilePicture} />
      <Text style={styles.userName}>{item.firstName} {item.lastName}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchBox}
        placeholder="Buscar usuários..."
        value={query}
        onChangeText={setQuery}
      />
      <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
        <Text style={styles.searchButtonText}>Buscar</Text>
      </TouchableOpacity>
      <FlatList
        data={results}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        style={styles.resultsList}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F2F2F2',
  },
  searchBox: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    paddingHorizontal: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  searchButton: {
    backgroundColor: '#007BFF',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 20,
  },
  searchButtonText: {
    color: '#FFF',
    fontSize: 16,
  },
  resultsList: {
    flex: 1,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderColor: '#EEE',
    borderRadius: 10,
    marginBottom: 10,
  },
  profilePicture: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default SearchScreen;
