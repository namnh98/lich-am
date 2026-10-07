import { useEffect, useState } from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";

import { ActionButton } from "../primitives/ActionButton";
import { AppText } from "../primitives/AppText";
import { useTheme } from "../theme";
import { SettingCard } from "./SettingCard";
import type { AuthService, AuthUser } from "./types";

export function AuthSettingsCard({ authService }: { authService?: AuthService }) {
  const { colors } = useTheme();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [mode, setMode] = useState<"login" | "register" | "forgot">("login");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "error" | "success" } | null>(null);

  useEffect(() => {
    if (!authService) return;
    return authService.subscribe(setUser);
  }, [authService]);

  const submit = async () => {
    if (!authService) return;
    const cleanEmail = email.trim();

    if (!cleanEmail) {
      setMessage({ text: "Vui lòng nhập địa chỉ email.", type: "error" });
      return;
    }

    if (mode === "forgot") {
      setPending(true);
      setMessage(null);
      try {
        if (authService.resetPassword) {
          await authService.resetPassword(cleanEmail);
          setMessage({
            text: "Đã gửi email đặt lại mật khẩu. Vui lòng kiểm tra hộp thư của bạn.",
            type: "success",
          });
        } else {
          setMessage({
            text: "Chức năng đặt lại mật khẩu chưa sẵn sàng.",
            type: "error",
          });
        }
      } catch (error) {
        setMessage({ text: authErrorMessage(error), type: "error" });
      } finally {
        setPending(false);
      }
      return;
    }

    if (!password) {
      setMessage({ text: "Vui lòng nhập mật khẩu.", type: "error" });
      return;
    }

    if (mode === "register" && password.length < 6) {
      setMessage({ text: "Mật khẩu cần tối thiểu 6 ký tự.", type: "error" });
      return;
    }

    setPending(true);
    setMessage(null);
    try {
      if (mode === "register") {
        await authService.createAccount(cleanEmail, password);
        setMessage({ text: "Tạo tài khoản thành công!", type: "success" });
      } else {
        await authService.signIn(cleanEmail, password);
      }
      setPassword("");
    } catch (error) {
      setMessage({ text: authErrorMessage(error), type: "error" });
    } finally {
      setPending(false);
    }
  };

  const handleSignOut = async () => {
    if (!authService) return;
    setPending(true);
    setMessage(null);
    try {
      await authService.signOut();
      setMessage({ text: "Đã đăng xuất tài khoản.", type: "success" });
    } catch (error) {
      setMessage({ text: authErrorMessage(error), type: "error" });
    } finally {
      setPending(false);
    }
  };

  return (
    <SettingCard
      description="Đồng bộ dữ liệu lịch và sự kiện an toàn qua Firebase Authentication."
      title="Tài khoản Firebase"
    >
      {!authService ? (
        <View style={[styles.cardBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <AppText style={{ color: colors.accent, fontWeight: "600" }}>
            Firebase chưa được kích hoạt cấu hình
          </AppText>
          <AppText tone="muted" variant="caption">
            Để kết nối Firebase, hãy cấu hình các biến môi trường trong file .env hoặc gắn file cấu hình Firebase (google-services.json cho Android, VITE_FIREBASE_* cho Desktop).
          </AppText>
        </View>
      ) : user ? (
        <View style={[styles.cardBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.userRow}>
            <View style={[styles.avatar, { backgroundColor: colors.accent }]}>
              <AppText style={styles.avatarText}>
                {(user.displayName || user.email || "U").charAt(0).toUpperCase()}
              </AppText>
            </View>
            <View style={styles.userInfo}>
              <View style={styles.statusRow}>
                <View style={styles.onlineDot} />
                <AppText style={{ fontSize: 12, color: "#2E7D32", fontWeight: "600" }}>
                  Đã kết nối Firebase
                </AppText>
              </View>
              <AppText style={{ fontWeight: "600", fontSize: 15 }}>
                {user.displayName || user.email}
              </AppText>
              {user.displayName && user.email ? (
                <AppText tone="muted" variant="caption">
                  {user.email}
                </AppText>
              ) : null}
            </View>
          </View>
          <ActionButton
            disabled={pending}
            label={pending ? "Đang xử lý…" : "Đăng xuất tài khoản"}
            onPress={() => void handleSignOut()}
          />
        </View>
      ) : (
        <View style={[styles.cardBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {/* Segmented Mode Selector */}
          <View style={[styles.tabs, { backgroundColor: colors.border }]}>
            <Pressable
              accessibilityRole="tab"
              accessibilityState={{ selected: mode === "login" }}
              onPress={() => {
                setMode("login");
                setMessage(null);
              }}
              style={[
                styles.tab,
                mode === "login" && [styles.activeTab, { backgroundColor: colors.surface }],
              ]}
            >
              <AppText
                style={{
                  fontWeight: mode === "login" ? "700" : "500",
                  color: mode === "login" ? colors.accent : colors.muted,
                  fontSize: 13,
                }}
              >
                Đăng nhập
              </AppText>
            </Pressable>
            <Pressable
              accessibilityRole="tab"
              accessibilityState={{ selected: mode === "register" }}
              onPress={() => {
                setMode("register");
                setMessage(null);
              }}
              style={[
                styles.tab,
                mode === "register" && [styles.activeTab, { backgroundColor: colors.surface }],
              ]}
            >
              <AppText
                style={{
                  fontWeight: mode === "register" ? "700" : "500",
                  color: mode === "register" ? colors.accent : colors.muted,
                  fontSize: 13,
                }}
              >
                Tạo tài khoản
              </AppText>
            </Pressable>
          </View>

          {/* Email input */}
          <TextInput
            accessibilityLabel="Email đăng nhập"
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            onChangeText={setEmail}
            placeholder="Địa chỉ email"
            placeholderTextColor={colors.muted}
            style={[
              styles.input,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                color: colors.text,
              },
            ]}
            value={email}
          />

          {/* Password input (hidden during forgot mode) */}
          {mode !== "forgot" ? (
            <View style={styles.passwordContainer}>
              <TextInput
                accessibilityLabel="Mật khẩu"
                autoCapitalize="none"
                autoComplete={mode === "register" ? "new-password" : "current-password"}
                onChangeText={setPassword}
                placeholder="Mật khẩu (tối thiểu 6 ký tự)"
                placeholderTextColor={colors.muted}
                secureTextEntry={!showPassword}
                style={[
                  styles.input,
                  styles.passwordInput,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    color: colors.text,
                  },
                ]}
                value={password}
              />
              <Pressable
                accessibilityLabel={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                onPress={() => setShowPassword((prev) => !prev)}
                style={styles.eyeButton}
              >
                <AppText style={{ fontSize: 11, color: colors.muted, fontWeight: "600" }}>
                  {showPassword ? "Ẩn" : "Hiện"}
                </AppText>
              </Pressable>
            </View>
          ) : null}

          {/* Forgot password link */}
          <View style={styles.linkRow}>
            {mode === "login" ? (
              <Pressable
                onPress={() => {
                  setMode("forgot");
                  setMessage(null);
                }}
              >
                <AppText style={{ color: colors.accent, fontSize: 12, fontWeight: "600" }}>
                  Quên mật khẩu?
                </AppText>
              </Pressable>
            ) : mode === "forgot" ? (
              <Pressable
                onPress={() => {
                  setMode("login");
                  setMessage(null);
                }}
              >
                <AppText style={{ color: colors.accent, fontSize: 12, fontWeight: "600" }}>
                  Quay lại đăng nhập
                </AppText>
              </Pressable>
            ) : null}
          </View>

          {/* Action button */}
          <ActionButton
            disabled={pending}
            label={
              pending
                ? "Đang xử lý…"
                : mode === "register"
                  ? "Đăng ký tài khoản mới"
                  : mode === "forgot"
                    ? "Gửi link đặt lại mật khẩu"
                    : "Đăng nhập"
            }
            onPress={() => void submit()}
          />
        </View>
      )}

      {/* Message feedback */}
      {message ? (
        <View
          accessibilityRole="alert"
          style={[
            styles.messageBanner,
            {
              backgroundColor: message.type === "success" ? "#E8F5E9" : "#FFEBEE",
              borderColor: message.type === "success" ? "#C8E6C9" : "#FFCDD2",
            },
          ]}
        >
          <AppText
            style={{
              color: message.type === "success" ? "#2E7D32" : colors.accent,
              fontSize: 13,
              fontWeight: "500",
            }}
          >
            {message.text}
          </AppText>
        </View>
      ) : null}
    </SettingCard>
  );
}

function authErrorMessage(error: unknown): string {
  const code =
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof error.code === "string"
      ? error.code
      : "";

  switch (code) {
    case "auth/email-already-in-use":
      return "Email này đã được sử dụng. Vui lòng đăng nhập.";
    case "auth/invalid-email":
      return "Địa chỉ email không đúng định dạng.";
    case "auth/invalid-credential":
    case "auth/user-not-found":
    case "auth/wrong-password":
      return "Email hoặc mật khẩu chưa chính xác.";
    case "auth/weak-password":
      return "Mật khẩu quá yếu. Vui lòng đặt ít nhất 6 ký tự.";
    case "auth/too-many-requests":
      return "Bạn đã thử quá số lần cho phép. Hãy đợi giây lát rồi thử lại.";
    case "auth/network-request-failed":
      return "Lỗi kết nối mạng. Vui lòng kiểm tra internet.";
    case "auth/operation-not-allowed":
      return "Phương thức Email/Password chưa được bật trong Firebase Console.";
    default:
      return code
        ? `Thao tác thất bại (${code}). Vui lòng thử lại.`
        : "Xác thực thất bại. Vui lòng thử lại.";
  }
}

const styles = StyleSheet.create({
  cardBox: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    gap: 10,
  },
  tabs: {
    flexDirection: "row",
    borderRadius: 10,
    padding: 3,
    marginBottom: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 7,
    alignItems: "center",
    borderRadius: 7,
  },
  activeTab: {
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  input: {
    borderRadius: 10,
    borderWidth: 1,
    fontSize: 14,
    minHeight: 44,
    paddingHorizontal: 12,
  },
  passwordContainer: {
    position: "relative",
    justifyContent: "center",
  },
  passwordInput: {
    paddingRight: 48,
  },
  eyeButton: {
    position: "absolute",
    right: 12,
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  linkRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },
  userInfo: {
    flex: 1,
    gap: 2,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  onlineDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#2E7D32",
  },
  messageBanner: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 10,
    marginTop: 4,
  },
});
