import { createSlice } from "@reduxjs/toolkit";

const savedItemsSlice = createSlice({
    name: 'savedItems',
    initialState: {
        items: []
    },
    reducers: {
        setSavedItems: (state, action) => {
            state.items = action.payload.items || [];
        },

        //favorilerden silme reducer'ı
        removeSavedItem: (state, action) => {
            const {id} = action.payload;
            state.items = state.items.filter(item => item.id !== id);
        }
    }
});

export const { setSavedItems, removeSavedItem } = savedItemsSlice.actions;
export default savedItemsSlice.reducer;