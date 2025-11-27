import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function OtpLogin() {
  const { requestOtp, verifyOtp } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [otp, setOtp] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const sendOtp = async () => {
    try {
      setLoading(true);
      setMsg("");
      await requestOtp(email, name);
      setStep(2);
      setMsg("OTP sent! Check your email.");
    } catch (e) {
      setMsg(e.message);
    } finally {
      setLoading(false);
    }
  };

  const confirmOtp = async () => {
    try {
      setLoading(true);
      setMsg("");
      await verifyOtp(email, otp);
      navigate("/dashboard");
    } catch (e) {
      setMsg(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 bg-base-200 p-6 rounded-xl space-y-4">
      <h1 className="text-2xl font-bold text-center">Login with OTP</h1>

      {msg && <p className="text-center text-info">{msg}</p>}

      {step === 1 && (
        <>
          <input
            className="input input-bordered w-full"
            placeholder="Full Name (optional)"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            className="input input-bordered w-full"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <button
            className="btn btn-primary w-full"
            disabled={!email || loading}
            onClick={sendOtp}
          >
            {loading ? "Sending..." : "Send OTP"}
          </button>
        </>
      )}

      {step === 2 && (
        <>
          <p className="text-sm opacity-70">
            We sent a 6-digit OTP to: <b>{email}</b>
          </p>

          <input
            className="input input-bordered w-full text-center tracking-widest text-lg"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />

          <button
            className="btn btn-primary w-full"
            disabled={!otp || loading}
            onClick={confirmOtp}
          >
            {loading ? "Verifying..." : "Verify & Login"}
          </button>

          <button
            className="btn btn-ghost w-full"
            onClick={() => setStep(1)}
          >
            Change Email
          </button>
        </>
      )}
    </div>
  );
}
