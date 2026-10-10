import { StyleSheet, Text, TouchableOpacity, View } from "react-native"
import { Entypo,Ionicons } from '@expo/vector-icons';
import colors from "../utils/colors";
import { useDispatch, useSelector } from "react-redux";
import { useCallback } from "react";
//aksiyonları import ediyoruz.
import { setSavedItems } from "../store/savedItemsSlice";
import {removeHistoryItem } from "../store/historySlice";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { formatDate } from "../utils/formatDate";

const TranslationResult = props => {
    const dispatch = useDispatch();
    const {itemId, showDelete = true} =props;

    //Redux store'dan geçmiş ve fevori listelerini alıyoruz
    const history = useSelector(state=>state.history.items) || [];
    const savedItems = useSelector(state=>state.savedItems.items) || [];

    const item = useSelector(state => {
        return state.history.items.find(item => item.id === itemId) ||
                state.savedItems.items.find(item=>item.id === itemId)

    });
    const isSaved = Array.isArray(savedItems) && savedItems.some(i=>i.id === itemId);
    const starIcon = isSaved ? "star" : "star-outlined" ;

    const starItem = useCallback(async ()=>{
        let newSavedItems;
        if (isSaved) {
            newSavedItems = savedItems.filter(i => i.id !== itemId);
        }
        else {
            newSavedItems = [...savedItems, item]
        }

        await AsyncStorage.setItem('savedItems', JSON.stringify(newSavedItems));
        dispatch(setSavedItems({items: newSavedItems}));
    }, [dispatch, savedItems, isSaved, itemId, item]);

    //Silme işlemi (geçmişten siler)
    const deleteItem = useCallback(async () => {
        //1.Redux history durumundan sil
        //HomeScreendeki useEffect bu değişimi yakalayıp AsyncStorage'ı otomatik güncelleyecektir
        dispatch(removeHistoryItem({id: itemId}));

    }, [dispatch, history, savedItems, isSaved, itemId]);

    

    // Eleman silindiğinde Redux re-render tetiklendiğinde hataya düşmemek için güvenlik kontrolü
    if(!item) return null;

    return <View style={styles.container}>
        <View style={styles.textContainer}>
            <Text 
                numberOfLines={4}
                style={styles.title}>{item.original_text}</Text>
            <Text 
                numberOfLines={4}
                style={styles.subTitle}>{item.translated_text[item.to]}</Text>
        </View>

        {/**İkonların altında tarih */}
        <View style={styles.rightSection}>
            <View style={styles.iconsRow}>
                {/**Yıldız ikonu */}
                <TouchableOpacity
                    onPress={starItem}
                    style={styles.iconContainer}>
                    <Entypo name={starIcon} size={24} color={colors.subTextColor} />
                </TouchableOpacity>

                {/* Çöp kutusu */}
                {showDelete && (
                <TouchableOpacity
                    onPress={deleteItem}
                    style={styles.iconContainer}>
                    <Ionicons name="trash-outline" size={22} color={colors.subTextColor} />

                </TouchableOpacity>
                )}
                </View>
                {/**Tarih */}
                <Text style={styles.dateText}>{formatDate(item.dateTime)}</Text>
        </View>    
        
    </View>
}
export default TranslationResult;

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 10,
        paddingVertical: 12,
        flexDirection: 'row',
        borderColor: colors.lightGrey,
        backgroundColor: 'white',
        borderBottomWidth: 0.5,
        borderTopWidth: 0,
        alignItems: 'center', // sağ ve sol tarafın yüksekliğini eşitlemek için
    },
    textContainer: {
        flex: 1,
        marginRight: 8,
        justifyContent: 'center',

    },
    title: {
        fontFamily: 'medium',
        letterSpacing: 0.3,
        color: colors.textColor,
        
    },
    subTitle: {
        fontFamily: 'regular',
        letterSpacing: 0.3,
        color: colors.subTextColor,
        fontSize: 13
    },
    rightSection: {
        flexDirection: 'column',
        alignItems: 'flex-end',
    },
    iconsRow: {
        marginTop: 6,
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 3,
    },
    iconContainer: {
        width: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    dateText: {
        fontSize: 10,
        fontFamily: 'regular',
        color: colors.primaryDisabled,
    },
})