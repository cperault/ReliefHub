import {
  Box,
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormLabel,
  Link,
  Stack,
  styled,
  TextField,
  Typography,
} from "@mui/material";
import MuiCard from "@mui/material/Card";

import { ForgotPasswordDialog } from "./ForgotPasswordDialog";

import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { FormEvent, useState } from "react";

export const SignIn = () => {
  const [emailError, setEmailError] = useState(false);
  const [emailErrorMessage, setEmailErrorMessage] = useState("");
  const [passwordError, setPasswordError] = useState(false);
  const [passwordErrorMessage, setPasswordErrorMessage] = useState("");
  const [forgotPasswordDialogIsOpen, setForgotPasswordDialogIsOpen] =
    useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();

    if (emailError || passwordError) {
      return;
    }

    const submitData = new FormData(event.currentTarget);

    console.log({
      email: submitData.get("email"),
      password: submitData.get("password"),
    });

    handleSignIn(
      submitData.get("email") as string,
      submitData.get("password") as string
    );
  };

  const validateInputs = () => {
    const email = document.getElementById("email") as HTMLInputElement;
    const password = document.getElementById("password") as HTMLInputElement;

    let isValid = true;

    // TODO: implement proper validation here

    return isValid;
  };

  const handleSignIn = (email: string, password: string) => {
    const auth = getAuth();
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        console.log(user);
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log({ errorCode, errorMessage });
      });
  };

  const handleForgotPasswordOpen = () => {
    setForgotPasswordDialogIsOpen(true);
  };

  const handleForgotPasswordClose = () => {
    setForgotPasswordDialogIsOpen(false);
  };

  const Card = styled(MuiCard)(({ theme }) => ({
    display: "flex",
    flexDirection: "column",
    alignSelf: "center",
    width: "100%",
    padding: theme.spacing(4),
    gap: theme.spacing(2),
    margin: "auto",
    boxShadow:
      "hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px",
    [theme.breakpoints.up("sm")]: {
      width: "450px",
    },
    ...theme.applyStyles("dark", {
      boxShadow:
        "hsla(220, 30%, 5%, 0.5) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.08) 0px 15px 35px -5px",
    }),
  }));

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
        (theme) => ({
          "&::before": {
            content: '""',
            display: "block",
            position: "absolute",
            zIndex: -1,
            inset: 0,
            backgroundImage:
              "radial-gradient(ellipse at 50% 50%, hsl(210, 100%, 97%), hsl(0, 0%, 100%))",
            backgroundRepeat: "no-repeat",
            ...theme.applyStyles("dark", {
              backgroundImage:
                "radial-gradient(at 50% 50%, hsla(210, 100%, 16%, 0.5), hsl(220, 30%, 5%))",
            }),
          },
        }),
      ]}
    >
      <Card variant="outlined">
        <Typography
          component="h1"
          variant="h4"
          sx={{ width: "100%", fontSize: "clamp(2rem, 10vw, 2.15rem)" }}
        >
          Sign in
        </Typography>
        <Box
          component="form"
          onSubmit={handleSubmit}
          noValidate
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
              error={emailError}
              helperText={emailErrorMessage}
              id="email"
              type="email"
              name="email"
              placeholder="your@email.com"
              autoComplete="email"
              autoFocus
              required
              fullWidth
              variant="outlined"
              color={emailError ? "error" : "primary"}
            />
          </FormControl>
          <FormControl>
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <FormLabel htmlFor="password">Password</FormLabel>
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
              error={passwordError}
              helperText={passwordErrorMessage}
              name="password"
              placeholder="••••••"
              type="password"
              id="password"
              autoComplete="current-password"
              autoFocus
              required
              fullWidth
              variant="outlined"
              color={passwordError ? "error" : "primary"}
            />
          </FormControl>
          <FormControlLabel
            control={<Checkbox value="remember" color="primary" />}
            label="Remember me"
          />
          <ForgotPasswordDialog
            open={forgotPasswordDialogIsOpen}
            handleClose={handleForgotPasswordClose}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            onClick={validateInputs}
          >
            Sign in
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
      </Card>
    </Stack>
  );
};
