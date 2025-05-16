"use client";

import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { auth, db } from "@/firebase/client";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { FcGoogle } from "react-icons/fc";
import { Button } from "@/components/ui/button";
import { signIn, signUp } from "@/lib/actions/auth.action";
import { setDoc, doc, getDoc, serverTimestamp } from "firebase/firestore";
import { generateTotpSecret, getTotpQrCodeDataURL } from "@/lib/totp";

const AuthForm = ({ type }: { type: FormType }) => {
  const router = useRouter();
  const isSignIn = type === "sign-in";

  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const idToken = await user.getIdToken();

      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      const userData = userSnap.exists() ? userSnap.data() : null;

      await setDoc(userRef, {
        uid: user.uid,
        name: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
        lastLogin: serverTimestamp(),
      }, { merge: true });

      if (type === "sign-up") {
        const response = await signUp({
          uid: user.uid,
          name: user.displayName || "",
          email: user.email || "",
          password: "",
          photoURL: user.photoURL || "",
        });

        if (!response.success) {
          toast.error(response.message);
          return;
        }

        toast.success("Account created successfully. Please sign in.");
        router.push("/sign-in");
        return;
      }

      if (!userData?.totpSecret) {
        const { base32, otpauth_url } = generateTotpSecret(user.email || "");
        const qrCode = await getTotpQrCodeDataURL(otpauth_url);

        await setDoc(userRef, { totpSecret: base32 }, { merge: true });

        sessionStorage.setItem("totpQr", qrCode);
        sessionStorage.setItem("uid", user.uid);

        router.push("/2fa");
        return;
      }

      await signIn({
        email: user.email!,
        idToken,
      });

      toast.success("Signed in successfully.");
      router.push("/");
    } catch (error) {
      console.error(error);
      toast.error("Google sign-in failed. Try again.");
    }
  };

  return (
    <div className="card-border lg:min-w-[566px]">
      <div className="flex flex-col gap-6 card py-14 px-10 items-center">
        <div className="flex flex-row gap-2 justify-center">
          <Image src="/logo.png" alt="logo" height={32} width={38} />
          <h2 className="text-primary-100">Evalix</h2>
        </div>

        <h3>Practice job interviews with AI</h3>

        <Button className="btn mt-4 cursor-pointer" onClick={handleGoogleSignIn}>
          {isSignIn ? "Sign In with" : "Sign Up with"} <FcGoogle />
        </Button>

        <p className="text-center">
          {isSignIn ? "No account yet?" : "Have an account already?"}
          <Link
            href={!isSignIn ? "/sign-in" : "/sign-up"}
            className="font-bold text-user-primary ml-1"
          >
            {!isSignIn ? "Sign In" : "Sign Up"}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default AuthForm;
