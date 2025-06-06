
import React from "react";
import { useToast as useToastHook, toast as toastFunction } from "@/hooks/use-toast";

// Re-export the hooks with any customization if needed
export const useToast = useToastHook;
export const toast = toastFunction;

// Add custom toast types and configurations
export type ToastActionElement = React.ReactElement;

export type ToastProps = {
  title?: string;
  description?: string;
  action?: ToastActionElement;
  variant?: "default" | "destructive" | "success" | "warning" | "info";
};

// You can add helper functions here
export const successToast = (props: Omit<ToastProps, "variant">) => {
  return toastFunction({
    ...props,
    variant: "success",
  });
};

export const errorToast = (props: Omit<ToastProps, "variant">) => {
  return toastFunction({
    ...props,
    variant: "destructive",
  });
};

export const warningToast = (props: Omit<ToastProps, "variant">) => {
  return toastFunction({
    ...props,
    variant: "warning",
  });
};

export const infoToast = (props: Omit<ToastProps, "variant">) => {
  return toastFunction({
    ...props,
    variant: "info",
  });
};
