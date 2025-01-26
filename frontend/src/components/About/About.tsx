import { Container, Typography, Box } from "@mui/material";

export const About = () => {
  return (
    <Container maxWidth="lg" sx={{ display: "flex", justifyContent: "center", p: 2 }}>
      <Box
        sx={{
          width: "100%",
          maxWidth: "50%",
          textAlign: "justify",
        }}
      >
        <Typography variant="h4" component="h1">
          About ReliefHub
        </Typography>

        <Typography variant="body1" sx={{ mt: 2 }}>
          ReliefHub is a community-driven platform designed to connect individuals in need of immediate assistance to
          those who can provide help with resources and support during disaster.
        </Typography>

        <Typography variant="body1" sx={{ mt: 2 }}>
          Let's create a world where no one has to feel abandoned in times of emergency. When government resources are
          not available, there is community.
        </Typography>

        <Typography variant="body2" sx={{ textAlign: "center", mt: 2 }}>
          Made with ❤️
        </Typography>
      </Box>
    </Container>
  );
};
