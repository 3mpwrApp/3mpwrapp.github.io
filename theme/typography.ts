import React from "react";

import { useSettings } from "../store/settings";

export function useTextScale() {
  const { textScale } = useSettings();
  const factor =
    textScale === "xlarge" ? 1.3 : textScale === "large" ? 1.15 : 1.0;
  return React.useMemo(
    () => ({ factor, scale: (n: number) => Math.round(n * factor) }),
    [factor],
  );
}
