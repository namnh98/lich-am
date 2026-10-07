import type { AppScreen } from "@lich-am/ui";
import { useEffect, useState } from "react";
import { Linking } from "react-native";

interface MobileNavigationRequest {
  id: number;
  screen: AppScreen;
}

const SETTINGS_WIDGET_URL = "licham://settings/widget";

export function useMobileNavigation(): MobileNavigationRequest {
  const [request, setRequest] = useState<MobileNavigationRequest>({
    id: 0,
    screen: "calendar",
  });

  useEffect(() => {
    let mounted = true;
    const handleUrl = (url: string | null) => {
      if (!mounted || !url?.startsWith(SETTINGS_WIDGET_URL)) return;
      setRequest((current) => ({ id: current.id + 1, screen: "settings" }));
    };

    void Linking.getInitialURL().then(handleUrl);
    const subscription = Linking.addEventListener("url", ({ url }) => handleUrl(url));
    return () => {
      mounted = false;
      subscription.remove();
    };
  }, []);

  return request;
}
