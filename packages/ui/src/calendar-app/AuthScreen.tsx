import { useState } from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";

import { ActionButton } from "../primitives/ActionButton";
import { AppText } from "../primitives/AppText";
import { theme, useTheme } from "../theme";
import type { AuthService } from "./types";

interface AuthScreenProps {
  authService?: AuthService;
  onSuccess: () => void;
  onCancel?: () => void;
}

export function AuthScreen({ authService, onSuccess, onCancel }: AuthScreenProps) {
  const { colors } = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [mode, setMode] = useState<"login" | "register" | "forgot">("login");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "error" | "success" } | null>(null);

  const handleSubmit = async () => {
    if (!authService) return;
    const cleanEmail = email.trim().replace(/[,;\s]+$/, "");

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
            text: "Đã gửi link đặt lại mật khẩu về email của bạn. Vui lòng kiểm tra hộp thư.",
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
      } else {
        await authService.signIn(cleanEmail, password);
      }
      setPassword("");
      // Đăng nhập / đăng ký thành công -> chuyển sang màn hình lịch
      onSuccess();
    } catch (error) {
      setMessage({ text: authErrorMessage(error), type: "error" });
    } finally {
      setPending(false);
    }
  };

  const handleAnonymousSignIn = async () => {
    if (!authService?.signInAnonymously) {
      setMessage({
        text: "Chức năng đăng nhập ẩn danh chưa sẵn sàng.",
        type: "error",
      });
      return;
    }
    setPending(true);
    setMessage(null);
    try {
      await authService.signInAnonymously();
      onSuccess();
    } catch (error) {
      setMessage({ text: authErrorMessage(error), type: "error" });
    } finally {
      setPending(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        {/* Header Hero */}
        <View style={styles.heroSection}>
          <View style={[styles.logoBadge, { backgroundColor: colors.accent }]}>
            <AppText style={styles.logoBadgeText}>ÂM</AppText>
          </View>
          <AppText style={styles.title}>
            {mode === "register"
              ? "Tạo tài khoản Lịch Việt"
              : mode === "forgot"
                ? "Khôi phục mật khẩu"
                : "Đăng nhập Lịch Việt"}
          </AppText>
          <AppText style={styles.subtitle} tone="muted">
            {mode === "forgot"
              ? "Nhập email đã đăng ký để nhận liên kết đặt lại mật khẩu."
              : "Đồng bộ dữ liệu lịch âm dương và ghi chú trên tất cả thiết bị của bạn."}
          </AppText>
        </View>

        {!authService ? (
          <View style={[styles.noticeBox, { backgroundColor: "#FFF3E0", borderColor: "#FFE0B2" }]}>
            <AppText style={{ color: "#E65100", fontWeight: "600", fontSize: 13 }}>
              Firebase chưa được cấu hình
            </AppText>
            <AppText tone="muted" variant="caption">
              Vui lòng kiểm tra cấu hình biến môi trường Firebase (API Key, App ID, Project ID) để sử dụng tính năng đăng nhập.
            </AppText>
          </View>
        ) : (
          <>
            {/* Segmented Mode Selector */}
            {mode !== "forgot" ? (
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
                      fontSize: 14,
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
                      fontSize: 14,
                    }}
                  >
                    Đăng ký mới
                  </AppText>
                </Pressable>
              </View>
            ) : null}

            {/* Email Input */}
            <View style={styles.inputGroup}>
              <AppText style={styles.inputLabel}>Địa chỉ Email</AppText>
              <TextInput
                accessibilityLabel="Email đăng nhập"
                autoCapitalize="none"
                autoComplete="email"
                keyboardType="email-address"
                onChangeText={setEmail}
                placeholder="name@example.com"
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
            </View>

            {/* Password Input (Hidden in forgot mode) */}
            {mode !== "forgot" ? (
              <View style={styles.inputGroup}>
                <View style={styles.inputHeaderRow}>
                  <AppText style={styles.inputLabel}>Mật khẩu</AppText>
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
                  ) : null}
                </View>
                <View style={styles.passwordContainer}>
                  <TextInput
                    accessibilityLabel="Mật khẩu"
                    autoCapitalize="none"
                    autoComplete={mode === "register" ? "new-password" : "current-password"}
                    onChangeText={setPassword}
                    placeholder="Tối thiểu 6 ký tự"
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
                    <AppText style={{ fontSize: 12, color: colors.muted, fontWeight: "600" }}>
                      {showPassword ? "Ẩn" : "Hiện"}
                    </AppText>
                  </Pressable>
                </View>
              </View>
            ) : (
              <Pressable
                onPress={() => {
                  setMode("login");
                  setMessage(null);
                }}
                style={styles.backToLoginRow}
              >
                <AppText style={{ color: colors.accent, fontSize: 13, fontWeight: "600" }}>
                  ‹ Quay lại màn hình đăng nhập
                </AppText>
              </Pressable>
            )}

            {/* Message Feedback */}
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

            {/* Submit Button */}
            <ActionButton
              disabled={pending}
              label={
                pending
                  ? "Đang xử lý…"
                  : mode === "register"
                    ? "Tạo tài khoản và vào Lịch"
                    : mode === "forgot"
                      ? "Gửi liên kết khôi phục"
                      : "Đăng nhập và vào Lịch"
              }
              onPress={() => void handleSubmit()}
            />

            {/* Divider OR & Anonymous Sign In */}
            {authService.signInAnonymously && mode !== "forgot" ? (
              <>
                <View style={styles.dividerRow}>
                  <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
                  <AppText style={[styles.dividerText, { color: colors.muted }]}>HOẶC</AppText>
                  <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
                </View>
                <Pressable
                  accessibilityLabel="Đăng nhập ẩn danh"
                  accessibilityRole="button"
                  disabled={pending}
                  onPress={() => void handleAnonymousSignIn()}
                  style={[
                    styles.anonButton,
                    { borderColor: colors.border, backgroundColor: colors.surface },
                  ]}
                >
                  <AppText style={{ fontSize: 16, marginRight: 8 }}>🎭</AppText>
                  <AppText style={[styles.anonButtonText, { color: colors.text }]}>
                    {pending ? "Đang xử lý…" : "Đăng nhập Ẩn danh (Dùng ngay)"}
                  </AppText>
                </Pressable>
              </>
            ) : null}
          </>
        )}

        {/* Cancel / Skip back to calendar */}
        {onCancel ? (
          <Pressable onPress={onCancel} style={styles.cancelButton}>
            <AppText style={{ color: colors.muted, fontSize: 13, fontWeight: "600" }}>
              Để sau — Tiếp tục dùng lịch không cần tài khoản
            </AppText>
          </Pressable>
        ) : null}
      </View>
    </View>
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
      return "Email này đã được sử dụng. Vui lòng chọn đăng nhập.";
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
      return "Phương thức Email/Password chưa được kích hoạt trên Firebase Console.";
    default:
      return code
        ? `Lỗi xác thực (${code}). Vui lòng kiểm tra lại thông tin.`
        : "Không thể kết nối xác thực. Vui lòng thử lại sau.";
  }
}

const styles = StyleSheet.create({
  container: {
    alignSelf: "center",
    maxWidth: 480,
    paddingVertical: theme.spacing.md,
    width: "100%",
  },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    gap: 16,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  heroSection: {
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  logoBadge: {
    alignItems: "center",
    borderRadius: 24,
    height: 48,
    justifyContent: "center",
    marginBottom: 6,
    width: 48,
  },
  logoBadgeText: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "900",
    letterSpacing: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: 0.5,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 18,
    textAlign: "center",
  },
  noticeBox: {
    borderRadius: 12,
    borderWidth: 1,
    gap: 4,
    padding: 12,
  },
  tabs: {
    borderRadius: 12,
    flexDirection: "row",
    padding: 4,
  },
  tab: {
    alignItems: "center",
    borderRadius: 9,
    flex: 1,
    paddingVertical: 9,
  },
  activeTab: {
    elevation: 1,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 3,
  },
  inputGroup: {
    gap: 6,
  },
  inputHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "600",
  },
  input: {
    borderRadius: 12,
    borderWidth: 1,
    fontSize: 15,
    minHeight: 46,
    paddingHorizontal: 14,
  },
  passwordContainer: {
    justifyContent: "center",
    position: "relative",
  },
  passwordInput: {
    paddingRight: 52,
  },
  eyeButton: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    position: "absolute",
    right: 6,
  },
  backToLoginRow: {
    alignSelf: "flex-start",
    paddingVertical: 4,
  },
  messageBanner: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
  },
  cancelButton: {
    alignItems: "center",
    marginTop: 4,
    paddingVertical: 10,
  },
  dividerRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    marginVertical: 4,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
  },
  anonButton: {
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "center",
    minHeight: 46,
    paddingHorizontal: 16,
  },
  anonButtonText: {
    fontSize: 14,
    fontWeight: "700",
  },
});
