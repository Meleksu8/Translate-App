import { createSlice } from "@reduxjs/toolkit";

//createSlice arka planda Immer.js kütüphanesini kullanır. 
// koda doğrudan diziyi değiştirir (push, splice,filter) veya 
// state.items = [] gibi atamalar yapacak şekilde yazarsınız; 
// Immer bu değişiklikleri yakalr ve sizin yerinize arkada 
// durumun kopyasını oluşturarak değişmezlik kuralına uygun şekilde 
// Reduxa teslim eder.
const historySlice = createSlice({
    name: 'history',
    initialState: {
        items: []
    },
    reducers: {
        addHistoryItem: (state, action) => {
            const {item} = action.payload;
            if (item) {
                // 1. Eğer bu kelime/metin daha önce geçmişte varsa, eskisini listeden çıkaralım
                //eşit olmayanları tutmak, eşit olanları atmak
                state.items = state.items.filter(
                    existingItem => existingItem.original_text.toLowerCase() !== item.original_text.toLowerCase()
                );
                // 2. Yeni yapılan çeviriyi en sona (slice.reverse zaten en üste getirecek) ekleyelim
                state.items.push(item);
            }
        },
        setHistoryItems: (state, action) => {
            state.items = action.payload.items;
        },
        removeHistoryItem: (state, action)=>{
            const {id} = action.payload;
            state.items = state.items.filter(item=>item.id !== id);
        },
        clearHistory: (state) => {
            state.items = []
        }
    }
});

//dışarı aktarmak
export const { addHistoryItem, setHistoryItems, removeHistoryItem, clearHistory } = historySlice.actions;
export default historySlice.reducer;