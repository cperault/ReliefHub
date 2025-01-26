import { Component, ErrorInfo, ReactNode } from "react";
import { Box, Typography, Button } from "@mui/material";
import { StyledCard } from "../Shared/StyledCard";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "100vh",
          }}
        >
          <StyledCard variant="outlined">
            <Typography variant="h4" gutterBottom>
              Oops, something went wrong
            </Typography>
            <Typography variant="body1" sx={{ mb: 4 }}>
              {this.state.error?.message || "An unexpected error occurred"}
            </Typography>
            <Button variant="contained" onClick={this.handleReset} aria-label="Reset application">
              Try Again
            </Button>
          </StyledCard>
        </Box>
      );
    }

    return this.props.children;
  }
}
