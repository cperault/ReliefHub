import { Box, Button, Divider, FormControl, FormLabel, Link, Stack, styled, TextField, Typography } from "@mui/material";
import MuiCard from "@mui/material/Card";
import { HandshakeOutlined, LocalShippingOutlined } from "@mui/icons-material";
import { FocusEvent, FormEvent, useState } from "react";
import { validateEmail, validateName, validatePassword } from "../utils/validation";
import { useAuth } from "./AuthContext";

const signUpContentItems = [
  {
    icon: <HandshakeOutlined sx={{ color: "text.primary" }} fontSize="large" />,
    title: "Relief Starts Here. Get Connected.",
    description:
      "Join a network of volunteers and affected individuals. Offer what you can, request what you need, and work together to provide immediate relief.",
  },
  {
    icon: <LocalShippingOutlined sx={{ color: "text.primary" }} fontSize="large" />,
    title: "Relief, On the Move.",
    description: "Arrange to have resources delivered or picked up. Coordinate with volunteers to get the help you need, when you need it.",
  },
];

const SignUpSideContent = () => {
  return (
    <Stack
      sx={{
        flexDirection: "column",
        alignSelf: "center",
        gap: 4,
        maxWidth: 350,
      }}
    >
      {signUpContentItems.map((item, index) => (
        <Stack key={index} direction="row" sx={{ gap: 2, alignItems: "center" }}>
          {item.icon}
          <div>
            <Typography gutterBottom sx={{ fontWeight: "medium" }}>
              {item.title}
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              {item.description}
            </Typography>
          </div>
        </Stack>
      ))}
    </Stack>
  );
};

const Card = styled(MuiCard)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignSelf: "center",
  width: "100%",
  padding: theme.spacing(4),
  gap: theme.spacing(2),
  margin: "auto",
  boxShadow: "hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px",
  [theme.breakpoints.up("xs")]: {
    width: "450px",
  },
  ...theme.applyStyles("dark", {
    boxShadow: "hsla(220, 30%, 5%, 0.5) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.08) 0px 15px 35px -5px",
  }),
}));

export const SignUp = () => {
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [formValues, setFormValues] = useState<{ [key: string]: string }>({
    name: "",
    email: "",
    password: "",
  });
  const { register, isRegistering } = useAuth();

  const validateField = (name: string, value: string): string | null => {
    switch (name) {
      case "email":
        return validateEmail(value) ? null : "Please enter a valid email address";
      case "password":
        return validatePassword(value) ? null : "Password must be between 8 and 128 characters";
      case "name":
        return validateName(value) ? null : "Please enter a valid name";
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

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
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

    Object.keys(formValues).forEach((name) => {
      const error = validateField(name, formValues[name]);

      if (error) {
        newErrors[name] = error;
      }
    });

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      register(formValues.email, formValues.password);
    }
  };

  return (
    <Stack
      direction={{ xs: "column-reverse", md: "row" }}
      sx={[
        {
          justifyContent: "center",
          gap: { xs: 6, sm: 12 },
          p: 2,
          mx: "auto",
        },
        (theme) => ({
          "&::before": {
            content: '""',
            display: "block",
            position: "absolute",
            zIndex: -1,
            inset: 0,
            backgroundImage: "radial-gradient(ellipse at 50% 50%, hsl(210, 100%, 97%), hsl(0, 0%, 100%))",
            backgroundRepeat: "no-repeat",
            ...theme.applyStyles("dark", {
              backgroundImage: "radial-gradient(at 50% 50%, hsla(210, 100%, 16%, 0.5), hsl(220, 30%, 5%))",
            }),
          },
        }),
      ]}
    >
      <Stack
        direction={{ xs: "column-reverse", md: "row" }}
        sx={{
          justifyContent: "center",
          gap: { xs: 6, sm: 12 },
          p: { xs: 2, sm: 4 },
          m: "auto",
        }}
      >
        <SignUpSideContent />
        <Card>
          <Typography component="h1" variant="h4" sx={{ width: "100%", fontSize: "clamp(2rem, 10vw, 2.15rem)" }}>
            Sign up
          </Typography>
          <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <FormControl>
              <FormLabel htmlFor="name">Full name</FormLabel>
              <TextField
                autoFocus
                autoComplete="name"
                name="name"
                required
                fullWidth
                id="name"
                placeholder="Jon Snow"
                error={!!errors.name}
                helperText={errors.name || ""}
                color={!!errors.name ? "error" : "primary"}
                value={formValues.name}
                onChange={handleChange}
                onBlur={handleBlur}
              />
            </FormControl>
            <FormControl>
              <FormLabel htmlFor="email">Email</FormLabel>
              <TextField
                required
                fullWidth
                id="email"
                placeholder="your@email.com"
                name="email"
                autoComplete="email"
                variant="outlined"
                error={!!errors.email}
                helperText={errors.email || ""}
                color={!!errors.email ? "error" : "primary"}
                value={formValues.email}
                onChange={handleChange}
                onBlur={handleBlur}
              />
            </FormControl>
            <FormControl>
              <FormLabel htmlFor="password">Password</FormLabel>
              <TextField
                required
                fullWidth
                name="password"
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
              />
            </FormControl>
            <Button type="submit" fullWidth variant="contained" disabled={isRegistering}>
              Sign up
            </Button>
          </Box>
          <Divider>
            <Typography sx={{ color: "text.secondary" }}>or</Typography>
          </Divider>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Typography sx={{ textAlign: "center" }}>
              Already have an account?{" "}
              <Link href="/sign-in" variant="body2" sx={{ alignSelf: "center" }}>
                Sign in
              </Link>
            </Typography>
          </Box>
        </Card>
      </Stack>
    </Stack>
  );
};
