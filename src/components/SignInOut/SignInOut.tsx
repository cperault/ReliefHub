import { Container, Typography } from "@mui/material";
import { SignIn } from "../../Auth/SignIn";

export const SignInOut = ({ isLoggedIn }: { isLoggedIn: boolean }) => {
  return (
    <Container>
      {isLoggedIn ? (
        <Typography variant="h1">"You're signed in!"</Typography>
      ) : (
        <SignIn />
      )}
    </Container>
  );
};
