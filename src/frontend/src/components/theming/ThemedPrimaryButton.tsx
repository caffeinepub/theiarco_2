import { Button } from "@/components/ui/button";
import { getContrastColor } from "@/theme/colorUtils";
import { forwardRef } from "react";
import type { ComponentProps } from "react";

interface ThemedPrimaryButtonProps
  extends Omit<ComponentProps<typeof Button>, "style" | "variant"> {
  themeColor: string;
}

/**
 * Primary button that automatically applies page theme color with proper contrast
 */
export const ThemedPrimaryButton = forwardRef<
  HTMLButtonElement,
  ThemedPrimaryButtonProps
>(({ themeColor, className, children, ...props }, ref) => {
  const textColor = getContrastColor(themeColor);

  return (
    <Button
      ref={ref}
      style={{
        backgroundColor: themeColor,
        color: textColor,
      }}
      className={`hover:opacity-90 transition-opacity ${className || ""}`}
      {...props}
    >
      {children}
    </Button>
  );
});

ThemedPrimaryButton.displayName = "ThemedPrimaryButton";
