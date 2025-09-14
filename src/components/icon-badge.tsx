import { LucideIcon } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
const backgroundVariants = cva(
  "rounded-full flex items-center justify-center",
  {
    variants: {
      variant: {
        default: "bg-sky-100",
        primary: "bg-blue-500",
        secondary: "bg-gray-100",
        tertiary: "bg-gray-50",
        success: "bg-emerald-100",
        warning: "bg-yellow-500",
        danger: "bg-red-500",
      },
      size: {
        default: "p-2",
        sm: "p-1",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

const iconVariants = cva("", {
  variants: {
    variant: {
      default: "text-sky-700",
      primary: "text-blue-700",
      secondary: "text-gray-700",
      tertiary: "text-gray-700",
      success: "text-emerald-700",
      warning: "text-yellow-700",
      danger: "text-red-700",
    },
    size: {
      default: "h-8 w-8",
      sm: "h-4 w-4",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
});

type backgroundVariantsProps = VariantProps<typeof backgroundVariants>;
type iconVariantsProps = VariantProps<typeof iconVariants>;

interface IconBadgeProp extends backgroundVariantsProps, iconVariantsProps {
  icon: LucideIcon;
}

export const IconBadge = ({ icon: Icon, variant, size }: IconBadgeProp) => {
  return (
    <>
      <div className={cn(backgroundVariants({ variant, size }))}>
        <Icon className={cn(iconVariants({ variant, size }))} />
      </div>
    </>
  );
};
