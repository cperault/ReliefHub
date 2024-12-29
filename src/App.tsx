import { AppProvider } from "@toolpad/core/react-router-dom";
import { House, Map, LockPerson } from "@mui/icons-material";
import { DashboardLayout } from "@toolpad/core/DashboardLayout";
import { Home } from "./components/Home/Home";
import { ReliefMap } from "./components/ReliefMap/ReliefMap";
import { SignInOut } from "./components/SignInOut/SignInOut";
import { useState } from "react";
import { useDemoRouter } from "@toolpad/core/internal";
import NotFound from "./components/UhOh/NotFound";
import appIcon from "/icon.svg";

const Content = ({
  pathname,
  isLoggedIn,
}: {
  pathname: string;
  isLoggedIn: boolean;
}) => {
  console.log(pathname);
  switch (pathname) {
    case "/home":
      return <Home />;
    case "/map":
      return <ReliefMap />;
    case "/sign-in-out":
      return <SignInOut isLoggedIn={isLoggedIn} />;
    default:
      return <NotFound />;
  }
};

export const App = () => {
  const router = useDemoRouter("/home");
  const [isLoggedIn] = useState(true);

  return (
    <AppProvider
      branding={{
        logo: <img src={appIcon} alt="icon of world with pinpoints" />,
        title: "ReliefHub",
        homeUrl: "/home",
      }}
      navigation={[
        {
          segment: "home",
          title: "Home",
          icon: <House />,
        },
        {
          segment: "map",
          title: "Map",
          icon: <Map />,
        },
        {
          segment: "sign-in-out",
          title: `Sign ${isLoggedIn ? "Out" : "In"}`,
          icon: <LockPerson />,
        },
      ]}
      router={router}
    >
      <DashboardLayout>
        <Content pathname={router.pathname} isLoggedIn={isLoggedIn} />
      </DashboardLayout>
    </AppProvider>
  );
};
