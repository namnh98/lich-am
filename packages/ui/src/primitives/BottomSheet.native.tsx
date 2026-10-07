import type { PropsWithChildren } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { BottomSheetBase, type BottomSheetProps } from "./BottomSheetBase";

export function BottomSheet(props: PropsWithChildren<BottomSheetProps>) {
  const { bottom } = useSafeAreaInsets();
  return <BottomSheetBase {...props} bottomInset={bottom} />;
}
