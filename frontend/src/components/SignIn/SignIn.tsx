import { Box, Button, Link, TextField, Typography } from "@mui/material";
import { ForgotPasswordDialog } from "../SignIn/ForgotPasswordDialog";
import { ChangeEvent, FocusEvent, FormEvent, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { StyledCard } from "../../components/Shared/StyledCard";
import { StackContainer } from "../../components/Shared/StackContainer";
import { useFormValidation } from "../../hooks/useFormValidation";

export const SignIn = () => {
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [formValues, setFormValues] = useState<{ [key: string]: string }>({
    email: "",
    password: "",
  });
  const [forgotPasswordDialogIsOpen, setForgotPasswordDialogIsOpen] = useState(false);

  const { login, isLoggingIn } = useAuth();
  const { validateField } = useFormValidation();

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
    if (event.target !== event.currentTarget) return; // SignIn and ForgotPasswordDialog share the same Form submission listener--we want to ignore the ForgotPasswordDialog event

    event.preventDefault();

    const newErrors: { [key: string]: string } = {};

    Object.keys(formValues).forEach((name) => {
      const error = validateField(name, formValues[name]);

      if (error) {
        newErrors[name] = error;
      }
    });

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      await login(formValues.email, formValues.password);
    }
  };

  const handleForgotPasswordOpen = () => {
    setForgotPasswordDialogIsOpen(true);
  };

  const handleForgotPasswordClose = () => {
    setForgotPasswordDialogIsOpen(false);
  };

  const isSubmitDisabled =
    isLoggingIn || !!errors.email || !!errors.password || !formValues.email || !formValues.password;

  return (
    <StackContainer>
      <StyledCard variant="outlined">
        <Typography component="h1" variant="h4" sx={{ width: "100%", fontSize: "clamp(2rem, 10vw, 2.15rem)" }}>
          Sign in
        </Typography>
        <Box
          component="form"
          autoComplete="on"
          onSubmit={async (e: FormEvent<HTMLFormElement>) => await handleSubmit(e)}
          sx={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
            gap: 2,
          }}
        >
          <TextField
            autoFocus
            required
            fullWidth
            id="email"
            type="email"
            name="email"
            label="Email"
            placeholder="your@email.com"
            autoComplete="username"
            variant="outlined"
            error={!!errors.email}
            helperText={errors.email || ""}
            color={!!errors.email ? "error" : "primary"}
            value={formValues.email}
            onChange={handleChange}
            onBlur={handleBlur}
            aria-describedby={errors.email ? "email-error" : undefined}
            slotProps={{
              input: {
                "aria-label": "Email",
                "aria-invalid": !!errors.email,
              },
            }}
          />
          <Box sx={{ display: "flex", justifyContent: "right" }}>
            <Link
              component="button"
              type="button"
              onClick={handleForgotPasswordOpen}
              variant="body2"
              sx={{ alignSelf: "baseline" }}
            >
              Forgot your password?
            </Link>
          </Box>
          <TextField
            required
            fullWidth
            name="password"
            label="Password"
            placeholder="••••••"
            type="password"
            id="password"
            autoComplete="new-password"
            variant="outlined"
            error={!!errors.password}
            helperText={errors.password || ""}
            color={!!errors.password ? "error" : "primary"}
            value={formValues.password}
            onChange={handleChange}
            onBlur={handleBlur}
            aria-describedby={errors.password ? "password-error" : undefined}
            slotProps={{
              input: {
                "aria-label": "Password",
                "aria-invalid": !!errors.password,
              },
            }}
          />
          <ForgotPasswordDialog open={forgotPasswordDialogIsOpen} handleClose={handleForgotPasswordClose} />
          <Button type="submit" fullWidth variant="contained" disabled={isSubmitDisabled}>
            {isLoggingIn ? "Signing in..." : "Sign in"}
          </Button>
          <Typography sx={{ textAlign: "center" }}>
            Don&apos;t have an account?{" "}
            <span>
              <Link href="sign-up" variant="body2" sx={{ alignSelf: "center" }}>
                Sign up
              </Link>
            </span>
          </Typography>
        </Box>
      </StyledCard>
    </StackContainer>
  );
};
