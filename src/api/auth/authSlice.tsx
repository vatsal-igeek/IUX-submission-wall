import { createSlice } from "@reduxjs/toolkit";

interface AuthStateType {
  accessToken: null | string;
  dob: any | null;
  captchaValue: string | null;
}

const initialState: AuthStateType = {
  accessToken: null,
  dob: null,
  captchaValue: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAccessToken: (state, action) => {
      state.accessToken = action.payload;
    },
    logout: (state) => {
      state.accessToken = null;
    },
    setDob: (state, action) => {
      // Convert Date object to ISO string if it's a Date, otherwise store as is
      if (action.payload instanceof Date) {
        state.dob = action.payload.toISOString();
      } else {
        state.dob = action.payload;
      }
    },
    setCaptchaValue: (state, action) => {
      state.captchaValue = action.payload;
    },
  },
});

export const { setAccessToken, logout, setDob, setCaptchaValue } = authSlice.actions;
export default authSlice.reducer;
