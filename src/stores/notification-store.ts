import { create } from "zustand";

interface NotificationStore {
  showNotification: boolean;
  message: string;
  severity: "success" | "error" | "warning" | "info";
  setShowNotification: (
    isShow: boolean,
    message: string,
    severity: "success" | "error" | "warning" | "info",
  ) => void;
}

const useNotificationStore = create<NotificationStore>((set) => ({
  showNotification: false,
  message: "",
  severity: "info",
  setShowNotification: (isShow, message, severity) =>
    set({ showNotification: isShow, message: message, severity: severity }),
}));

export default useNotificationStore;
