import {  StyleSheet, Text,TextInput, TouchableOpacity, View, ActivityIndicator, FlatList } from 'react-native';
import colors from '../utils/colors';
import {AntDesign, Ionicons, MaterialIcons} from '@expo/vector-icons';
import { useEffect, useState, useCallback } from 'react';
import supportedLanguages from '../utils/supportedLanguages';
import { translate } from '../utils/translate';
import * as Clipboard from 'expo-clipboard';
import { useDispatch, useSelector } from 'react-redux';
import { addHistoryItem, setHistoryItems } from '../store/historySlice';
import TranslationResult from '../components/TranslationResult';
import uuid from 'react-native-uuid';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setSavedItems } from '../store/savedItemsSlice';
import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

//history ve savedItemsı uygulama açıldığında hafızadan okuyup Redux stateine yükleyen
// bir Redux Thunk (Asenkron işlem) fonksiyonudur.
const loadData = () => {
    return async dispatch => {
      try {
        const historyString = await AsyncStorage.getItem('history');
        if (historyString !== null) {
          // parsing it back to the object
          const history = JSON.parse(historyString);
          dispatch(setHistoryItems({items: history}));
        }
        const savedItemsString = await AsyncStorage.getItem('savedItems');
        if (savedItemsString !== null) {
          // parsing it back to the object
          const savedItems = JSON.parse(savedItemsString);
          dispatch(setSavedItems({items: savedItems}));
        }
      } catch (error) {
        console.log(error);
      }
    }
}

export default function HomeScreen(props) {
  const params = props.route.params || {};
  const dispatch = useDispatch();
  const history = useSelector(state => state.history.items);
  const [enteredText, setEnteredText] = useState("");
  const [resultText, setResultText] = useState("");
  const [languageTo, setLanguageTo] = useState("tr");
  const [languageFrom, setLanguageFrom] = useState("en");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(()=>{
    if (params.languageTo) {
      setLanguageTo(params.languageTo);
    }
    if (params.languageFrom) {
      setLanguageFrom(params.languageFrom);
    }
  }, [params.languageTo, params.languageFrom]);

  //disatch referansı hiç değişmeyeceği için uygulama açıldığında bir kez çalışır.
  useEffect(()=>{
    dispatch(loadData());
  }, [dispatch]);

  //yerel diski(historyi güncel tutmak)
  useEffect(()=>{
    const saveHistory = async () => {
      try {
        await AsyncStorage.setItem('history', JSON.stringify(history));
      } catch (error) {
        console.log(error);
      }
    }
     saveHistory();
  }, [history]);

  //Eğer geçmiş tamamen temizlendiyse ana ekrandaki metin kutuları sıfırlanacak
  useEffect(()=>{
    if (history.length === 0) {
      setEnteredText("");
      setResultText("");
    }
  }, [history]);
  
  //Geçmişten rastgele bir kelime seçip bildirim kuran fonksiyon
  const scheduleWordReminder = useCallback(async (currentHistory, frequencyInHours=24)=>{
    if (!currentHistory || currentHistory.length === 0) return;

    //Bildirim izni isteme
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') return ;

    //Geçmişten rastgele bir öğe seç
    const randomItem = currentHistory[Math.floor(Math.random() * currentHistory.length)];
    const originalText = randomItem.original_text || randomItem.text;
    const translatedText = randomItem.translated_text ? randomItem.translated_text[randomItem.to] : "";

    //Eski zamanlanmış bildirimleri temizle
    await Notifications.cancelAllScheduledNotificationsAsync();

    //şimdilik 10 saniye
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Kelime Hatırlatıcı",
        body: `"${originalText}"->${translatedText}`,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: frequencyInHours * 1800,
        repeats: false,
      },
    });
  }, []);

  const onSubmit = useCallback(async () => {

    try {
      setIsLoading(true);
      const result = await translate(enteredText, languageFrom, languageTo);
      if (!result) {
        setResultText("");
        return;
      }
      const textResult = result.translated_text[result.to];
      setResultText(textResult);

      const id = uuid.v4();
      result.id = id;
      result.dateTime = new Date().toISOString();

      dispatch(addHistoryItem({item: result}));

      //4. Çeviri yapıldığında yeni geçmişle birlikte bildirimi kur
      scheduleWordReminder([...history, result]);
      
    } catch (error) {
      console.log(error);
    }
    finally {
      setIsLoading(false);
    }
    
  }, [enteredText, languageTo, languageFrom, dispatch, history, scheduleWordReminder]);

  const copyToClipboard = useCallback(async ()=>{
     await Clipboard.setStringAsync(resultText);
  }, [resultText]);

  const swapLanguages = useCallback(()=>{
    setLanguageFrom(languageTo);
    setLanguageTo(languageFrom);
  }, [languageFrom, languageTo]);

  return (

    <View style={styles.container}>
      <View style={styles.languageContainer}>
        <TouchableOpacity
          style={styles.languageOption}
          onPress={()=> props.navigation.navigate("languageSelect", {title: "Translate from", selected: languageFrom, mode: 'from'})}>
          <Text style={styles.languageOptionText}>{supportedLanguages[languageFrom]}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.arrowContainer}
          onPress={swapLanguages}>
          <AntDesign name="arrow-right" size={24} color={colors.primary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.languageOption}
          onPress={()=> props.navigation.navigate("languageSelect", {title: "Translate to", selected: languageTo, mode: 'to'})}>
          <Text style={styles.languageOptionText}>{supportedLanguages[languageTo]}</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.inputContainer}>
        <TextInput 
          multiline
          placeholder='Enter text'
          placeholderTextColor={colors.primaryDisabled}
          style={styles.textInput}
          value={enteredText}
          onChangeText={(text)=> setEnteredText(text)}
        />
        <TouchableOpacity
          onPress={isLoading ? undefined : onSubmit}
          disabled={enteredText === ""}
          style={styles.iconContainer}>

          {
            isLoading ?
            <ActivityIndicator size={'small'} color={colors.primary}/>:
            <Ionicons 
              name="arrow-forward-circle-sharp"
              size={24} 
              color={enteredText !== "" ? colors.textColor : colors.primaryDisabled}/>

          }
          
        </TouchableOpacity>
      </View>

      <View style={styles.resultContainer}>
        <Text style={styles.resultText}>{resultText}</Text>

        <TouchableOpacity
          onPress={copyToClipboard}
          disabled={resultText === ""}
          style={styles.iconContainer}>
          <MaterialIcons
            name="content-copy"
            size={24} 
            color={resultText !== "" ? colors.textColor : colors.primaryDisabled}/>
        </TouchableOpacity>
      </View>
      <View style={styles.historyContainer}>
          <FlatList
            data={history.slice().reverse()}
            renderItem={itemData => {
              return <TranslationResult itemId={itemData.item.id}/>
            }}
          />
      </View>
    </View>

  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    
  },
  languageContainer: {
    flexDirection: 'row',
    borderBottomColor: colors.lightGrey,
    borderBottomWidth: 1,
  
  },
  languageOption: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15
  },
  arrowContainer: {
    width: 50,
    alignItems: 'center',
    justifyContent: 'center'
  },
  languageOptionText: {
    color: colors.primary,
    fontFamily: 'regular',
    letterSpacing: 0.3
  },
  inputContainer : {
    flexDirection: 'row',
    borderBottomColor: colors.lightGrey,
    borderBottomWidth: 1
  },
  textInput: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 15,
    fontFamily: 'regular',
    letterSpacing: 0.3,
    height:90,
    color: colors.textColor,
    textAlignVertical: 'top'

  },
  iconContainer: {
    paddingHorizontal: 10,
    justifyContent: 'center',
    alignItems: 'center'
  },
  resultContainer: {
    borderBottomColor: colors.lightGrey,
    borderBottomWidth: 1,
    flexDirection: 'row',
    height: 90,
    paddingVertical: 15
  },
  resultText: {
    fontFamily: 'regular',
    letterSpacing: 0.3,
    color: colors.primary,
    flex: 1,
    marginHorizontal: 20,

  },
  historyContainer:{
    backgroundColor: colors.greyBackground,
    flex: 1,
    padding: 10,

  }


});
