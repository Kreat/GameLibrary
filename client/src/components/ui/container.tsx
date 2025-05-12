import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  as?: React.ElementType;
}

export function Container({
  className,
  as: Component = "div",
  ...props
}: ContainerProps) {
  return (
    <Component
      className={cn("container px-4 mx-auto", className)}
      {...props}
    />
  );
}