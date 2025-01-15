import { Box, Button, FormControl, FormLabel, Link, Stack, TextField, Typography } from "@mui/material";
import { ForgotPasswordDialog } from "./ForgotPasswordDialog";
import { ChangeEvent, FocusEvent, FormEvent, useState } from "react";
import { validateEmail, validatePassword } from "../utils/validation";
import { useAuth } from "./useAuth";
import { StyledCard } from "../components/Shared/StyledCard";
import { getStackStyles } from "../components/Shared/getStackStyles";

export const SignIn = () => {
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [formValues, setFormValues] = useState<{ [key: string]: string }>({
    email: "",
    password: "",
  });
  const [forgotPasswordDialogIsOpen, setForgotPasswordDialogIsOpen] = useState(false);

  const { login, isLoggingIn } = useAuth();

  const validateField = (name: string, value: string): string | null => {
    switch (name) {
      case "email":
        return validateEmail(value) ? null : "Please enter a valid email address";
      case "password":
        return validatePassword(value) ? null : "Password must be between 8 and 128 characters";
      default:
        return null;
    }
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

  const isSubmitDisabled = isLoggingIn || !!errors.email || !!errors.password || !formValues.email || !formValues.password;

  return (
    <Stack
      direction="column"
      component="main"
      sx={[
        {
          justifyContent: "center",
          height: "calc((1 - var(--template-frame-height, 0)) * 100%)",
          marginTop: "max(20px - var(--template-frame-height, 0px), 0px)",
          minHeight: "100%",
        },
        (theme) => getStackStyles(theme),
      ]}
    >
      <StyledCard variant="outlined">
        <Typography component="h1" variant="h4" sx={{ width: "100%", fontSize: "clamp(2rem, 10vw, 2.15rem)" }}>
          Sign in
        </Typography>
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
            gap: 2,
          }}
        >
          <FormControl>
            <FormLabel htmlFor="email">Email</FormLabel>
            <TextField
              error={!!errors.email}
              helperText={errors.email || ""}
              id="email"
              type="email"
              name="email"
              placeholder="your@email.com"
              autoComplete="email"
              autoFocus
              required
              fullWidth
              variant="outlined"
              color={!!errors.email ? "error" : "primary"}
              value={formValues.email}
              onChange={handleChange}
              onBlur={handleBlur}
            />
          </FormControl>
          <FormControl>
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <FormLabel htmlFor="password">Password</FormLabel>
              <Link component="button" type="button" onClick={handleForgotPasswordOpen} variant="body2" sx={{ alignSelf: "baseline" }}>
                Forgot your password?
              </Link>
            </Box>
            <TextField
              error={!!errors.password}
              helperText={!!errors.password || ""}
              name="password"
              placeholder="••••••"
              type="password"
              id="password"
              autoComplete="current-password"
              required
              fullWidth
              variant="outlined"
              color={!!errors.password ? "error" : "primary"}
              value={formValues.password}
              onChange={handleChange}
              onBlur={handleBlur}
            />
          </FormControl>
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
    </Stack>
  );
};
