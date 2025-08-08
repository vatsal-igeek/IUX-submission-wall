import { createSlice } from "@reduxjs/toolkit";

interface AuthStateType {
  accessToken: null | string;
  dob: Date | null;
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
      state.dob = action.payload;
    },
    setCaptchaValue: (state, action) => {
      state.captchaValue = action.payload;
    },
  },
});

export const { setAccessToken, logout, setDob, setCaptchaValue } = authSlice.actions;
export default authSlice.reducer;
