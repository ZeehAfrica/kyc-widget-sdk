import { create } from "zustand";

export type IdentityStep =
  | "loading"
  | "select-country"
  | "select-id"
  | "enter-id"
  | "liveness"
  | "done"
  | "error";

interface IdentityState {
  sessionToken: string | null;
  countryCode: string | null;
  idCode: string | null;
  idNumber: string;
  imageUrl: string | null;
  step: IdentityStep;
  error: string | null;
  verified: boolean | null;
  setSessionToken: (token: string | null) => void;
  setCountryCode: (code: string | null) => void;
  setIdCode: (code: string | null) => void;
  setIdNumber: (num: string) => void;
  setImageUrl: (url: string | null) => void;
  setStep: (step: IdentityStep) => void;
  setError: (error: string | null) => void;
  setVerified: (v: boolean | null) => void;
  reset: () => void;
}

const initialState = {
  sessionToken: null,
  countryCode: null,
  idCode: null,
  idNumber: "",
  imageUrl: null,
  step: "loading" as IdentityStep,
  error: null,
  verified: null,
};

export const useIdentityStore = create<IdentityState>()((set) => ({
  ...initialState,
  setSessionToken: (token) => set({ sessionToken: token }),
  setCountryCode: (code) => set({ countryCode: code }),
  setIdCode: (code) => set({ idCode: code }),
  setIdNumber: (num) => set({ idNumber: num }),
  setImageUrl: (url) => set({ imageUrl: url }),
  setStep: (step) => set({ step }),
  setError: (error) => set({ error }),
  setVerified: (verified) => set({ verified }),
  reset: () => set(initialState),
}));
