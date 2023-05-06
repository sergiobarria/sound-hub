import dotenv from 'dotenv';

dotenv.config();

export default {
    PORT: process.env.PORT,
    NODE_ENV: process.env.NODE_ENV,
    SALT_ROUNDS: process.env.SALT_ROUNDS,
    MAILTRAP_HOST: process.env.MAILTRAP_HOST,
    MAILTRAP_PORT: process.env.MAILTRAP_PORT,
    MAILTRAP_USER: process.env.MAILTRAP_USER,
    MAILTRAP_PASSWORD: process.env.MAILTRAP_PASSWORD,
    EMAIL_SENDER: process.env.EMAIL_SENDER,
    PASSWORD_RESET_BASE_URL: process.env.PASSWORD_RESET_BASE_URL,
    SIGN_IN_URL: process.env.SIGN_IN_URL,
};
