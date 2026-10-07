import { useEffect, useRef } from "react";
import { Animated } from "react-native";

const INITIAL_OFFSET = 520;

export function useBottomSheetAnimation(visible: boolean) {
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(INITIAL_OFFSET)).current;

  useEffect(() => {
    if (!visible) {
      backdropOpacity.setValue(0);
      translateY.setValue(INITIAL_OFFSET);
      return;
    }

    Animated.parallel([
      Animated.timing(backdropOpacity, {
        duration: 180,
        toValue: 1,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        damping: 24,
        mass: 0.9,
        stiffness: 240,
        toValue: 0,
        useNativeDriver: true,
      }),
    ]).start();
  }, [backdropOpacity, translateY, visible]);

  return { backdropOpacity, translateY };
}
