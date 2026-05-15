import { createContext, useContext, type ReactNode } from "react";

export type WidgetRuntimeConfig = {
  businessId: string;
};

const WidgetRuntimeConfigContext = createContext<WidgetRuntimeConfig | null>(
  null,
);

export function WidgetRuntimeConfigProvider({
  value,
  children,
}: {
  value: WidgetRuntimeConfig;
  children: ReactNode;
}) {
  return (
    <WidgetRuntimeConfigContext.Provider value={value}>
      {children}
    </WidgetRuntimeConfigContext.Provider>
  );
}

export function useWidgetRuntimeConfig(): WidgetRuntimeConfig {
  const ctx = useContext(WidgetRuntimeConfigContext);
  if (!ctx) {
    throw new Error(
      "useWidgetRuntimeConfig must be used within WidgetRuntimeConfigProvider",
    );
  }
  return ctx;
}
