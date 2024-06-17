import { createSlice } from '@reduxjs/toolkit';

const loadState = () => {
    try {
        const serializedState = localStorage.getItem('recentLists');
        if (serializedState === null) {
            return [];
        }
        return JSON.parse(serializedState);
    } catch (err) {
        return [];
    }
};

const saveState = (state) => {
    try {
        const serializedState = JSON.stringify(state);
        localStorage.setItem('recentLists', serializedState);
    } catch (err) {
        // Ignore write errors.
    }
};

const recentListsSlice = createSlice({
    name: 'recentLists',
    initialState: loadState(),
    reducers: {
        addRecentList(state, action) {
            const newListId = action.payload;
            const index = state.indexOf(newListId);
            if (index !== -1) {
                state.splice(index, 1); // Remove se já estiver na lista
            }
            state.unshift(newListId); // Adiciona no início
            if (state.length > 3) {
                state.pop(); // Remove o último se a lista tiver mais de 3 itens
            }
            saveState(state); // Save state to localStorage
        }
    }
});

export const { addRecentList } = recentListsSlice.actions;
export default recentListsSlice.reducer;
