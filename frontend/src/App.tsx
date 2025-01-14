import { MenuOutlined, MapOutlined, LoginOutlined, LogoutOutlined, AccountCircleOutlined, MailOutlined, SettingsOutlined } from "@mui/icons-material";
import { ReliefMap } from "./components/ReliefMap/ReliefMap";
import NotFound from "./components/UhOh/NotFound";
import appIcon from "/reliefhub-icon.png";
import { useAuth } from "./Auth/useAuth";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { About } from "./components/About/About";
import { SignUp } from "./Auth/SignUp";
import { useSelector } from "react-redux";
import { RootState } from "./store";
import { Profile } from "./components/Profile/Profile";
import { Inbox } from "./components/Inbox/Inbox";
import { Settings } from "./components/Settings/Settings";
import { AppBar, Box, Button, Drawer, IconButton, List, ListItem, ListItemText, Toolbar, Tooltip } from "@mui/material";
import { useState } from "react";
import { SignIn } from "./Auth/SignIn";

export const App = () => {
  const isLoggedIn = useSelector((state: RootState) => state.auth.isAuthenticated);
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const toolbarIcons = [
    { icon: <AccountCircleOutlined />, label: "Profile", path: "/profile" },
    { icon: <MailOutlined />, label: "Inbox", path: "/inbox" },
    { icon: <MapOutlined />, label: "Relief Map", path: "/map" },
    { icon: <SettingsOutlined />, label: "Settings", path: "/settings" },
  ];

  const handleToolbarIconClick = (path: string) => {
    setDrawerOpen(false);
    navigate(path);
  };

  const handleSignInOutToolbarIconClick = async (): Promise<void> => {
    setDrawerOpen(false);

    if (isLoggedIn) {
      await logout();
    } else {
      navigate("/sign-in");
    }
  };

  const SignInOutButton = () => {
    const tooltipKey = isLoggedIn ? "sign-out" : "sign-in";
    const tooltipTitle = isLoggedIn ? "Sign Out" : "Sign In";
    const buttonIcon = isLoggedIn ? <LogoutOutlined /> : <LoginOutlined />;

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
          <IconButton color="inherit" aria-label="menu" onClick={() => setDrawerOpen(true)} sx={{ display: { xs: "flex", sm: "none" } }}>
            <MenuOutlined />
          </IconButton>
          <img src={appIcon} alt="icon of world with pinpoints" style={{ width: 35, height: 30, padding: 10 }} />
          <Box sx={{ display: "flex", flexGrow: 1 }}>
            <Button color="inherit" onClick={() => navigate(isLoggedIn ? "/map" : "/sign-in")} style={{ fontSize: "1.25rem", textTransform: "none" }}>
              ReliefHub
            </Button>
          </Box>
          {isLoggedIn && (
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
          {!isLoggedIn && <SignInOutButton />}
        </Toolbar>
      </AppBar>

      <Drawer anchor="left" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <List>
          {isLoggedIn &&
            toolbarIcons.map((item) => (
              <ListItem key={item.label} onClick={() => handleToolbarIconClick(item.path)}>
                <ListItemText primary={item.label} />
              </ListItem>
            ))}
          <ListItem onClick={async () => handleSignInOutToolbarIconClick()}>
            <ListItemText primary={isLoggedIn ? "Sign Out" : "Sign In"} />
          </ListItem>
        </List>
      </Drawer>
      <Routes>
        <Route path="/map" element={isLoggedIn ? <ReliefMap /> : <Navigate to="/sign-in" />} />
        <Route path="/about" element={<About />} />
        <Route path="/inbox" element={isLoggedIn ? <Inbox /> : <Navigate to="/sign-in" />} />
        <Route path="/profile" element={isLoggedIn ? <Profile /> : <Navigate to="/sign-in" />} />
        <Route path="/settings" element={isLoggedIn ? <Settings /> : <Navigate to="/sign-in" />} />
        <Route path="/sign-in" element={isLoggedIn ? <ReliefMap /> : <SignIn />} />
        <Route path="/sign-up" element={<SignUp />} />
        <Route path="/" element={<Navigate to={isLoggedIn ? "/map" : "/sign-in"} />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Box>
  );
};
