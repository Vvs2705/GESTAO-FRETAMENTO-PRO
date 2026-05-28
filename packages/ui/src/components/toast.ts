export const toastEvents = new EventTarget();

export interface ToastOptions {
  description?: string | undefined;
  type?: "success" | "error" | "info" | "warning" | undefined;
  duration?: number | undefined;
}

export const toast = {
  show(title: string, options: ToastOptions = {}) {
    const id = Math.random().toString(36).substring(2, 9);
    const event = new CustomEvent("add", {
      detail: {
        id,
        title,
        ...options,
      },
    });
    toastEvents.dispatchEvent(event);
  },
  success(title: string, description?: string) {
    this.show(title, { type: "success", description });
  },
  error(title: string, description?: string) {
    this.show(title, { type: "error", description });
  },
  info(title: string, description?: string) {
    this.show(title, { type: "info", description });
  },
  warning(title: string, description?: string) {
    this.show(title, { type: "warning", description });
  },
};
