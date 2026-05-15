import { create } from "zustand";
import { persist } from "zustand/middleware";

type Step =
  | "welcome"
  | "email"
  | "verify"
  | "select-region"
  | "verification-steps"
  | "basicInfo"
  | "document"
  | "utility-bill"
  | "faceLiveness"
  | "done";

interface BasicInfo {
  firstName: string;
  lastName: string;
  country: string;
  phoneNumber: string;
}

interface BusinessInfo {
  name: string;
  // Add other business-related fields if needed
}

interface KycState {
  businessInfo: BusinessInfo;
  businessCode: string;
  step: Step;
  email: string;
  code: string;
  sessionId: string;
  basicInfo: BasicInfo;
  loading: boolean;
  user: {
    id: string | null;
    email: string | null;
    isEmailVerified: boolean;
    verificationStatus: string | null;
    country: string | null;
    phoneNumber: string | null;
    address: string | null;
    bvnId: string | null;
    isBvnVerified: boolean;
    ninId: string | null;
    isNinVerified: boolean;
    businessId: string | null;
  };
  token: string | null;
  /** URL from Services API upload (`/v1/upload/image`); sent with verify-utility-bill. */
  utilityBillImageUrl: string | null;
  setBusinessInfo: (info: Partial<BusinessInfo>) => void;
  setBusinessCode: (code: string) => void;
  setEmail: (email: string) => void;
  setCode: (code: string) => void;
  setBasicInfo: (info: Partial<BasicInfo>) => void;
  setLoading: (loading: boolean) => void;
  setUserData: (user: Partial<KycState["user"]>, token?: string) => void;
  setUtilityBillImageUrl: (url: string | null) => void;
  setSessionId: (id: string) => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: Step) => void;
  resetStore: () => void;
}

const steps: Step[] = [
  "welcome",
  "email",
  "verify",
  "select-region",
  "verification-steps",
  "basicInfo",
  "document",
  "utility-bill",
  "faceLiveness",
  "done",
];

// Define initial state to reuse for reset
const initialState = {
  businessInfo: { name: "" },
  businessCode: "",
  step: "welcome" as Step,
  email: "",
  code: "",
  sessionId: "",
  basicInfo: {
    firstName: "",
    lastName: "",
    country: "",
    phoneNumber: "",
  },
  loading: false,
  user: {
    id: null,
    email: null,
    isEmailVerified: false,
    verificationStatus: null,
    country: null,
    phoneNumber: null,
    address: null,
    bvnId: null,
    isBvnVerified: false,
    ninId: null,
    isNinVerified: false,
    businessId: null,
  },
  token: null,
  utilityBillImageUrl: null,
};

export const useKycStore = create<KycState>()(
  persist(
    (set, get) => ({
      ...initialState,
      setBusinessInfo: (info) =>
        set((state) => ({
          businessInfo: { ...state.businessInfo, ...info },
        })),
      setBusinessCode: (code) => set({ businessCode: code }),
      setEmail: (email) => set({ email }),
      setCode: (code) => set({ code }),
      setBasicInfo: (info) =>
        set((state) => ({
          basicInfo: { ...state.basicInfo, ...info },
        })),
      setLoading: (loading) => set({ loading }),
      setUserData: (user, token) =>
        set((state) => ({
          user: { ...state.user, ...user },
          token: token || state.token,
          email: user.email || state.email,
        })),
      setUtilityBillImageUrl: (url) => set({ utilityBillImageUrl: url }),
      nextStep: () => {
        const currentIndex = steps.indexOf(get().step);
        if (currentIndex < steps.length - 1) {
          set({ step: steps[currentIndex + 1] });
        }
      },
      prevStep: () => {
        const currentIndex = steps.indexOf(get().step);
        if (currentIndex > 0) {
          set({ step: steps[currentIndex - 1] });
        }
      },
      goToStep: (step) => set({ step }),
      setSessionId: (id) => set({ sessionId: id }),
      resetStore: () => set(initialState),
    }),
    {
      name: "kyc-storage",
      partialize: (state) => ({
        businessInfo: state.businessInfo,
        businessCode: state.businessCode,
        step: state.step,
        email: state.email,
        basicInfo: state.basicInfo,
        user: state.user,
        token: state.token,
        utilityBillImageUrl: state.utilityBillImageUrl,
      }),
    }
  )
);
