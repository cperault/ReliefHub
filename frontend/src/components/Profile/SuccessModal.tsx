import { CheckCircleOutline } from "@mui/icons-material";
import { Box, Paper, Typography, CircularProgress } from "@mui/material";

export const SuccessModal = ({ countdown }: { countdown: number | null }) => (
  <Box
    sx={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      bgcolor: "rgba(0, 0, 0, 0.5)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000,
    }}
    role="dialog"
    aria-labelledby="success-title"
    aria-busy={countdown !== null}
    aria-describedby="loading-progress"
  >
    <Paper
      sx={{
        p: 4,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 2,
      }}
    >
      <CheckCircleOutline sx={{ color: "success.main", fontSize: 48 }} aria-hidden="true" />
      <Typography variant="h5" component="h2" gutterBottom id="success-title">
        Profile Setup Complete!
      </Typography>
      <CircularProgress
        variant="determinate"
        value={((countdown || 0) / 3) * 100}
        size={40}
        id="loading-progress"
        aria-label="Redirecting countdown progress"
      />
      <Typography variant="body1" sx={{ mt: 2 }}>
        Redirecting to map in{" "}
        <span aria-live="polite" role="timer">
          {countdown}
        </span>{" "}
        seconds...
      </Typography>
    </Paper>
  </Box>
);
