import { useEffect, useState } from "react";
import {
  Image,
  Modal,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";

import { ActionButton } from "../primitives/ActionButton";
import { AppText } from "../primitives/AppText";
import { theme, useTheme } from "../theme";
import { SettingCard } from "./SettingCard";
import type { AuthService, AuthUser } from "./types";

const PRESET_AVATARS = [
  { id: "avatar-1", label: "Mặt trời", url: "https://api.dicebear.com/7.x/bottts/png?seed=SunLight" },
  { id: "avatar-2", label: "Trăng rằm", url: "https://api.dicebear.com/7.x/bottts/png?seed=MoonBeam" },
  { id: "avatar-3", label: "Ngọc bích", url: "https://api.dicebear.com/7.x/bottts/png?seed=JadeLotus" },
  { id: "avatar-4", label: "Hồng hạc", url: "https://api.dicebear.com/7.x/bottts/png?seed=Flamingo" },
  { id: "avatar-5", label: "Trúc xanh", url: "https://api.dicebear.com/7.x/bottts/png?seed=Bamboo" },
];

interface UserProfileCardProps {
  authService?: AuthService;
  onOpenAuth?: () => void;
}

export function UserProfileCard({ authService, onOpenAuth }: UserProfileCardProps) {
  const { colors } = useTheme();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [pending, setPending] = useState(false);
  const [feedback, setFeedback] = useState<{ text: string; type: "error" | "success" } | null>(null);

  // Modal states
  const [fullViewerVisible, setFullViewerVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);

  // Edit form state
  const [editDisplayName, setEditDisplayName] = useState("");
  const [editPhotoURL, setEditPhotoURL] = useState("");

  useEffect(() => {
    if (!authService) return;
    return authService.subscribe((nextUser) => {
      setUser(nextUser);
      if (nextUser) {
        setEditDisplayName(nextUser.displayName || "");
        setEditPhotoURL(nextUser.photoURL || "");
      }
    });
  }, [authService]);

  const handleOpenEdit = () => {
    if (user) {
      setEditDisplayName(user.displayName || "");
      setEditPhotoURL(user.photoURL || "");
    }
    setFeedback(null);
    setEditModalVisible(true);
  };

  const handleSaveProfile = async () => {
    if (!authService?.updateProfile) {
      setFeedback({ text: "Chức năng cập nhật hồ sơ chưa sẵn sàng.", type: "error" });
      return;
    }
    setPending(true);
    setFeedback(null);
    try {
      await authService.updateProfile({
        displayName: editDisplayName.trim() || undefined,
        photoURL: editPhotoURL.trim() || undefined,
      });
      setFeedback({ text: "Cập nhật hồ sơ thành công!", type: "success" });
      setEditModalVisible(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Không thể cập nhật hồ sơ.";
      setFeedback({ text: msg, type: "error" });
    } finally {
      setPending(false);
    }
  };

  const handleSignOut = async () => {
    if (!authService) return;
    setPending(true);
    setFeedback(null);
    try {
      await authService.signOut();
      setFeedback({ text: "Đã đăng xuất tài khoản.", type: "success" });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Đăng xuất thất bại.";
      setFeedback({ text: msg, type: "error" });
    } finally {
      setPending(false);
    }
  };

  const currentAvatarUrl = user?.photoURL || null;
  const initialLetter = (user?.displayName || user?.email || "U").charAt(0).toUpperCase();

  return (
    <SettingCard
      description="Quản lý thông tin tài khoản Firebase và đồng bộ dữ liệu."
      title="Tài khoản cá nhân"
    >
      {!authService ? (
        <View style={[styles.cardBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <AppText style={{ color: colors.accent, fontWeight: "600" }}>
            Firebase chưa được cấu hình
          </AppText>
          <AppText tone="muted" variant="caption">
            Thiếu biến môi trường API Key, App ID hoặc Project ID để kích hoạt tính năng tài khoản.
          </AppText>
        </View>
      ) : user ? (
        <View style={[styles.cardBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {/* User Profile Overview */}
          <View style={styles.profileRow}>
            {/* Clickable Avatar to view full photo */}
            <Pressable
              accessibilityLabel="Xem ảnh đại diện kích thước lớn"
              accessibilityRole="button"
              onPress={() => setFullViewerVisible(true)}
              style={({ pressed }) => [
                styles.avatarContainer,
                pressed && { opacity: 0.8 },
              ]}
            >
              {currentAvatarUrl ? (
                <Image
                  accessibilityLabel="Ảnh đại diện"
                  resizeMode="cover"
                  source={{ uri: currentAvatarUrl }}
                  style={[styles.avatarImage, { borderColor: colors.accent }]}
                />
              ) : (
                <View style={[styles.avatarFallback, { backgroundColor: colors.accent }]}>
                  <AppText style={styles.avatarFallbackText}>{initialLetter}</AppText>
                </View>
              )}
              {/* Zoom badge indicator */}
              <View style={[styles.zoomBadge, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <AppText style={{ fontSize: 10, color: colors.muted }}>🔍</AppText>
              </View>
            </Pressable>

            {/* User Info Details */}
            <View style={styles.userInfo}>
              <View style={styles.statusBadge}>
                <View style={[styles.onlineDot, user.isAnonymous && { backgroundColor: "#F57C00" }]} />
                <AppText style={[styles.statusBadgeText, user.isAnonymous && { color: "#F57C00" }]}>
                  {user.isAnonymous ? "Khách ẩn danh" : "Đã kết nối Firebase"}
                </AppText>
              </View>
              <AppText style={styles.displayName}>
                {user.displayName || (user.isAnonymous ? "Khách ẩn danh" : "Chưa đặt tên hiển thị")}
              </AppText>
              <AppText tone="muted" variant="caption">
                {user.email || (user.isAnonymous ? "Tài khoản khách tạm thời" : "Không có email")}
              </AppText>
              <AppText style={{ color: colors.muted, fontSize: 11, marginTop: 2 }}>
                (Bấm vào ảnh đại diện để xem phóng to)
              </AppText>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionRow}>
            <View style={{ flex: 1 }}>
              <ActionButton
                disabled={pending}
                label={user.isAnonymous && onOpenAuth ? "Đăng ký tài khoản" : "Chỉnh sửa hồ sơ"}
                onPress={user.isAnonymous && onOpenAuth ? onOpenAuth : handleOpenEdit}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Pressable
                accessibilityLabel="Đăng xuất tài khoản"
                accessibilityRole="button"
                disabled={pending}
                onPress={() => void handleSignOut()}
                style={[
                  styles.signOutButton,
                  { borderColor: "#FFCDD2", backgroundColor: "#FFEBEE" },
                ]}
              >
                <AppText style={styles.signOutButtonText}>
                  {pending ? "Đang xử lý…" : "Đăng xuất"}
                </AppText>
              </Pressable>
            </View>
          </View>
        </View>
      ) : (
        /* Guest / Not Logged In State */
        <View style={[styles.cardBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.guestRow}>
            <View style={[styles.guestAvatar, { backgroundColor: colors.border }]}>
              <AppText style={{ fontSize: 24 }}>👤</AppText>
            </View>
            <View style={styles.userInfo}>
              <AppText style={{ fontWeight: "700", fontSize: 16 }}>Chưa đăng nhập</AppText>
              <AppText tone="muted" variant="caption">
                Đăng nhập tài khoản Firebase để đồng bộ ghi chú, sự kiện và tùy chỉnh giao diện giữa các thiết bị.
              </AppText>
            </View>
          </View>
          {onOpenAuth ? (
            <ActionButton
              label="Đăng nhập / Tạo tài khoản"
              onPress={onOpenAuth}
            />
          ) : null}
        </View>
      )}

      {/* Feedback Alert */}
      {feedback ? (
        <View
          accessibilityRole="alert"
          style={[
            styles.feedbackBanner,
            {
              backgroundColor: feedback.type === "success" ? "#E8F5E9" : "#FFEBEE",
              borderColor: feedback.type === "success" ? "#C8E6C9" : "#FFCDD2",
            },
          ]}
        >
          <AppText
            style={{
              color: feedback.type === "success" ? "#2E7D32" : colors.accent,
              fontSize: 13,
              fontWeight: "500",
            }}
          >
            {feedback.text}
          </AppText>
        </View>
      ) : null}

      {/* FULL-SIZE IMAGE VIEWER MODAL */}
      <Modal
        animationType="fade"
        onRequestClose={() => setFullViewerVisible(false)}
        transparent
        visible={fullViewerVisible}
      >
        <View style={styles.modalBackdrop}>
          <Pressable
            accessibilityLabel="Đóng xem ảnh"
            onPress={() => setFullViewerVisible(false)}
            style={StyleSheet.absoluteFill}
          />
          <View style={[styles.viewerContent, { backgroundColor: colors.surface }]}>
            <View style={styles.viewerHeader}>
              <AppText style={{ fontWeight: "700", fontSize: 16 }}>
                Ảnh đại diện
              </AppText>
              <Pressable
                accessibilityLabel="Đóng"
                onPress={() => setFullViewerVisible(false)}
                style={styles.closeIconButton}
              >
                <AppText style={{ fontSize: 18, fontWeight: "700", color: colors.muted }}>
                  ✕
                </AppText>
              </Pressable>
            </View>

            <View style={styles.viewerImageWrapper}>
              {currentAvatarUrl ? (
                <Image
                  accessibilityLabel="Ảnh đại diện kích thước lớn"
                  resizeMode="contain"
                  source={{ uri: currentAvatarUrl }}
                  style={styles.viewerFullImage}
                />
              ) : (
                <View style={[styles.viewerLargeFallback, { backgroundColor: colors.accent }]}>
                  <AppText style={styles.viewerLargeFallbackText}>{initialLetter}</AppText>
                </View>
              )}
            </View>

            <View style={styles.viewerFooter}>
              <AppText style={{ fontWeight: "700", fontSize: 17, textAlign: "center" }}>
                {user?.displayName || "Người dùng"}
              </AppText>
              {user?.email ? (
                <AppText tone="muted" variant="caption" style={{ textAlign: "center" }}>
                  {user.email}
                </AppText>
              ) : null}
            </View>
          </View>
        </View>
      </Modal>

      {/* EDIT PROFILE MODAL */}
      <Modal
        animationType="fade"
        onRequestClose={() => setEditModalVisible(false)}
        transparent
        visible={editModalVisible}
      >
        <View style={styles.modalBackdrop}>
          <Pressable
            accessibilityLabel="Đóng sửa hồ sơ"
            onPress={() => setEditModalVisible(false)}
            style={StyleSheet.absoluteFill}
          />
          <View style={[styles.editDialog, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <AppText style={styles.editTitle}>Chỉnh sửa thông tin hồ sơ</AppText>
            <AppText tone="muted" variant="caption">
              Cập nhật tên hiển thị và ảnh đại diện cho tài khoản của bạn.
            </AppText>

            {/* Avatar Preview */}
            <View style={styles.editAvatarPreviewRow}>
              {editPhotoURL ? (
                <Image
                  resizeMode="cover"
                  source={{ uri: editPhotoURL }}
                  style={[styles.editPreviewAvatar, { borderColor: colors.accent }]}
                />
              ) : (
                <View style={[styles.editPreviewAvatarFallback, { backgroundColor: colors.accent }]}>
                  <AppText style={{ color: "#FFF", fontSize: 24, fontWeight: "700" }}>
                    {(editDisplayName || initialLetter || "U").charAt(0).toUpperCase()}
                  </AppText>
                </View>
              )}
              <View style={{ flex: 1, gap: 2 }}>
                <AppText style={{ fontWeight: "600", fontSize: 14 }}>
                  {editDisplayName || "Xem trước tên"}
                </AppText>
                <AppText tone="muted" variant="caption">
                  Ảnh sẽ hiển thị trong toàn ứng dụng
                </AppText>
              </View>
            </View>

            {/* Display Name Input */}
            <View style={styles.fieldGroup}>
              <AppText style={styles.fieldLabel}>Tên hiển thị</AppText>
              <TextInput
                onChangeText={setEditDisplayName}
                placeholder="Nhập tên của bạn"
                placeholderTextColor={colors.muted}
                style={[
                  styles.textInput,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    color: colors.text,
                  },
                ]}
                value={editDisplayName}
              />
            </View>

            {/* Photo URL Input */}
            <View style={styles.fieldGroup}>
              <AppText style={styles.fieldLabel}>Đường dẫn ảnh đại diện (URL)</AppText>
              <TextInput
                autoCapitalize="none"
                keyboardType="url"
                onChangeText={setEditPhotoURL}
                placeholder="https://example.com/avatar.png"
                placeholderTextColor={colors.muted}
                style={[
                  styles.textInput,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    color: colors.text,
                  },
                ]}
                value={editPhotoURL}
              />
            </View>

            {/* Preset Avatars Selection */}
            <View style={styles.fieldGroup}>
              <AppText style={styles.fieldLabel}>Hoặc chọn nhanh ảnh mẫu</AppText>
              <View style={styles.presetAvatarsRow}>
                {PRESET_AVATARS.map((preset) => {
                  const isSelected = editPhotoURL === preset.url;
                  return (
                    <Pressable
                      key={preset.id}
                      accessibilityLabel={`Chọn ảnh ${preset.label}`}
                      onPress={() => setEditPhotoURL(preset.url)}
                      style={[
                        styles.presetAvatarBtn,
                        isSelected && { borderColor: colors.accent, borderWidth: 2.5 },
                      ]}
                    >
                      <Image
                        resizeMode="cover"
                        source={{ uri: preset.url }}
                        style={styles.presetAvatarImg}
                      />
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Modal Buttons */}
            <View style={styles.modalButtonsRow}>
              <Pressable
                disabled={pending}
                onPress={() => setEditModalVisible(false)}
                style={[styles.cancelBtn, { borderColor: colors.border }]}
              >
                <AppText style={{ color: colors.muted, fontWeight: "600" }}>Hủy</AppText>
              </Pressable>
              <View style={{ flex: 1 }}>
                <ActionButton
                  disabled={pending}
                  label={pending ? "Đang lưu…" : "Lưu thay đổi"}
                  onPress={() => void handleSaveProfile()}
                />
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </SettingCard>
  );
}

const styles = StyleSheet.create({
  cardBox: {
    borderRadius: 14,
    borderWidth: 1,
    gap: 12,
    padding: 14,
  },
  profileRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 14,
  },
  avatarContainer: {
    position: "relative",
  },
  avatarImage: {
    borderRadius: 28,
    borderWidth: 2,
    height: 56,
    width: 56,
  },
  avatarFallback: {
    alignItems: "center",
    borderRadius: 28,
    height: 56,
    justifyContent: "center",
    width: 56,
  },
  avatarFallbackText: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "700",
  },
  zoomBadge: {
    alignItems: "center",
    borderRadius: 9,
    borderWidth: 1,
    bottom: -2,
    height: 18,
    justifyContent: "center",
    position: "absolute",
    right: -2,
    width: 18,
  },
  userInfo: {
    flex: 1,
    gap: 2,
  },
  statusBadge: {
    alignItems: "center",
    flexDirection: "row",
    gap: 6,
    marginBottom: 2,
  },
  onlineDot: {
    backgroundColor: "#2E7D32",
    borderRadius: 4,
    height: 7,
    width: 7,
  },
  statusBadgeText: {
    color: "#2E7D32",
    fontSize: 12,
    fontWeight: "600",
  },
  displayName: {
    fontSize: 16,
    fontWeight: "700",
  },
  actionRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 4,
  },
  signOutButton: {
    alignItems: "center",
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 44,
    paddingHorizontal: 12,
  },
  signOutButtonText: {
    color: "#C62828",
    fontSize: 14,
    fontWeight: "700",
  },
  guestRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 14,
    paddingVertical: 4,
  },
  guestAvatar: {
    alignItems: "center",
    borderRadius: 26,
    height: 52,
    justifyContent: "center",
    width: 52,
  },
  feedbackBanner: {
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 6,
    padding: 10,
  },
  modalBackdrop: {
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  viewerContent: {
    borderRadius: 20,
    maxWidth: 380,
    overflow: "hidden",
    padding: 18,
    width: "100%",
  },
  viewerHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  closeIconButton: {
    padding: 6,
  },
  viewerImageWrapper: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
  },
  viewerFullImage: {
    borderRadius: 16,
    height: 260,
    width: 260,
  },
  viewerLargeFallback: {
    alignItems: "center",
    borderRadius: 130,
    height: 220,
    justifyContent: "center",
    width: 220,
  },
  viewerLargeFallbackText: {
    color: "#FFFFFF",
    fontSize: 80,
    fontWeight: "700",
  },
  viewerFooter: {
    gap: 4,
    marginTop: 12,
  },
  editDialog: {
    borderRadius: 20,
    borderWidth: 1,
    gap: 14,
    maxWidth: 420,
    padding: 20,
    width: "100%",
  },
  editTitle: {
    fontSize: 18,
    fontWeight: "800",
  },
  editAvatarPreviewRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    paddingVertical: 4,
  },
  editPreviewAvatar: {
    borderRadius: 24,
    borderWidth: 2,
    height: 48,
    width: 48,
  },
  editPreviewAvatarFallback: {
    alignItems: "center",
    borderRadius: 24,
    height: 48,
    justifyContent: "center",
    width: 48,
  },
  fieldGroup: {
    gap: 6,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "600",
  },
  textInput: {
    borderRadius: 10,
    borderWidth: 1,
    fontSize: 14,
    minHeight: 44,
    paddingHorizontal: 12,
  },
  presetAvatarsRow: {
    flexDirection: "row",
    gap: 10,
    paddingVertical: 2,
  },
  presetAvatarBtn: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "transparent",
    overflow: "hidden",
  },
  presetAvatarImg: {
    borderRadius: 8,
    height: 44,
    width: 44,
  },
  modalButtonsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 6,
  },
  cancelBtn: {
    alignItems: "center",
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 44,
    paddingHorizontal: 18,
  },
});
