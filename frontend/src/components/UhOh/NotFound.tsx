import { Container, Typography } from "@mui/material";

const NotFound = () => {
  console.log("404");
  return (
    <Container>
      <Typography variant="h1">Oopsies! Page not found.</Typography>
    </Container>
  );
};

export default NotFound;
