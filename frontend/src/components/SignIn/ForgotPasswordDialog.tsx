import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { useAuth } from "../../hooks/useAuth";
import { ChangeEvent, FocusEvent, FormEvent, useState } from "react";
import { TextField } from "@mui/material";
import { useFormValidation } from "../../hooks/useFormValidation";

interface ForgotPasswordDialogProps {
  open: boolean;
  handleClose: () => void;
}

export const ForgotPasswordDialog = ({ open, handleClose }: ForgotPasswordDialogProps) => {
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [formValues, setFormValues] = useState<{ [key: string]: string }>({
    email: "",
  });
  const { resetPassword, isResettingPassword } = useAuth();
  const { validateField } = useFormValidation();

  const resetForm = (): void => {
    setFormValues({
      email: "",
    });

    setErrors({});
  };

  const handleBlur = (event: FocusEvent<HTMLInputElement>) => {
    const { name, value } = event.target;

    if (value === "") return;

    const error = validateField(name, value);

    if (error !== null) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        [name]: error || "",
      }));
    }
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = event.target;

    setFormValues((prevValues) => ({
      ...prevValues,
      [name]: value,
    }));

    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: "",
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();

    const newErrors: { [key: string]: string } = {};

    const error = validateField("email", formValues.email);

    if (error) {
      newErrors.email = error;
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      await resetPassword(formValues.email);
      resetForm();
      handleClose();
    }
  };

  const isSubmitButtonDisabled = isResettingPassword || !!errors.email || !formValues.email;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="xs"
      PaperProps={{
        component: "form",
        onSubmit: async (e: FormEvent<HTMLFormElement>) => await handleSubmit(e),
        sx: { backgroundImage: "none" },
      }}
    >
      <DialogTitle>Reset password</DialogTitle>
      <DialogContent
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
          width: "100%",
          overflowX: "hidden",
          boxSizing: "border-box",
        }}
      >
        <DialogContentText>
          Enter the email address associated with your account to receive an email with a link to reset your password.
        </DialogContentText>
        <TextField
          autoFocus
          required
          margin="dense"
          id="email"
          name="email"
          placeholder="email@example.com"
          type="email"
          fullWidth
          error={!!errors.email}
          color={!!errors.email ? "error" : "primary"}
          helperText={errors.email || ""}
          value={formValues.email}
          onChange={handleChange}
          onBlur={handleBlur}
          disabled={isResettingPassword}
        />
      </DialogContent>
      <DialogActions sx={{ pb: 3, px: 3 }}>
        <Button onClick={handleClose} disabled={isResettingPassword}>
          Cancel
        </Button>
        <Button variant="contained" type="submit" disabled={isSubmitButtonDisabled}>
          {isResettingPassword ? "Sending..." : "Send Reset Link"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
