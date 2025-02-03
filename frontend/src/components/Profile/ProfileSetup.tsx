import { useState, FocusEvent, ChangeEvent, FormEvent, KeyboardEvent, useEffect } from "react";
import {
  Typography,
  Stepper,
  Step,
  StepLabel,
  TextField,
  Button,
  Box,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  CircularProgress,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { ProfileType, setUserState } from "../../state/user/userSlice";
import { useNavigate } from "react-router-dom";
import { RootState } from "../../state/store";
import { StyledCard } from "../Shared/StyledCard";
import { StackContainer } from "../Shared/StackContainer";
import { formatPhoneNumber } from "../../utils/formatter";
import { useUserProfile } from "../../hooks/useUserProfile";
import { ProfileUser } from "../../services/api";
import { SuccessModal } from "./SuccessModal";
import { toast } from "react-toastify";
import { useFormValidation } from "../../hooks/useFormValidation";
import { AddressType, State } from "../../types";

export const ProfileSetup = () => {
  const user = useSelector((state: RootState) => state.user);
  const [activeStep, setActiveStep] = useState(0);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [formValues, setFormValues] = useState<{ [key: string]: string }>({
    uid: user.uid || "",
    displayName: "",
    email: user.email || "",
    phoneNumber: "",
    userType: "" as ProfileType,
    addressType: "" as AddressType,
    addressStreet: "",
    addressCity: "",
    addressState: "" as State,
    addressZip: "",
  });

  const { createUser, isCreatingUser } = useUserProfile();
  const [isSuccess, setIsSuccess] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);

  const { validateField } = useFormValidation();

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const steps = [
    "Contact Info",
    "What Brings You Here?",
    ...(formValues.userType === ProfileType.AFFECTED ? ["Location"] : []),
  ];

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

  const handleNext = async () => {
    const newErrors: { [key: string]: string } = {};
    let error: string | null = null;

    switch (activeStep) {
      case 0:
        ["displayName", "phoneNumber"].forEach((name) => {
          error = validateField(name, formValues[name]);

          if (error) {
            newErrors[name] = error;
          }
        });
        break;
      case 1:
        error = validateField("userType", formValues.userType);

        if (error) {
          newErrors.userType = error;
        }
        break;
      case 2:
        if (formValues.userType === ProfileType.AFFECTED) {
          ["addressType", "addressStreet", "addressCity", "addressState", "addressZip"].forEach((name) => {
            error = validateField(name, formValues[name]);

            if (error) {
              newErrors[name] = error;
            }
          });
        }
        break;
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      if (activeStep === steps.length - 1) {
        await handleSubmit();
      } else {
        setActiveStep((prev) => prev + 1);
      }
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleSubmit = async (event?: FormEvent<HTMLFormElement>): Promise<void> => {
    event?.preventDefault();

    const fieldsToValidate = ["displayName", "phoneNumber", "userType"];

    if (formValues.userType === ProfileType.AFFECTED) {
      fieldsToValidate.push("addressStreet", "addressCity", "addressState", "addressZip");
    }

    const newErrors: { [key: string]: string } = {};

    fieldsToValidate.forEach((name) => {
      const error = validateField(name, formValues[name]);

      if (error) {
        newErrors[name] = error;
      }
    });

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      try {
        const data: ProfileUser = {
          uid: formValues.uid,
          displayName: formValues.displayName,
          email: formValues.email,
          phoneNumber: formValues.phoneNumber,
          type: formValues.userType as ProfileType,
          ...(formValues.userType === ProfileType.AFFECTED && {
            address: {
              type: AddressType.DROPOFF,
              street: formValues.addressStreet,
              city: formValues.addressCity,
              state: formValues.addressState as State,
              zip: formValues.addressZip,
              position: {
                latitude: 0,
                longitude: 0,
              },
            },
          }),
        };

        createUser(data);
        handleSuccess(data);
      } catch (error) {
        toast.error("Oops. Something went wrong while saving your profile: " + error);
      }
    }
  };

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const prevValue = formValues.phoneNumber || "";

    setErrors((prev) => ({ ...prev, phoneNumber: "" }));

    if (value === "" || value.length === 1) {
      setFormValues({ ...formValues, phoneNumber: formatPhoneNumber(value) });
      return;
    }

    if (value.length < prevValue.length) {
      const cleaned = prevValue.replace(/\D/g, "").slice(0, -1);
      setFormValues({ ...formValues, phoneNumber: formatPhoneNumber(cleaned) });
      return;
    }

    setFormValues({ ...formValues, phoneNumber: formatPhoneNumber(value) });
  };

  const handleKeyDown = async (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();

      await handleNext();
    }
  };

  const handleSuccess = (data: ProfileUser) => {
    setIsSuccess(true);
    setCountdown(3);

    setTimeout(() => {
      dispatch(setUserState({ ...data, hasProfile: true }));
      navigate("/map");
    }, 3000);
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Box
            component="form"
            autoComplete="on"
            sx={{ display: "flex", flexDirection: "column", width: "100%", gap: 2 }}
          >
            <Typography
              component="legend"
              sx={{
                border: 0,
                clip: "rect(0 0 0 0)",
                height: "1px",
                margin: -1,
                overflow: "hidden",
                padding: 0,
                position: "absolute",
                whiteSpace: "nowrap",
                width: "1px",
              }}
            >
              Basic Information
            </Typography>
            <TextField
              autoFocus
              required
              fullWidth
              id="displayName"
              type="text"
              name="displayName"
              label="Display Name"
              placeholder="John D."
              autoComplete="username"
              variant="outlined"
              error={!!errors.displayName}
              helperText={errors.displayName || ""}
              color={!!errors.displayName ? "error" : "primary"}
              value={formValues.displayName}
              onChange={handleChange}
              onBlur={handleBlur}
              aria-describedby={errors.displayName ? "displayName-error" : undefined}
              slotProps={{
                input: {
                  "aria-label": "Display Name",
                  "aria-invalid": !!errors.displayName,
                },
              }}
              onKeyDown={async (e: KeyboardEvent<HTMLDivElement>) => await handleKeyDown(e)}
            />
            <TextField
              required
              fullWidth
              id="phoneNumber"
              type="tel"
              name="phoneNumber"
              label="Phone Number"
              placeholder="(123) 456-7890"
              autoComplete="tel"
              variant="outlined"
              error={!!errors.phoneNumber}
              helperText={errors.phoneNumber || ""}
              color={!!errors.phoneNumber ? "error" : "primary"}
              value={formValues.phoneNumber}
              onChange={handlePhoneNumberChange}
              onBlur={handleBlur}
              aria-describedby={errors.phoneNumber ? "phoneNumber-error" : undefined}
              slotProps={{
                input: {
                  "aria-label": "Phone Number",
                  "aria-invalid": !!errors.phoneNumber,
                },
              }}
              onKeyDown={async (e: KeyboardEvent<HTMLDivElement>) => await handleKeyDown(e)}
            />
          </Box>
        );
      case 1:
        return (
          <FormControl component="fieldset" sx={{ mt: 2 }} required error={!!errors.userType}>
            <FormLabel id="user-type-label">I am:</FormLabel>
            <RadioGroup
              value={formValues.userType || ""}
              name="userType"
              onChange={handleChange}
              aria-labelledby="user-type-label"
              aria-describedby={errors.userType ? "userType-error" : undefined}
            >
              <FormControlLabel
                value={ProfileType.VOLUNTEER}
                control={<Radio />}
                label="A volunteer - I want to help others in need"
                autoFocus
              />
              <FormControlLabel
                value={ProfileType.AFFECTED}
                control={<Radio />}
                label="Affected by a disaster - I need assistance"
              />
            </RadioGroup>
            {errors.userType && (
              <Typography color="error" variant="caption" sx={{ mt: 1 }} id="userType-error">
                {errors.userType}
              </Typography>
            )}
          </FormControl>
        );
      case 2:
        return (
          <Box sx={{ display: "flex", flexDirection: "column", width: "100%", gap: 2 }}>
            <Typography
              component="legend"
              sx={{
                border: 0,
                clip: "rect(0 0 0 0)",
                height: "1px",
                margin: -1,
                overflow: "hidden",
                padding: 0,
                position: "absolute",
                whiteSpace: "nowrap",
                width: "1px",
              }}
            >
              Address Information
            </Typography>
            <TextField
              required
              fullWidth
              id="addressStreet"
              type="text"
              name="addressStreet"
              label="Street Address"
              placeholder="123 Main St."
              autoComplete="street-address"
              variant="outlined"
              error={!!errors.addressStreet}
              helperText={errors.addressStreet || ""}
              color={!!errors.addressStreet ? "error" : "primary"}
              value={formValues.addressStreet}
              onChange={handleChange}
              onBlur={handleBlur}
              aria-describedby={errors.addressStreet ? "addressStreet-error" : undefined}
              slotProps={{
                input: {
                  "aria-label": "Street Address",
                  "aria-invalid": !!errors.addressStreet,
                },
              }}
              onKeyDown={async (e: KeyboardEvent<HTMLDivElement>) => await handleKeyDown(e)}
            />
            <TextField
              required
              fullWidth
              id="addressCity"
              type="text"
              name="addressCity"
              label="City"
              placeholder="New York"
              autoComplete="address-level2"
              variant="outlined"
              error={!!errors.addressCity}
              helperText={errors.addressCity || ""}
              color={!!errors.addressCity ? "error" : "primary"}
              value={formValues.addressCity}
              onChange={handleChange}
              onBlur={handleBlur}
              aria-describedby={errors.addressCity ? "addressCity-error" : undefined}
              slotProps={{
                input: {
                  "aria-label": "City",
                  "aria-invalid": !!errors.addressCity,
                },
              }}
              onKeyDown={async (e: KeyboardEvent<HTMLDivElement>) => await handleKeyDown(e)}
            />
            <TextField
              required
              fullWidth
              id="addressState"
              type="text"
              name="addressState"
              label="State"
              placeholder="NY"
              autoComplete="address-level1"
              variant="outlined"
              error={!!errors.addressState}
              helperText={errors.addressState || ""}
              color={!!errors.addressState ? "error" : "primary"}
              value={formValues.addressState}
              onChange={handleChange}
              onBlur={handleBlur}
              aria-describedby={errors.addressState ? "addressState-error" : undefined}
              slotProps={{
                input: {
                  "aria-label": "State",
                  "aria-invalid": !!errors.addressState,
                },
              }}
              onKeyDown={async (e: KeyboardEvent<HTMLDivElement>) => await handleKeyDown(e)}
            />
            <TextField
              required
              fullWidth
              id="addressZip"
              type="text"
              name="addressZip"
              label="ZIP Code"
              placeholder="12345"
              autoComplete="postal-code"
              variant="outlined"
              error={!!errors.addressZip}
              helperText={errors.addressZip || ""}
              color={!!errors.addressZip ? "error" : "primary"}
              value={formValues.addressZip}
              onChange={handleChange}
              onBlur={handleBlur}
              aria-describedby={errors.addressZip ? "addressZip-error" : undefined}
              slotProps={{
                input: {
                  "aria-label": "ZIP Code",
                  "aria-invalid": !!errors.addressZip,
                },
              }}
              onKeyDown={async (e: KeyboardEvent<HTMLDivElement>) => await handleKeyDown(e)}
            />
          </Box>
        );
      default:
        return null;
    }
  };

  useEffect(() => {
    if (countdown !== null) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);

      return () => clearTimeout(timer);
    }
  }, [countdown]);

  return (
    <StackContainer>
      <StyledCard variant="outlined">
        <Typography variant="h4" align="center" gutterBottom component="h1">
          Welcome to ReliefHub!
        </Typography>
        <Typography variant="body1" align="center" sx={{ mb: 4 }} component="p">
          Let's get your profile set up
        </Typography>

        <Stepper activeStep={activeStep} sx={{ mb: 4 }} aria-label="Profile setup progress">
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {renderStepContent()}

        <Box
          component="form"
          sx={{ display: "flex", justifyContent: "space-between", mt: 4 }}
          onSubmit={async (e: FormEvent<HTMLFormElement>) => await handleSubmit(e)}
          aria-label="Profile setup form"
          autoComplete="off"
        >
          <Button disabled={activeStep === 0} onClick={handleBack} aria-label="Back to previous step">
            Back
          </Button>
          <Button
            variant="contained"
            onClick={handleNext}
            disabled={isCreatingUser}
            aria-label={activeStep === steps.length - 1 ? "Finish profile setup" : "Continue to next step"}
          >
            {isCreatingUser ? <CircularProgress size={24} /> : activeStep === steps.length - 1 ? "Finish" : "Next"}
          </Button>
        </Box>
      </StyledCard>
      {isSuccess && <SuccessModal countdown={countdown} />}
    </StackContainer>
  );
};
