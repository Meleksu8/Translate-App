
import {  StyleSheet, Text,TextInput, TouchableOpacity, View } from 'react-native';
import colors from '../utils/colors';
import {AntDesign, Ionicons, MaterialIcons} from '@expo/vector-icons';
import { useEffect, useState, useCallback } from 'react';
import supportedLanguages from '../utils/supportedLanguages';
import { translate } from '../utils/translate';
import { ActivityIndicator } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { useDispatch, useSelector } from 'react-redux';
import { addHistoryItem, setHistoryItems } from '../store/historySlice';
import TranslationResult from '../components/TranslationResult';
import uuid from 'react-native-uuid';
import { FlatList } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setSavedItems } from '../store/savedItemsSlice';


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
  const dispatch = useDispatch();
  const history = useSelector(state => state.history.items);
  const [enteredText, setEnteredText] = useState("");
  const [resultText, setResultText] = useState("");
  const [languageTo, setLanguageTo] = useState("tr");
  const [languageFrom, setLanguageFrom] = useState("en");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(()=>{
    dispatch(loadData());
  }, [dispatch]);


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
      
    } catch (error) {
      console.log(error);
    }
    finally {
      setIsLoading(false);
    }
    
  }, [enteredText, languageTo, languageFrom, dispatch])

  const copyToClipboard = useCallback(async ()=>{
     await Clipboard.setStringAsync(resultText);
  }, [resultText]);

  return (

    <View style={styles.container}>
      <View style={styles.languageContainer}>
        <TouchableOpacity
          style={styles.languageOption}
          onPress={()=> props.navigation.navigate("languageSelect", {title: "Translate from", selected: languageFrom, onSelect: (lang)=>setLanguageFrom(lang)})}>
          <Text style={styles.languageOptionText}>{supportedLanguages[languageFrom]}</Text>
        </TouchableOpacity>

        <View style={styles.arrowContainer}>
          <AntDesign name="arrow-right" size={24} color={colors.lightGrey} />
        </View>

        <TouchableOpacity
          style={styles.languageOption}
          onPress={()=> props.navigation.navigate("languageSelect", {title: "Translate to", selected: languageTo, onSelect: (lang)=> setLanguageTo(lang)})}>
          <Text style={styles.languageOptionText}>{supportedLanguages[languageTo]}</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.inputContainer}>
        <TextInput 
          multiline
          placeholder='Enter text'
          style={styles.textInput}
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
