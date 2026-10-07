import type { PropsWithChildren } from "react";

import { BottomSheetBase, type BottomSheetProps } from "./BottomSheetBase";

export function BottomSheet(props: PropsWithChildren<BottomSheetProps>) {
  return <BottomSheetBase {...props} bottomInset={0} />;
}
