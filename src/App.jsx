import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { PlayerProvider } from "./context/PlayerContext";
import Layout from "./components/Layout";
import Library from "./pages/Library";
import NowPlaying from "./pages/NowPlaying";

export default function App() {
  return (
    <BrowserRouter>
      <PlayerProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Navigate to="/library" replace />} />
            <Route path="/library" element={<Library />} />
            <Route path="/now-playing" element={<NowPlaying />} />
          </Route>
        </Routes>
      </PlayerProvider>
    </BrowserRouter>
  );
}
