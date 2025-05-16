"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { auth } from "@/firebase/client";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";

const Page = () => {
  const [code, setCode] = useState("");
  const [qr, setQr] = useState("");
  const router = useRouter();

  useEffect(() => {
    const storedQr = sessionStorage.getItem("totpQr");
    if (storedQr) setQr(storedQr);
  }, []);

  const handleSubmit = async () => {
    const uid = sessionStorage.getItem("uid");
    if (!uid) {
      toast.error("UID missing from session.");
      return;
    }

    if (code.length !== 6) {
      toast.error("Please enter the full 6-digit code.");
      return;
    }

    const res = await fetch("/api/verify-totp", {
      method: "POST",
      body: JSON.stringify({ code, uid }),
    });

    if (!res.ok) {
      toast.error("Invalid code");
      return;
    }

    try {
      const user = auth.currentUser;
      if (!user) {
        toast.error("User not authenticated.");
        return;
      }

      const idToken = await user.getIdToken();

      const loginRes = await fetch("/api/session-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });

      if (!loginRes.ok) {
        toast.error("Failed to create session.");
        return;
      }

      toast.success("2FA verified and logged in.");
      sessionStorage.removeItem("totpQr");
      sessionStorage.removeItem("uid");

      router.push("/");
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while completing login.");
    }
  };

  return (
    <>
      <div className="flex flex-col items-center justify-center min-h-screen px-4">
        <div className="border border-[#3f3f3f] rounded-lg p-8 flex flex-col items-center gap-8 max-w-xl w-full">
          <h2 className="text-4xl text-primary-100 font-bold text-center">
            Scan QR Code with <br/> <span className="text-6xl">Authenticator</span>
          </h2>

          {qr && (
            <img
              src={qr}
              alt="QR Code"
              className="w-84 h-84 border border-gray-300 rounded-sm"
              draggable={false}
            />
          )}

          <InputOTP
            maxLength={6}
            className="caret-blink"
            onChange={setCode}
          >
            <InputOTPGroup>
              <InputOTPSlot index={0}/>
              <InputOTPSlot index={1}/>
              <InputOTPSlot index={2}/>
            </InputOTPGroup>
            <InputOTPSeparator />
            <InputOTPGroup>
              <InputOTPSlot index={3}/>
              <InputOTPSlot index={4}/>
              <InputOTPSlot index={5}/>
            </InputOTPGroup>
          </InputOTP>

          <button
            onClick={handleSubmit}
            className="btn-primary"
            disabled={code.length !== 6}
          >
            Verify
          </button>
        </div>
      </div>
    </>
  );
};

export default Page;
