import { Container, Typography } from "@mui/material";
import { useSelector } from "react-redux";
import { RootState } from "../../app/store";
import { useEffect } from "react";
import { toast } from "react-toastify";

export const ReliefMap = () => {
  const user = useSelector((state: RootState) => state.auth.user);

  useEffect(() => {
    if (user) {
      toast.info(`Welcome, ${user.email}!`);
    }
  }, [user]);

  return (
    <Container>
      <Typography variant="h1">Map</Typography>
    </Container>
  );
};
