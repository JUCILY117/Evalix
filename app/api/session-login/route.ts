import { auth } from "@/firebase/admin";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { idToken } = await req.json();

        if (!idToken) {
            return NextResponse.json({ error: "Missing ID token" }, { status: 400 });
        }

        const expiresIn = 60 * 60 * 24 * 5 * 1000;

        const sessionCookie = await auth.createSessionCookie(idToken, { expiresIn });

        const cookieStore = await cookies();
        cookieStore.set("session", sessionCookie, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: expiresIn / 1000,
            path: "/",
        });

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("Session login failed:", err);
        return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
}
