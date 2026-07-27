import { useState } from "react";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { Input } from "@elproject/ui";
import { CustomButton } from "../components/CustomButton";
import { useAuth } from "../hooks/useAuth";

export function LoginPage() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMsg("");
    const { error } = await signIn(email, password);

    if (error) {
      setErrorMsg(error);
      setIsSubmitting(false);
      return;
    }

    // Berhasil login → redirect ke dashboard
    window.location.hash = "#/dashboard";
    setIsSubmitting(false);
  };

  // Using standard brand colors for sistem-antrean (orange-500)

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `url('${import.meta.env.BASE_URL}bg_tv.png')`
      }}
    >
      {/* Decorative background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-white/5 blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-black/20 blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-[420px] relative z-10">
        <div className="relative group mt-4">
          {/* Subtle glow behind card */}
          <div className="absolute -inset-1 bg-gradient-to-r from-white/20 to-white/0 rounded-3xl blur opacity-30 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>

          <div className="relative w-full bg-gradient-to-br from-orange-500/70 to-orange-700/70 backdrop-blur-2xl rounded-3xl border border-white/20 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] p-6 sm:p-8 flex flex-col items-center justify-center">

            <div className="text-center mb-8 w-full">
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-widest drop-shadow-lg">SISTEM ANTREAN</h1>

            </div>

            <form onSubmit={handleSubmit} className="space-y-1 w-full">
              {errorMsg && (
                <div className="rounded-xl bg-red-500/20 border border-red-400/30 px-3 py-2 text-xs font-semibold text-white text-center">
                  {errorMsg}
                </div>
              )}

              <div className="space-y-3 pb-2 pt-2">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-white/90 ml-1">Email Aktif</label>
                  <div className="relative group/input">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-orange-400 group-focus-within/input:text-orange-600 transition-colors duration-300" />
                    <Input
                      type="email"
                      placeholder="email@anda.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full h-9 text-xs pl-9 bg-orange-100 border-orange-300/50 text-orange-950 placeholder:text-orange-500/60 rounded-xl focus:bg-orange-50 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/20 focus-visible:ring-0 focus-visible:border-orange-500 focus-visible:ring-offset-0 transition-all duration-300"
                      autoComplete="email"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-white/90 ml-1">Password</label>
                  <div className="relative group/input">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-orange-400 group-focus-within/input:text-orange-600 transition-colors duration-300" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Password Anda"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full h-9 text-xs pl-9 pr-10 bg-orange-100 border-orange-300/50 text-orange-950 placeholder:text-orange-500/60 rounded-xl focus:bg-orange-50 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/20 focus-visible:ring-0 focus-visible:border-orange-500 focus-visible:ring-offset-0 transition-all duration-300"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-orange-400 hover:text-orange-600 transition-colors"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              <CustomButton
                type="submit"
                variant="primary"
                className="w-full mt-5 h-9 text-xs"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Memproses..." : "Login"}
              </CustomButton>
            </form>

            <div className="mt-4 text-center w-full">
              <p className="text-white/70 text-sm mb-4">
                Belum punya akun?{" "}
                <a href="#/register" className="text-white font-semibold hover:underline hover:text-white/90 transition-colors cursor-pointer">
                  Daftar sekarang
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
