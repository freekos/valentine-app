import { ComponentProps } from "react";
import clsx from "clsx";

interface ContainerProps extends ComponentProps<"section"> {}

export const Container = ({
  children,
  className,
  ...props
}: ContainerProps) => (
  <section
    className={clsx("max-w-5xl mx-auto px-3 py-14", className)}
    {...props}
  >
    {children}
  </section>
);
