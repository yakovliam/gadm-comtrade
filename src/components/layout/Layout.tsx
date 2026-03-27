import { Outlet } from "react-router";
import Header from "./Header";
import StatusBar from "./StatusBar";

const Layout = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="grow flex">
        <Outlet />
      </div>
      <StatusBar />
    </div>
  );
};

export default Layout;
