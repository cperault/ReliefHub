import { Box, Button, Divider, Link, Stack, TextField, Typography } from "@mui/material";
import { HandshakeOutlined, LocalShippingOutlined } from "@mui/icons-material";
import { ChangeEvent, FocusEvent, FormEvent, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { StyledCard } from "../../components/Shared/StyledCard";
import { StackContainer } from "../../components/Shared/StackContainer";
import { useFormValidation } from "../../hooks/useFormValidation";

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
    description:
      "Arrange to have resources delivered or picked up. Coordinate with volunteers to get the help you need, when you need it.",
  },
];

const SignUpSideContent = () => {
  return (
    <Stack
      sx={{
        flexDirection: "column",
        alignSelf: "center",
        gap: 2,
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

export const SignUp = () => {
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [formValues, setFormValues] = useState<{ [key: string]: string }>({
    email: "",
    password: "",
  });
  const { register, isRegistering } = useAuth();
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
      await register(formValues.email, formValues.password);
    }
  };

  const isSignUpSubmitButtonDisabled =
    isRegistering || !!errors.email || !!errors.password || !formValues.email || !formValues.password;

  return (
    <StackContainer direction={{ xs: "column-reverse", md: "row" }}>
      <Stack
        direction={{ xs: "column-reverse", md: "row" }}
        sx={{
          gap: 4,
          m: "auto",
        }}
      >
        <SignUpSideContent />
        <StyledCard variant="outlined">
          <Typography component="h1" variant="h4" sx={{ width: "100%", fontSize: "clamp(2rem, 10vw, 2.15rem)" }}>
            Sign up
          </Typography>
          <Box
            component="form"
            onSubmit={async (e: FormEvent<HTMLFormElement>) => await handleSubmit(e)}
            sx={{ display: "flex", flexDirection: "column", gap: 2 }}
            autoComplete="on"
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
            />
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
            />
            <Button type="submit" fullWidth variant="contained" disabled={isSignUpSubmitButtonDisabled}>
              {isRegistering ? "Signing up..." : "Sign up"}
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
        </StyledCard>
      </Stack>
    </StackContainer>
  );
};
