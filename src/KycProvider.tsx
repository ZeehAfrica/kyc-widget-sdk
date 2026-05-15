import { useMemo, useRef, type ReactNode } from "react";
import {
  createZeehClient,
  type ZeehClientConfig,
} from "@/client/createZeehClient";
import { ZeehClientProvider } from "@/contexts/ZeehClientContext";

export type KycProviderProps = {
  children: ReactNode;
} & ZeehClientConfig;

export function KycProvider({
  children,
  environment,
  mainApiBaseUrl,
  servicesApiOrigin,
  getAccessToken,
}: KycProviderProps) {
  const getterRef = useRef(getAccessToken);
  getterRef.current = getAccessToken;

  const client = useMemo(
    () =>
      createZeehClient({
        environment,
        mainApiBaseUrl,
        servicesApiOrigin,
        getAccessToken: () => getterRef.current(),
      }),
    [environment, mainApiBaseUrl, servicesApiOrigin],
  );

  return (
    <ZeehClientProvider client={client}>{children}</ZeehClientProvider>
  );
}
