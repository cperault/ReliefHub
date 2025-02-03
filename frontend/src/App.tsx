import {
  MapOutlined,
  LoginOutlined,
  LogoutOutlined,
  AccountCircleOutlined,
  MailOutlined,
  SettingsOutlined,
} from "@mui/icons-material";
import { ReliefMap } from "./components/ReliefMap/ReliefMap";
import NotFound from "./components/UhOh/NotFound";
import appIcon from "/reliefhub-icon.png";
import { useAuth } from "./hooks/useAuth";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { About } from "./components/About/About";
import { SignUp } from "./components/SignUp/SignUp";
import { useSelector } from "react-redux";
import { RootState } from "./state/store";
import { Profile } from "./components/Profile/Profile";
import { Inbox } from "./components/Inbox/Inbox";
import { Settings } from "./components/Settings/Settings";
import { AppBar, Box, Button, IconButton, Toolbar, Tooltip } from "@mui/material";
import { SignIn } from "./components/SignIn/SignIn";
import { ProfileSetup } from "./components/Profile/ProfileSetup";
import { UserProfileProvider } from "./providers/UserProfileProvider";

export const App = () => {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const user = useSelector((state: RootState) => state.user);
  const userHasProfileSetUp = user.hasProfile;
  const { logout } = useAuth();
  const navigate = useNavigate();

  const toolbarIcons = [
    { icon: <AccountCircleOutlined />, label: "Profile", path: "/profile" },
    { icon: <MailOutlined />, label: "Inbox", path: "/inbox" },
    { icon: <MapOutlined />, label: "Relief Map", path: "/map" },
    { icon: <SettingsOutlined />, label: "Settings", path: "/settings" },
  ];

  const handleToolbarIconClick = (path: string) => {
    if (!userHasProfileSetUp) {
      navigate("/profile-setup");
      return;
    }

    navigate(path);
  };

  const handleSignInOutToolbarIconClick = async (): Promise<void> => {
    if (isAuthenticated) {
      await logout();
    } else {
      navigate("/sign-in");
    }
  };

  const SignInOutButton = () => {
    const tooltipKey = isAuthenticated ? "sign-out" : "sign-in";
    const tooltipTitle = isAuthenticated ? "Sign Out" : "Sign In";
    const buttonIcon = isAuthenticated ? <LogoutOutlined /> : <LoginOutlined />;

    return (
      <Tooltip key={tooltipKey} title={tooltipTitle}>
        <Button color="inherit" onClick={async () => handleSignInOutToolbarIconClick()}>
          {buttonIcon}
        </Button>
      </Tooltip>
    );
  };

  return (
    <Box sx={{ margin: -1 }}>
      <AppBar position="relative">
        <Toolbar>
          <img src={appIcon} alt="icon of world with pinpoints" style={{ width: 35, height: 30, padding: 10 }} />
          <Box sx={{ display: "flex", flexGrow: 1 }}>
            <Button
              color="inherit"
              onClick={() => navigate(isAuthenticated ? "/map" : "/sign-in")}
              style={{ fontSize: "1.25rem", textTransform: "none" }}
            >
              ReliefHub
            </Button>
          </Box>
          {isAuthenticated && (
            <>
              {toolbarIcons.map((item) => (
                <Tooltip key={item.label} title={item.label}>
                  <IconButton color="inherit" onClick={() => handleToolbarIconClick(item.path)} aria-label={item.label}>
                    {item.icon}
                  </IconButton>
                </Tooltip>
              ))}

              <SignInOutButton />
            </>
          )}
          {!isAuthenticated && <SignInOutButton />}
        </Toolbar>
      </AppBar>
      <UserProfileProvider>
        <Routes>
          {/* Root redirect */}
          <Route path="/" element={<Navigate to={isAuthenticated ? "/map" : "/sign-in"} />} />

          {/* Authentication routes - redirect if already authenticated */}
          <Route
            path="/sign-in"
            element={
              isAuthenticated ? (
                userHasProfileSetUp ? (
                  <Navigate to="/map" replace />
                ) : (
                  <Navigate to="/profile-setup" replace />
                )
              ) : (
                <SignIn />
              )
            }
          />
          <Route path="/sign-up" element={isAuthenticated ? <Navigate to="/profile" replace /> : <SignUp />} />

          {/* Profile setup - requires auth, redirects if already completed */}
          <Route
            path="/profile-setup"
            element={
              isAuthenticated ? (
                userHasProfileSetUp ? (
                  <Navigate to="/map" replace />
                ) : (
                  <ProfileSetup />
                )
              ) : (
                <Navigate to="/sign-in" replace />
              )
            }
          />

          {/* Protected routes - require auth and completed profile */}
          <Route
            path="/profile"
            element={
              isAuthenticated ? (
                userHasProfileSetUp ? (
                  <Profile />
                ) : (
                  <Navigate to="/profile-setup" replace />
                )
              ) : (
                <Navigate to="/sign-in" replace />
              )
            }
          />
          <Route
            path="/map"
            element={
              isAuthenticated ? (
                userHasProfileSetUp ? (
                  <ReliefMap />
                ) : (
                  <Navigate to="/profile-setup" replace />
                )
              ) : (
                <Navigate to="/sign-in" />
              )
            }
          />
          <Route
            path="/inbox"
            element={
              isAuthenticated ? (
                userHasProfileSetUp ? (
                  <Inbox />
                ) : (
                  <Navigate to="/profile-setup" replace />
                )
              ) : (
                <Navigate to="/sign-in" />
              )
            }
          />
          <Route
            path="/settings"
            element={
              isAuthenticated ? (
                userHasProfileSetUp ? (
                  <Settings />
                ) : (
                  <Navigate to="/profile-setup" replace />
                )
              ) : (
                <Navigate to="/sign-in" />
              )
            }
          />

          {/* Public routes - accessible to all */}
          <Route path="/about" element={<About />} />

          {/* 404 route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </UserProfileProvider>
    </Box>
  );
};
