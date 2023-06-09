import bcrypt from 'bcryptjs';

/**
 * @desc: return a random group of numbers for OTP generation
 */
export function generateOTPToken(length = 6): string {
    let otp = '';

    for (let i = 0; i < length; i++) {
        const digit = Math.floor(Math.random() * 10);
        otp += digit.toString();
    }

    return otp;
}

/**
 * @desc: compare a candidate string with a hashed string
 */
export async function bcryptCompare(candidate: string, token: string): Promise<boolean> {
    return await bcrypt.compare(candidate, token);
}
