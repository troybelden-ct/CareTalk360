import { useState, useCallback, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface LoginFormState {
  username: string;
  password: string;
}

const Login = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState<LoginFormState>({
    username: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleChange = useCallback(
    (field: keyof LoginFormState) =>
      (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm((prev) => ({ ...prev, [field]: e.target.value }));
      },
    []
  );

  const handleSubmit = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      if (!form.username.trim() || !form.password.trim()) {
        toast({
          title: "You Should enter username and password",
        });
        return;
      }

      setIsLoading(true);

      // Simulated login delay -- replace with real auth later
      await new Promise((resolve) => setTimeout(resolve, 800));

      setIsLoading(false);
      navigate("/dashboard");
    },
    [form.username, form.password, navigate]
  );

  const handleForgotPassword = useCallback(() => {
    if (!form.username.trim()) {
      toast({ title: "username is empty" });
      return;
    }
    toast({ title: "Password reset link sent" });
  }, [form.username]);

  return (
    <div className="relative min-h-screen w-full bg-white">
      {/* Loading overlay */}
      {isLoading && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          role="status"
          aria-label="Signing in"
        >
          <Loader2
            className="h-12 w-12 animate-spin text-white"
            aria-hidden="true"
          />
          <span className="sr-only">Signing in...</span>
        </div>
      )}

      {/* Navy banner */}
      <div
        className="w-full bg-primary"
        style={{ height: "400px" }}
        aria-hidden="true"
      />

      {/* Login card -- overlaps the banner */}
      <div
        className="absolute inset-x-0 top-0 flex justify-center px-0 sm:px-4"
        style={{ paddingTop: "160px" }}
      >
        <div
          className="w-full bg-white border border-black sm:rounded-[3px]"
          style={{
            maxWidth: "550px",
            padding: "20px 35px",
          }}
        >
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <img
              src="/images/logo.jpg"
              alt="CareTalk 360 logo"
              className="object-contain"
              style={{ height: "100px" }}
            />
          </div>

          <form onSubmit={handleSubmit} noValidate>
            {/* Username floating label field */}
            <div className="relative mb-4">
              <input
                id="login-username"
                type="text"
                value={form.username}
                onChange={handleChange("username")}
                placeholder=" "
                autoComplete="username"
                className="peer w-full rounded border border-input bg-background px-3 pb-2 pt-5 text-base text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-ring"
                aria-required="true"
              />
              <label
                htmlFor="login-username"
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-all duration-200 peer-focus:top-2 peer-focus:translate-y-0 peer-focus:text-xs peer-focus:text-primary peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:translate-y-0 peer-[:not(:placeholder-shown)]:text-xs"
              >
                Username
              </label>
            </div>

            {/* Password floating label field */}
            <div className="relative mb-4">
              <input
                id="login-password"
                type="password"
                value={form.password}
                onChange={handleChange("password")}
                placeholder=" "
                autoComplete="current-password"
                className="peer w-full rounded border border-input bg-background px-3 pb-2 pt-5 text-base text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-ring"
                aria-required="true"
              />
              <label
                htmlFor="login-password"
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-all duration-200 peer-focus:top-2 peer-focus:translate-y-0 peer-focus:text-xs peer-focus:text-primary peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:translate-y-0 peer-[:not(:placeholder-shown)]:text-xs"
              >
                Password
              </label>
            </div>

            {/* Footer: forgot password + login button */}
            <div className="flex flex-col items-end gap-2 mt-2">
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-sm underline cursor-pointer bg-transparent border-none p-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
                style={{ color: "#3682e9" }}
              >
                Forgot Password
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="text-sm font-medium text-white bg-primary rounded cursor-pointer border-none transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
                style={{ padding: "5px 60px" }}
              >
                Login
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
