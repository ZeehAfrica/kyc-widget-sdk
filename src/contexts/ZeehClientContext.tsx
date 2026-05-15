import {
  createContext,
  useContext,
  type ReactNode,
} from "react";
import type { ZeehClient } from "@/client/createZeehClient";

const ZeehClientContext = createContext<ZeehClient | null>(null);

export function ZeehClientProvider({
  client,
  children,
}: {
  client: ZeehClient;
  children: ReactNode;
}) {
  return (
    <ZeehClientContext.Provider value={client}>
      {children}
    </ZeehClientContext.Provider>
  );
}

export function useZeehClient(): ZeehClient {
  const client = useContext(ZeehClientContext);
  if (!client) {
    throw new Error("useZeehClient must be used within ZeehClientProvider");
  }
  return client;
}
