import { Container, Typography } from "@mui/material";
import { SignIn } from "../../Auth/SignIn";
import { useSelector } from "react-redux";
import { RootState } from "../../app/store";

export const SignInOut = () => {
  const isLoggedIn = useSelector((state: RootState) => state.auth.isAuthenticated);

  return <Container>{isLoggedIn ? <Typography variant="h1">You're signed in!</Typography> : <SignIn />}</Container>;
};
