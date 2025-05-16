const QRCode = require("qrcode");
const speakeasy = require("speakeasy");

export const generateTotpSecret = (email: string) => {
    const secret = speakeasy.generateSecret({
        name: `Evalix (${email})`,
    });

    console.log("Generated TOTP Secret:", secret.base32);
    console.log("OTPAuth URL:", secret.otpauth_url);

    return secret;
};

export const getTotpQrCodeDataURL = async (otpauthUrl: string) => {
    return await QRCode.toDataURL(otpauthUrl);
};

export const verifyTotpToken = (secret: string, token: string) => {
    const expectedToken = speakeasy.totp({
        secret,
        encoding: "base32",
    });

    const isValid = speakeasy.totp.verify({
        secret,
        encoding: "base32",
        token,
        window: 3,
    });

    console.log("Verifying TOTP...");
    console.log("Secret (base32):", secret);
    console.log("Token provided by user:", token);
    console.log("Expected token (now):", expectedToken);
    console.log("Match result:", isValid);

    return isValid;
};
