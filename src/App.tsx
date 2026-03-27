import { BrowserRouter, Route, Routes } from "react-router";
import Layout from "./components/layout/Layout";
import IndexPage from "@/pages/index/IndexPage";
import FourOhFourPage from "@/pages/404";
// import { cn } from "./lib/utils";

function App() {
  return (
    // The red background only shows if backgrounds are not properly set.
    // This is a visual indicator that the CSS is not being applied.
    // <div className={cn("font-(family-name:--font-family-title)", "bg-red-800 dark")}>
    <div className="font-(family-name:--font-family-title) bg-red-800 dark max-h-screen">
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<IndexPage />} />
            <Route path="*" element={<FourOhFourPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
