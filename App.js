import React, { useContext, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AuthScreen from './screens/AuthScreen';
import RegisterScreen from './screens/RegisterScreen';
import FeedScreen from './screens/FeedScreen';
import ProfileScreen from './screens/ProfileScreen';
import UploadScreen from './screens/UploadScreen';
import SearchScreen from './screens/SearchScreen';
import PhotoDetailScreen from './screens/PhotoDetailScreen';
import { AuthProvider, AuthContext } from './context/AuthContext';
import UserProfileScreen from './screens/UserProfileScreen';

const AuthStack = createStackNavigator();
const FeedStack = createStackNavigator();
const ProfileStack = createStackNavigator();
const UploadStack = createStackNavigator();
const SearchStack = createStackNavigator();
const RootStack = createStackNavigator();
const Tab = createBottomTabNavigator();

const clearStorage = async () => {
  try {
    await AsyncStorage.clear();
    console.log('AsyncStorage has been cleared');
  } catch (error) {
    console.error('Error clearing AsyncStorage:', error);
  }
};

const AuthNavigator = () => (
  <AuthStack.Navigator initialRouteName="Auth">
    <AuthStack.Screen name="Auth" component={AuthScreen} options={{ headerShown: false }} />
    <AuthStack.Screen
      name="Register"
      component={RegisterScreen}
      options={({ navigation }) => ({
        headerLeft: () => (
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginLeft: 10 }}>
            <Text style={{ color: '#007BFF' }}>Voltar</Text>
          </TouchableOpacity>
        ),
        headerRight: () => (
          <Text style={{ marginRight: 10, fontSize: 18, fontWeight: 'bold' }}>LinkUp</Text>
        ),
        headerTitle: '',
        headerStyle: {
          backgroundColor: '#F2F2F2',
        },
      })}
    />
  </AuthStack.Navigator>
);

const FeedNavigator = () => (
  <FeedStack.Navigator>
    <FeedStack.Screen name="FeedScreen" component={FeedScreen} options={{ headerShown: false }} />
  </FeedStack.Navigator>
);

const ProfileNavigator = () => (
  <ProfileStack.Navigator>
    <ProfileStack.Screen
      name="ProfileScreen"
      component={ProfileScreen}
      options={{ headerShown: false }}
    />
    <ProfileStack.Screen
      name="UploadScreen"
      component={UploadScreen}
      options={{ headerShown: false }}
    />
  </ProfileStack.Navigator>
);

const UploadNavigator = () => (
  <UploadStack.Navigator>
    <UploadStack.Screen name="UploadScreen" component={UploadScreen} options={{ headerShown: false }} />
  </UploadStack.Navigator>
);

const SearchNavigator = () => ( // Adicione um stack navigator para busca
  <SearchStack.Navigator>
    <SearchStack.Screen name="SearchScreen" component={SearchScreen} options={{ headerShown: false }} />
  </SearchStack.Navigator>
);

const TabNavigator = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ color, size }) => {
        let iconName;
        if (route.name === 'Feed') {
          iconName = 'home';
        } else if (route.name === 'Buscar') {
          iconName = 'search';
        } else if (route.name === 'Upload') {
          iconName = 'add-circle';
        } else if (route.name === 'Meu perfil') {
          iconName = 'person';
        }
        return <Ionicons name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: 'blue',
      tabBarInactiveTintColor: 'gray',
    })}
  >
    <Tab.Screen name="Feed" component={FeedNavigator} />
    <Tab.Screen name="Buscar" component={SearchNavigator} />
    <Tab.Screen name="Upload" component={UploadNavigator} />
    <Tab.Screen name="Meu perfil" component={ProfileNavigator} />
  </Tab.Navigator>
);

const RootStackNavigator = () => (
  <RootStack.Navigator>
    <RootStack.Screen name="Tabs" component={TabNavigator} options={{ headerShown: false }} />
    <RootStack.Screen
      name="PhotoDetailScreen"
      component={PhotoDetailScreen}
      options={({ navigation }) => ({
        headerLeft: () => (
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginLeft: 10 }}>
            <Ionicons name="arrow-back" size={25} color="#007BFF" />
          </TouchableOpacity>
        ),
        headerTitle: 'Publicação',
        headerTitleAlign: 'center',
      })}
    />
    <RootStack.Screen
      name="UserProfileScreen"
      component={UserProfileScreen}
      options={({ navigation }) => ({
        headerLeft: () => (
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginLeft: 10 }}>
            <Ionicons name="arrow-back" size={25} color="#007BFF" />
          </TouchableOpacity>
        ),
        headerTitle: 'Perfil do usuário',
      })}
    />
  </RootStack.Navigator>
);


const App = () => {
  const { user } = useContext(AuthContext);

  useEffect(() => {
    clearStorage();
  }, []);

  return (
    <NavigationContainer>
      {user ? <RootStackNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
};

export default () => (
  <AuthProvider>
    <App />
  </AuthProvider>
);