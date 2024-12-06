import { Home } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "./button";

const HomeButton = () => {
  const navigate = useNavigate();

  return (
    <Button
      variant="ghost"
      size="icon"
      className="absolute top-4 left-4 z-50 bg-background/50 backdrop-blur-sm hover:bg-background/70"
      onClick={() => navigate("/")}
    >
      <Home className="h-5 w-5" />
    </Button>
  );
};

export default HomeButton;
