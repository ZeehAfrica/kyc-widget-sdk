import { isDevEnvironment } from "@/lib/env";
import type { BasicInfo } from "@/types/app";
import axios, { AxiosHeaders, type AxiosInstance } from "axios";

const PROD_URL = `https://main-api.usezeeh.com/api/v1`;
const DEV_URL = `https://dev.main-api.usezeeh.com/api/v1`;

export type ZeehEnvironment = "production" | "sandbox" | "auto";

export interface ZeehClientConfig {
  environment: ZeehEnvironment;
  /** Full main API base URL including `/api/v1` when applicable. */
  mainApiBaseUrl?: string;
  /** Services API origin only (no `/api/v1` suffix). */
  servicesApiOrigin?: string;
  getAccessToken: () => string | null | Promise<string | null>;
}

export interface IdentitySessionData {
  countryCode?: string;
  idCode?: string;
  callbackUrl: string;
  metadata?: Record<string, unknown>;
  status: string;
  expiresAt: string;
  idCodesByCountry: Record<
    string,
    Array<{ code: string; label: string; hasFaceVerification: boolean }>
  >;
}

function resolveMainApiBase(config: ZeehClientConfig): string {
  if (config.mainApiBaseUrl?.trim()) {
    return config.mainApiBaseUrl.replace(/\/$/, "");
  }
  if (config.environment === "production") return PROD_URL;
  if (config.environment === "sandbox") return DEV_URL;
  return isDevEnvironment() ? DEV_URL : PROD_URL;
}

function resolveServicesOrigin(config: ZeehClientConfig): string {
  const fromEnv = import.meta.env?.VITE_ZEEH_SERVICES_API_ORIGIN;
  const url =
    config.servicesApiOrigin?.trim() ||
    (typeof fromEnv === "string" && fromEnv.trim()) ||
    (isDevEnvironment()
      ? "https://staging.api.usezeeh.com"
      : "https://api.usezeeh.com");
  return url.replace(/\/$/, "").replace(/\/api\/v1$/, "");
}

const IDENTITY_LIVENESS_PATH = "/v1/liveness-check/liveness-session/";

export function createZeehClient(config: ZeehClientConfig) {
  const baseURL = resolveMainApiBase(config);

  const api: AxiosInstance = axios.create({
    baseURL,
    headers: { "Content-Type": "application/json" },
  });

  api.interceptors.request.use(
    async (reqConfig) => {
      const token = await Promise.resolve(config.getAccessToken());
      const headers =
        reqConfig.headers instanceof AxiosHeaders
          ? reqConfig.headers
          : new AxiosHeaders(reqConfig.headers);
      if (token) headers.set("Authorization", `Bearer ${token}`);
      else headers.delete("Authorization");
      reqConfig.headers = headers;
      return reqConfig;
    },
    (e) => Promise.reject(e),
  );

  const authHeaders = async () => {
    const token = await Promise.resolve(config.getAccessToken());
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  return {
    getMainApiBaseUrl: () => baseURL,
    getServicesApiOrigin: () => resolveServicesOrigin(config),

    getBusiness: async (businessId: string) => {
      const { data } = await api.get(`/businesses/${businessId}/name`);
      return data;
    },

    registerUserEmail: async (email: string, businessId: string) => {
      const { data } = await api.post(`/kyc-widget/verification`, {
        email,
        businessId,
      });
      return data;
    },

    verifyEmail: async (
      businessId: string,
      email: string,
      otpCode: string,
    ) => {
      const { data } = await api.post(`/kyc-widget/verification/verify-email`, {
        businessId,
        email,
        otpCode: String(otpCode),
        userCanAutoLinkToBusiness: true,
      });
      return data;
    },

    resendOtp: async (businessId: string, email: string) => {
      const { data } = await api.post(`/kyc-widget/verification/resend-otp`, {
        businessId,
        email,
      });
      return data;
    },

    submitBasicInfo: async (payload: BasicInfo) => {
      const { data } = await api.patch(`/kyc-widget/verification`, payload);
      return data;
    },

    submitUseNIN_BVN: async (nin: string, bvn: string) => {
      const { data } = await api.patch("/kyc-widget/verification/kyc-info", {
        bvnId: bvn,
        ninId: nin,
      });
      return data;
    },

    getLivenessSession: async () => {
      const { data } = await api.get("/kyc-widget/verification/liveness-check");
      return data;
    },

    uploadLivenessSnapshot: async (file: File, sessionId: string) => {
      const formData = new FormData();
      formData.append("image", file);
      formData.append("body", JSON.stringify({ sessionId }));
      const { data } = await axios.post(
        `${baseURL}/kyc-widget/verification/liveness-check/image`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            ...(await authHeaders()),
          },
        },
      );
      return data;
    },

    uploadDocument: async (file: File, endpoint: string) => {
      const formData = new FormData();
      formData.append("image", file);
      formData.append("file", file);
      const { data } = await axios.post(
        `${baseURL}/kyc-widget/verification/${endpoint}`,
        formData,
        { headers: await authHeaders() },
      );
      return data;
    },

    uploadUtilityBillToServicesApi: async (file: File) => {
      const origin = resolveServicesOrigin(config);
      const formData = new FormData();
      formData.append("file", file);
      const path =
        file.type === "application/pdf"
          ? "/v1/upload/file"
          : "/v1/upload/image";
      const token = await Promise.resolve(config.getAccessToken());
      const { data } = await axios.post(`${origin}${path}`, formData, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      const url = data?.data?.url as string | undefined;
      if (typeof url !== "string" || !url.trim()) {
        throw new Error("Upload did not return a file URL");
      }
      return url;
    },

    verifyNIN: async (sessionId: string) => {
      const { data } = await api.post(`/kyc-widget/verification/verify-nin`, {
        sessionId,
      });
      return data;
    },

    verifyBVN: async (sessionId: string) => {
      const { data } = await api.post(`/kyc-widget/verification/verify-bvn`, {
        sessionId,
      });
      return data;
    },

    verifyBasicInfo: async (sessionId: string) => {
      const { data } = await api.post(
        `/kyc-widget/verification/verify-basic-info`,
        { sessionId },
      );
      return data;
    },

    verifyPassport: async (sessionId: string) => {
      const { data } = await api.post(
        `/kyc-widget/verification/verify-passport`,
        { sessionId },
      );
      return data;
    },

    verifyUtilityBill: async (
      sessionId: string,
      utilityBillImageUrl: string,
    ) => {
      const { data } = await api.post(
        `/kyc-widget/verification/verify-utility-bill`,
        { sessionId, utilityBillImageUrl },
      );
      return data;
    },

    getCompleteVerification: async () => {
      const { data } = await api.get(`/kyc-widget/verification/complete`);
      return data;
    },

    getIdentityLivenessSession: async (token: string) => {
      const base = resolveServicesOrigin(config);
      const { data } = await axios.get<IdentitySessionData>(
        `${base}${IDENTITY_LIVENESS_PATH}${token}`,
      );
      return data;
    },

    startIdentityLiveness: async (token: string) => {
      const base = resolveServicesOrigin(config);
      const { data } = await axios.post<{ sessionId: string }>(
        `${base}${IDENTITY_LIVENESS_PATH}${token}/start`,
      );
      return data;
    },

    uploadIdentityLivenessSnapshot: async (token: string, file: File) => {
      const formData = new FormData();
      formData.append("image", file);
      const base = resolveServicesOrigin(config);
      const { data } = await axios({
        method: "post",
        url: `${base}${IDENTITY_LIVENESS_PATH}${token}/upload`,
        data: formData,
        headers: { "Content-Type": "multipart/form-data" },
      });
      return data;
    },

    submitIdentityVerification: async (
      token: string,
      payload: {
        countryCode: string;
        idCode: string;
        idNumber: string;
        imageUrl?: string;
      },
    ) => {
      const base = resolveServicesOrigin(config);
      const { data } = await axios.post(
        `${base}${IDENTITY_LIVENESS_PATH}${token}/verify`,
        payload,
        { headers: { "Content-Type": "application/json" } },
      );
      return data;
    },
  };
}

export type ZeehClient = ReturnType<typeof createZeehClient>;
