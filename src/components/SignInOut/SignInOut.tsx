import { Container, Typography } from "@mui/material";

export const SignInOut = ({ isLoggedIn }: { isLoggedIn: boolean }) => {
  return (
    <Container>
      <Typography variant="h1">Sign {isLoggedIn ? "Out" : "In"}</Typography>
    </Container>
  );
};
