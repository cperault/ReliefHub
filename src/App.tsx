import "./Auth/config";
import { AppProvider } from "@toolpad/core/react-router-dom";
import { House, Map, LockPerson } from "@mui/icons-material";
import { DashboardLayout } from "@toolpad/core/DashboardLayout";
import { ReliefMap } from "./components/ReliefMap/ReliefMap";
import { SignInOut } from "./components/SignInOut/SignInOut";
import NotFound from "./components/UhOh/NotFound";
import appIcon from "/reliefhub-icon.png";
import { AuthProvider, useAuth } from "./Auth/AuthContext";
import { Route, Routes } from "react-router-dom";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { About } from "./components/About/About";
import { SignUp } from "./Auth/SignUp";

export const App = () => {
  const auth = useAuth();
  console.log(auth);
  const isLoggedIn = auth === undefined ? false : true;

  const appProviderNavigationItems = [
    {
      segment: "sign-in-out",
      title: `Sign ${isLoggedIn ? "Out" : "In"}`,
      icon: <LockPerson />,
    },
    {
      segment: "about",
      title: "About",
      icon: <InfoOutlinedIcon />,
    },
    ...(isLoggedIn
      ? [
          {
            segment: "map",
            title: "Relief Map",
            icon: <Map />,
          },
        ]
      : []),
  ];

  return (
    <AuthProvider>
      <AppProvider
        branding={{
          logo: <img src={appIcon} alt="icon of world with pinpoints" />,
          title: "ReliefHub",
          homeUrl: "/sign-in-out",
        }}
        navigation={appProviderNavigationItems}
      >
        <DashboardLayout>
          <Routes>
            <Route path="/map" element={<ReliefMap />} />
            <Route path="/about" element={<About />} />
            <Route
              path="/sign-in"
              element={<SignInOut isLoggedIn={isLoggedIn} />}
            />
            <Route path="/sign-up" element={<SignUp />} />
            <Route
              path="/sign-in-out"
              element={<SignInOut isLoggedIn={isLoggedIn} />}
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </DashboardLayout>
      </AppProvider>
    </AuthProvider>
  );
};
