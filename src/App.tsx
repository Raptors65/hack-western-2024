import { Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./components/home";
import VideoContainer from "./components/workout/VideoContainer";
// import GameMode from "./components/game/GameMode";
import Profile from "./components/profile/Profile";
import Preview from "./components/preview";
import Login from "./components/login";
import Logout from "./components/logout";
import routes from "tempo-routes";

function App() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/preview"
          element={<Preview/>}
        />
        <Route path="/login" element={<Login />} />
        <Route path="/logout" element={<Logout />} />
        {/* <Route path="/game" element={<GameMode />} /> */}
        <Route path="/profile" element={<Profile />} />
        {import.meta.env.VITE_TEMPO === "true" && useRoutes(routes)}
      </Routes>
    </Suspense>
  );
}

export default App;
