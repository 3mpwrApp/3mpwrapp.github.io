import { useColorScheme as _useColorScheme } from "react-native";
export type Scheme = "light" | "dark";
export default function useColorScheme(): Scheme {
  const scheme = _useColorScheme();
  return (scheme === "dark" ? "dark" : "light") as Scheme;
}
