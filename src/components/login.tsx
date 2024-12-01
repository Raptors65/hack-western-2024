import { useAuth0 } from "@auth0/auth0-react";
import { Button } from "@/components/ui/button";

const Login = () => {
  const { loginWithRedirect } = useAuth0();

  return (
    <div className="w-screen h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-8">
        <h1 className="text-4xl font-bold">Workout Mirror</h1>
        <Button size="lg" className="px-8 py-6 text-lg" onClick={() => loginWithRedirect()}>
          Login to Continue
        </Button>
      </div>
    </div>
  )
}

export default Login;