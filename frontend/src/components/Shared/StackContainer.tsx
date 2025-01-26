import { Stack, StackProps } from "@mui/material";
import { getStackStyles } from "./getStackStyles";

interface StackContainerProps extends StackProps {
  centerContent?: boolean;
}
export const StackContainer = ({
  children,
  direction = "column",
  component = "main",
  sx = [],
  ...props
}: StackContainerProps) => {
  return (
    <Stack
      direction={direction}
      sx={[
        {
          justifyContent: "center",
          height: "calc((1 - var(--template-frame-height, 0)) * 100%)",
          marginTop: "max(30px - var(--template-frame-height, 0px), 0px)",
          minHeight: "100%",
        },
        (theme) => getStackStyles(theme),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...props}
    >
      {children}
    </Stack>
  );
};
