export function isDevEnvironment(): boolean {
  if (typeof window === "undefined") return false;

  const host = window.location.hostname;
  const url = window.location.href;

  return (
    host === "localhost" ||
    host === "127.0.0.1" ||
    host === "" ||
    url.includes("sandbox") ||
    url.includes("dev")
  );
}
