import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import OutlinedInput from "@mui/material/OutlinedInput";

interface ForgotPasswordDialogProps {
  open: boolean;
  handleClose: () => void;
}

export const ForgotPasswordDialog = ({ open, handleClose }: ForgotPasswordDialogProps) => {
  return (
    <Dialog
      open={open}
      onClose={handleClose}
      PaperProps={{
        component: "form",
        onSubmit: (event: React.FormEvent<HTMLFormElement>) => {
          event.preventDefault();
          // TODO: handle Firebase password reset flow, make DialogContentText dynamic (pre-submit, post-submit)
          handleClose();
        },
        sx: { backgroundImage: "none" },
      }}
    >
      <DialogTitle>Reset password</DialogTitle>
      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, width: "100%" }}>
        <DialogContentText>Enter the email address associated with your account to receive an email with a link to reset your password.</DialogContentText>
        <OutlinedInput autoFocus required margin="dense" id="email" name="email" placeholder="email@example.com" type="email" fullWidth />
      </DialogContent>
      <DialogActions sx={{ pb: 3, px: 3 }}>
        <Button onClick={handleClose}>Cancel</Button>
        <Button variant="contained" type="submit">
          Continue
        </Button>
      </DialogActions>
    </Dialog>
  );
};
