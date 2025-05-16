import { z } from "zod";
import { NextResponse } from "next/server";
const nodemailer = require("nodemailer");
import { generateFeedbackHTML } from "@/lib/utils";

const FeedbackSchema = z.object({
    email: z.string().email(),
    subject: z.string().optional(),
    feedback: z.string().min(10), // this is a JSON string
});

export async function POST(req: Request) {
    try {
        const body = await req.json();

        const parsed = FeedbackSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json(
                { error: parsed.error.flatten() },
                { status: 400 }
            );
        }

        const { email, subject, feedback } = parsed.data;

        // Safely parse feedback string into an object
        let feedbackObj: Record<string, any>;
        try {
            feedbackObj = JSON.parse(feedback);
        } catch (err) {
            return NextResponse.json(
                { message: "Invalid feedback format. Must be valid JSON." },
                { status: 400 }
            );
        }

        const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: 2525,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            }
        });

        await transporter.sendMail({
            from: `"Evalix" <support@evalix.com>`,
            to: email,
            subject: subject || "Your Evalix Interview Feedback",
            html: generateFeedbackHTML({
                ...feedbackObj,
                interviewRole: subject?.split("-")[1]?.replace("Interview", "").trim(),
            }),
        });

        return NextResponse.json({ message: "Email sent!" }, { status: 200 });
    } catch (err) {
        console.error("Mail error:", err);
        return NextResponse.json({ message: "Internal error" }, { status: 500 });
    }
}
