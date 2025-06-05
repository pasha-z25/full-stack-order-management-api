import type { Lang } from '@utils/types';

import { fallbackLng } from '@i18n/utils';
import { createSlice } from '@reduxjs/toolkit';

export interface LangState {
  language: Lang | undefined | null;
}

const initialState: LangState = {
  language: fallbackLng,
};

const langSlice = createSlice({
  name: 'lang',
  initialState,
  reducers: {
    setLang: (state, action) => {
      state.language = action.payload;
    },
  },
});

export const { setLang } = langSlice.actions;

export default langSlice.reducer;

export const getLang = (state: { lang: LangState }) => state.lang.language;
