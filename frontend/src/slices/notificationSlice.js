import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  inscriptionCount: 0,
};

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    setInscriptionCount: (state, action) => {
      state.inscriptionCount = action.payload;
    },
    decrementInscriptionCount: (state) => {
      if (state.inscriptionCount > 0) state.inscriptionCount -= 1;
    },
    // You could add other actions as needed
  },
});

export const { setInscriptionCount, decrementInscriptionCount } = notificationsSlice.actions;
export default notificationsSlice.reducer;