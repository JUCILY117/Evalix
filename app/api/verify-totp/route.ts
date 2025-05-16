import { NextResponse } from "next/server";
import { verifyTotpToken } from "@/lib/totp";
import { db, auth } from "@/firebase/admin";

export async function POST(req: Request) {
    try {
        const { uid, code } = await req.json();

        if (!uid || !code) {
            console.log("Missing uid or code:", { uid, code });
            return NextResponse.json({ error: "Missing data" }, { status: 400 });
        }

        console.log("Received TOTP verify request for UID:", uid);
        console.log("Code provided:", code);

        const userDocRef = db.collection("users").doc(uid);
        const userDoc = await userDocRef.get();

        if (!userDoc.exists) {
            console.log("User not found:", uid);
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const secret = userDoc.data()?.totpSecret;
        console.log("Stored secret for user:", secret);

        if (!secret) {
            console.log("No TOTP secret found for user:", uid);
            return NextResponse.json({ error: "TOTP secret not set" }, { status: 400 });
        }

        const valid = verifyTotpToken(secret, code);
        console.log("TOTP verification result:", valid);

        if (!valid) {
            return NextResponse.json({ error: "Invalid TOTP" }, { status: 401 });
        }

        const customToken = await auth.createCustomToken(uid);

        return NextResponse.json({ token: customToken });
    } catch (error) {
        console.error("TOTP Verification Error:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
