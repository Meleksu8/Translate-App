import 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import HomeScreen from './screens/HomeScreen';
import SavedScreen from './screens/SavedScreen';
import SettingsScreen from './screens/SettingsScreen';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Entypo from '@expo/vector-icons/Entypo';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as SplashScreen from 'expo-splash-screen';
import {useCallback, useEffect, useState} from 'react';
import * as Font from 'expo-font';
import colors from './utils/colors';
import LanguageSelectScreen from './screens/LanguageSelectScreen';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Provider } from 'react-redux';
import store from './store/store';
// import AsyncStorage  from '@react-native-async-storage/async-storage';
// AsyncStorage.clear();

SplashScreen.preventAutoHideAsync();

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  return (
    
    <Provider store={store}>
    <Tab.Navigator
      screenOptions={{
        headerShown: false
      }}
    >
      <Tab.Screen
      name="Home"
      component={HomeScreen}
      options={{
        tabBarLabel: "Home",
        tabBarIcon: (props) => {
          return <Entypo name="home" size={props.size} color={props.color} />
        }
      }}
      />

      <Tab.Screen
      name="Saved"
      component={SavedScreen}
      options={{
        tabBarLabel: "Saved",
        tabBarIcon: (props) => {
          return <Entypo name="star" size={props.size} color={props.color} />
        }
      }}
      />

      <Tab.Screen
      name="Settings"
      component={SettingsScreen}
      options={{
        tabBarLabel: "Settings",
        tabBarIcon: (props) => {
          return <Ionicons name="settings-sharp" size={props.size} color={props.color} />
        }
      }}


      />

    </Tab.Navigator>
    </Provider>
    
  )
}

const Stack = createNativeStackNavigator();

export default function App() {

  const [appIsLoaded, setAppIsLoaded] = useState(false);

  useEffect(()=>{
    const prepare = async () => {
      try {
        await Font.loadAsync({
          black: require("./assets/fonts/Roboto/Roboto-Black.ttf"),
          blackItalic: require("./assets/fonts/Roboto/Roboto-BlackItalic.ttf"),
          bold: require("./assets/fonts/Roboto/Roboto-Bold.ttf"),
          boldItalic: require("./assets/fonts/Roboto/Roboto-BoldItalic.ttf"),
          italic: require("./assets/fonts/Roboto/Roboto-Italic.ttf"),
          light: require("./assets/fonts/Roboto/Roboto-Light.ttf"),
          lightItalic: require("./assets/fonts/Roboto/Roboto-LightItalic.ttf"),
          medium: require("./assets/fonts/Roboto/Roboto-Medium.ttf"),
          mediumItalic: require("./assets/fonts/Roboto/Roboto-MediumItalic.ttf"),
          regular: require("./assets/fonts/Roboto/Roboto-Regular.ttf"),
          thin: require("./assets/fonts/Roboto/Roboto-Thin.ttf"),
          thinItalic: require("./assets/fonts/Roboto/Roboto-ThinItalic.ttf"),
        });

      } catch (e) {
        console.log(e);
      }
      finally{
        setAppIsLoaded(true);
      }
      
    };

    prepare();
  },[]);

  const onLayout = useCallback(async()=>{
    if (appIsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [appIsLoaded]);

  //galiba returne geçmesi için
  if (!appIsLoaded) {
    return null;
  }

  return (
    <NavigationContainer>
    <View onLayout={onLayout} style={{flex:1}}>
      <Stack.Navigator
        screenOptions={{
          headerTitleStyle: {
            fontFamily: 'medium',
            color: 'white'
          },
          headerStyle: {
            backgroundColor: colors.primary
          }
        }}
      >
        <Stack.Group>
          <Stack.Screen
          name="main"
          component={TabNavigator}
          options={{
            headerTitle: "Translate",
            headerTitleAlign: 'center'
          }}
          />
        </Stack.Group>

        <Stack.Group
          screenOptions={{
            presentation: 'containedModal',
            headerStyle: {
              backgroundColor: 'white'
            },
            headerTitleStyle: {
              color: colors.textColor,
              fontFamily: 'medium'
            }
          }}
        >
          <Stack.Screen
          name="languageSelect"
          component={LanguageSelectScreen}
          
          />
        </Stack.Group>

      </Stack.Navigator>
    </View>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
