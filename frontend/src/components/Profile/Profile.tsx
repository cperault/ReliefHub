import { useState, FocusEvent } from "react";
import { Typography, Box, Avatar, Button, Divider, IconButton, TextField, Chip, Grid2, Tooltip } from "@mui/material";
import { Edit as EditIcon } from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/state/store";
import { StyledCard } from "../Shared/StyledCard";
import { StackContainer } from "../Shared/StackContainer";
import { useUserProfile } from "@/hooks/useUserProfile";
import { ProfileType, setUserState } from "@/state/user/userSlice";
import { toast } from "react-toastify";
import { useFormValidation } from "@/hooks/useFormValidation";
import { ProfileUser } from "@/services/api";

type FormErrors = {
  displayName?: string;
  email?: string;
  phoneNumber?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
  };
};

export const Profile = () => {
  const user = useSelector((state: RootState) => state.user);
  const [errors, setErrors] = useState<FormErrors>({});
  const { validateField } = useFormValidation();
  const [isEditing, setIsEditing] = useState(false);
  const [editedValues, setEditedValues] = useState({
    displayName: user.displayName,
    phoneNumber: user.phoneNumber,
    email: user.email,
    address: {
      street: user.address?.street,
      city: user.address?.city,
      state: user.address?.state,
      zip: user.address?.zip,
    },
  });

  const { updateUser, isUpdatingUser } = useUserProfile();
  const dispatch = useDispatch();

  const handleEdit = () => {
    setIsEditing(true);
    setEditedValues({
      displayName: user.displayName,
      phoneNumber: user.phoneNumber,
      email: user.email,
      address: {
        street: user.address?.street,
        city: user.address?.city,
        state: user.address?.state,
        zip: user.address?.zip,
      },
    });
  };

  const handleBlur = (event: FocusEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    const newErrors: FormErrors = { ...errors };

    if (name.startsWith("address.")) {
      const [, field] = name.split(".");
      const error = validateField(name, value || "");

      if (error) {
        if (!newErrors.address) {
          newErrors.address = {};
        }

        newErrors.address[field as keyof typeof newErrors.address] = error;
      } else if (newErrors.address) {
        delete newErrors.address[field as keyof typeof newErrors.address];

        if (Object.keys(newErrors.address).length === 0) {
          delete newErrors.address;
        }
      }
    } else {
      const error = validateField(name, value || "");

      if (error) {
        newErrors[name as keyof typeof newErrors] = error;
      } else {
        delete newErrors[name as keyof typeof newErrors];
      }
    }

    setErrors(newErrors);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedValues({
      displayName: user.displayName,
      phoneNumber: user.phoneNumber,
      email: user.email,
      address: {
        street: user.address?.street,
        city: user.address?.city,
        state: user.address?.state,
        zip: user.address?.zip,
      },
    });
    setErrors({});
  };

  const handleSave = async () => {
    const fieldsToValidate = ["displayName", "phoneNumber", "email"];
    const addressFieldsToValidate = ["street", "city", "state", "zip"];

    const newErrors: { [key: string]: string } = {};

    fieldsToValidate.forEach((name) => {
      const value = editedValues[name as keyof typeof editedValues];
      const error = validateField(name, value as string);

      if (error) {
        newErrors[name] = error;
      }
    });

    if (user.type === ProfileType.AFFECTED) {
      addressFieldsToValidate.forEach((field) => {
        const value = editedValues.address[field as keyof typeof editedValues.address];
        const error = validateField(`address.${field}`, value || "");

        if (error) {
          newErrors[`address.${field}`] = error;
        }
      });
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    const updatedFields: Partial<ProfileUser> = {};

    fieldsToValidate.forEach((field) => {
      const value = editedValues[field as keyof typeof editedValues];
      const origValue = user[field as keyof typeof user];

      if (typeof value === "string" && typeof origValue === "string") {
        const trimmedNew = value.trim();
        const trimmedOrig = origValue.trim();

        if (trimmedNew !== trimmedOrig) {
          (updatedFields as any)[field] = trimmedNew;
        }
      } else if (value !== origValue && value !== undefined) {
        (updatedFields as any)[field] = value;
      }
    });

    if (user.type === ProfileType.AFFECTED && user.address) {
      const getChangedFields = (newObj: any, origObj: any): any => {
        const changes: any = {};

        Object.keys(newObj || {}).forEach((key) => {
          const newValue = newObj[key];
          const origValue = origObj?.[key];

          if (newValue && typeof newValue === "object" && !Array.isArray(newValue)) {
            const nestedChanges = getChangedFields(newValue, origValue);

            if (Object.keys(nestedChanges).length > 0) {
              changes[key] = nestedChanges;
            }
          } else if (typeof newValue === "string" && typeof origValue === "string") {
            const trimmedNew = newValue.trim();
            const trimmedOrig = origValue.trim();

            if (trimmedNew !== trimmedOrig) {
              changes[key] = trimmedNew;
            }
          } else if (newValue !== origValue && newValue !== undefined) {
            changes[key] = newValue;
          }
        });

        return changes;
      };

      const addressChanges = getChangedFields(editedValues.address, user.address);

      if (Object.keys(addressChanges).length > 0) {
        updatedFields.address = addressChanges;
      }
    }

    if (Object.keys(updatedFields).length === 0) {
      setIsEditing(false);
      return;
    }

    try {
      const response = await updateUser({ uid: user.uid, ...updatedFields }).unwrap();
      setIsEditing(false);

      const newUserData = ("user" in response ? response.user : response) as ProfileUser;

      const updatedUser = {
        ...user,
        ...newUserData,
        address: newUserData.address
          ? {
              ...user.address,
              ...newUserData.address,
            }
          : user.address,
      };

      dispatch(setUserState(updatedUser));
      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error("Failed to update profile. Please try again.");
    }
  };

  const handleChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    if (field.startsWith("address.")) {
      const addressField = field.split(".")[1];

      setEditedValues((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: event.target.value,
        },
      }));

      setErrors((prev) => {
        const newErrors = { ...prev };

        if (newErrors.address) {
          delete newErrors.address[addressField as keyof typeof newErrors.address];

          if (Object.keys(newErrors.address).length === 0) {
            delete newErrors.address;
          }
        }

        return newErrors;
      });
    } else {
      setEditedValues((prev) => ({
        ...prev,
        [field]: event.target.value,
      }));

      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field as keyof typeof newErrors];

        return newErrors;
      });
    }
  };

  return (
    <StackContainer>
      <StyledCard variant="outlined">
        <Box sx={{ display: "flex", alignItems: "center", mb: isEditing ? 0 : 3 }}>
          {!isEditing ? (
            <Avatar
              sx={{
                width: 100,
                height: 100,
                bgcolor: "primary.main",
                fontSize: "2.5rem",
              }}
            >
              {user.displayName?.charAt(0)?.toUpperCase() || "U"}
            </Avatar>
          ) : null}
          <Box sx={{ ml: isEditing ? 0 : 3, flex: 1 }}>
            {!isEditing ? (
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Display Name
              </Typography>
            ) : null}
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
              {isEditing ? (
                <TextField
                  required
                  fullWidth
                  id="displayName"
                  type="text"
                  name="displayName"
                  label="Display Name"
                  placeholder="Your Display Name"
                  autoComplete="name"
                  variant="outlined"
                  error={!!errors.displayName}
                  helperText={errors.displayName || ""}
                  color={!!errors.displayName ? "error" : "primary"}
                  value={editedValues.displayName}
                  onChange={handleChange("displayName")}
                  onBlur={handleBlur}
                  aria-describedby={errors.displayName ? "display-name-error" : undefined}
                  slotProps={{
                    input: {
                      "aria-label": "Display Name",
                      "aria-invalid": !!errors.displayName,
                    },
                  }}
                />
              ) : (
                <Typography variant="h4" component="h1">
                  {user.displayName}
                </Typography>
              )}
              {!isEditing && (
                <Tooltip key="edit-profile" title="Edit Profile">
                  <IconButton onClick={handleEdit} size="small" color="primary">
                    <EditIcon />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
            {!isEditing ? (
              <Chip
                label={user.type === ProfileType.VOLUNTEER ? "Volunteer" : "Affected Individual"}
                color={user.type === ProfileType.VOLUNTEER ? "primary" : "secondary"}
                size="small"
              />
            ) : null}
          </Box>
        </Box>

        {!isEditing ? <Divider sx={{ my: 2 }} /> : null}

        <Grid2>
          <Grid2 container rowGap={4}>
            <Grid2 container sx={{ display: "flex", gap: 2, width: "100%" }}>
              <Grid2 sx={{ flexGrow: 1, minWidth: "45%" }}>
                {!isEditing ? (
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Email
                  </Typography>
                ) : null}
                {isEditing ? (
                  <TextField
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
                    value={editedValues.email}
                    onChange={handleChange("email")}
                    onBlur={handleBlur}
                    aria-describedby={errors.email ? "email-error" : undefined}
                    slotProps={{
                      input: {
                        "aria-label": "Email",
                        "aria-invalid": !!errors.email,
                      },
                    }}
                  />
                ) : (
                  <Typography variant="body1" sx={{ display: "flex", alignItems: "center", minHeight: 40 }}>
                    {user.email}
                  </Typography>
                )}
              </Grid2>
              <Grid2 sx={{ flexGrow: 1, minWidth: "45%" }}>
                {!isEditing ? (
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Phone Number
                  </Typography>
                ) : null}
                {isEditing ? (
                  <TextField
                    required
                    fullWidth
                    id="phoneNumber"
                    type="tel"
                    name="phoneNumber"
                    label="Phone Number"
                    placeholder="123-456-7890"
                    autoComplete="tel"
                    variant="outlined"
                    error={!!errors.phoneNumber}
                    helperText={errors.phoneNumber || ""}
                    color={!!errors.phoneNumber ? "error" : "primary"}
                    value={editedValues.phoneNumber}
                    onChange={handleChange("phoneNumber")}
                    onBlur={handleBlur}
                    aria-describedby={errors.phoneNumber ? "phone-number-error" : undefined}
                    slotProps={{
                      input: {
                        "aria-label": "Phone Number",
                        "aria-invalid": !!errors.phoneNumber,
                      },
                    }}
                  />
                ) : (
                  <Typography variant="body1" sx={{ display: "flex", alignItems: "center", minHeight: 40 }}>
                    {user.phoneNumber}
                  </Typography>
                )}
              </Grid2>
            </Grid2>
            {user.type === ProfileType.AFFECTED && user.address && (
              <Grid2>
                <Grid2>
                  {!isEditing ? (
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Location
                    </Typography>
                  ) : null}
                  {isEditing ? (
                    <Grid2 container rowSpacing={2}>
                      <Grid2 flex={12}>
                        <TextField
                          required
                          fullWidth
                          id="address.street"
                          type="text"
                          name="address.street"
                          label="Street Address"
                          placeholder="123 Main St"
                          autoComplete="street-address"
                          variant="outlined"
                          error={!!errors.address?.street}
                          helperText={errors.address?.street || ""}
                          color={!!errors.address?.street ? "error" : "primary"}
                          value={editedValues.address?.street}
                          onChange={handleChange("address.street")}
                          onBlur={handleBlur}
                          aria-describedby={errors.address?.street ? "address-street-error" : undefined}
                          slotProps={{
                            input: {
                              "aria-label": "Street Address",
                              "aria-invalid": !!errors.address?.street,
                            },
                          }}
                        />
                      </Grid2>
                      <Grid2 container spacing={2}>
                        <Grid2 flex={7.05}>
                          <TextField
                            required
                            fullWidth
                            id="address.city"
                            type="text"
                            name="address.city"
                            label="City"
                            placeholder="Anytown"
                            autoComplete="address-level2"
                            variant="outlined"
                            error={!!errors.address?.city}
                            helperText={errors.address?.city || ""}
                            color={!!errors.address?.city ? "error" : "primary"}
                            value={editedValues.address?.city}
                            onChange={handleChange("address.city")}
                            onBlur={handleBlur}
                            aria-describedby={errors.address?.city ? "address-city-error" : undefined}
                            slotProps={{
                              input: {
                                "aria-label": "City",
                                "aria-invalid": !!errors.address?.city,
                              },
                            }}
                          />
                        </Grid2>
                        <Grid2 flex={1.6}>
                          <TextField
                            required
                            fullWidth
                            id="address.state"
                            type="text"
                            name="address.state"
                            label="State"
                            placeholder="CA"
                            autoComplete="state"
                            variant="outlined"
                            error={!!errors.address?.state}
                            helperText={errors.address?.state || ""}
                            color={!!errors.address?.state ? "error" : "primary"}
                            value={editedValues.address?.state}
                            onChange={handleChange("address.state")}
                            onBlur={handleBlur}
                            aria-describedby={errors.address?.state ? "address-state-error" : undefined}
                            slotProps={{
                              input: {
                                "aria-label": "State",
                                "aria-invalid": !!errors.address?.state,
                              },
                            }}
                          />
                        </Grid2>
                        <Grid2 flex={2.21}>
                          <TextField
                            required
                            fullWidth
                            id="address.zip"
                            type="text"
                            name="address.zip"
                            label="ZIP Code"
                            placeholder="12345"
                            autoComplete="postal-code"
                            variant="outlined"
                            error={!!errors.address?.zip}
                            helperText={errors.address?.zip || ""}
                            color={!!errors.address?.zip ? "error" : "primary"}
                            value={editedValues.address?.zip}
                            onChange={handleChange("address.zip")}
                            onBlur={handleBlur}
                            aria-describedby={errors.address?.zip ? "address-zip-error" : undefined}
                            slotProps={{
                              input: {
                                "aria-label": "ZIP Code",
                                "aria-invalid": !!errors.address?.zip,
                              },
                            }}
                          />
                        </Grid2>
                      </Grid2>
                    </Grid2>
                  ) : (
                    <Typography variant="body1">
                      {user.address.street}
                      <br />
                      {user.address.city}, {user.address.state} {user.address.zip}
                    </Typography>
                  )}
                </Grid2>
              </Grid2>
            )}
          </Grid2>
        </Grid2>

        {isEditing && (
          <Box sx={{ display: "flex", gap: 2, mt: 4, justifyContent: "flex-end" }}>
            <Button variant="outlined" onClick={handleCancel} disabled={isUpdatingUser}>
              Cancel
            </Button>
            <Button variant="contained" onClick={handleSave} disabled={isUpdatingUser}>
              Save Changes
            </Button>
          </Box>
        )}
      </StyledCard>
    </StackContainer>
  );
};
