import * as path from 'path';

import nodemailer from 'nodemailer';
import type SMTPTransport from 'nodemailer/lib/smtp-transport';
import config from 'config';
import { generateTemplate, logger } from '@/utils';

function generateMailTransport(): nodemailer.Transporter<SMTPTransport.SentMessageInfo> {
    const transport = nodemailer.createTransport({
        host: config.get<string>('MAILTRAP_HOST'),
        port: config.get<number>('MAILTRAP_PORT'),
        auth: {
            user: config.get<string>('MAILTRAP_USER'),
            pass: config.get<string>('MAILTRAP_PASSWORD'),
        },
    });

    return transport;
}

interface Profile {
    name: string;
    email: string;
}

export function sendVerificationEmail(token: string, profile: Profile): void {
    const transport = generateMailTransport();
    const { name, email } = profile;

    const welcomeMessage = `Hi! ${name}, welcome to SoundHub! Please verify your email by entering the following OTP code: ${token}`;

    void transport
        .sendMail({
            to: email,
            subject: 'Welcome to SoundHub',
            from: config.get<string>('EMAIL_SENDER'),
            html: generateTemplate({
                title: 'Welcome to SoundHub',
                message: welcomeMessage,
                logo: 'cid:logo',
                banner: 'cid:welcome',
                link: '#',
                btnTitle: token,
            }),
            attachments: [
                {
                    filename: 'logo.png',
                    path: path.join(__dirname, '../assets/images/logo.png'),
                    cid: 'logo',
                },
                {
                    filename: 'welcome.png',
                    path: path.join(__dirname, '../assets/images/welcome.png'),
                    cid: 'welcome',
                },
            ],
        })
        .catch(err => {
            logger.error(err);
        });
}

interface Options {
    email: string;
    link: string;
}

export function sendForgotPasswordLink(options: Options): void {
    const transport = generateMailTransport();
    const { email, link } = options;

    const message = `We received a request to reset your password. If you didn't make the request, just ignore this email. Otherwise, you can reset your password using the following link: ${link}`;

    void transport
        .sendMail({
            to: email,
            subject: 'Reset your password',
            from: config.get<string>('EMAIL_SENDER'),
            html: generateTemplate({
                title: 'Reset your password',
                message,
                logo: 'cid:logo',
                banner: 'cid:forget_password',
                link,
                btnTitle: 'Reset password',
            }),
            attachments: [
                {
                    filename: 'logo.png',
                    path: path.join(__dirname, '../assets/images/logo.png'),
                    cid: 'logo',
                },
                {
                    filename: 'forget_password.png',
                    path: path.join(__dirname, '../assets/images/forget_password.png'),
                    cid: 'forget_password',
                },
            ],
        })
        .catch(err => {
            logger.error(err);
        });
}

export function sendPasswordUpdatedSuccessfully(name: string, email: string): void {
    const transport = generateMailTransport();

    const message = `Dear ${name}, your password has been updated successfully. If you didn't make the request, please contact us immediately. Otherwise, you can login to your account using your new password`;

    void transport
        .sendMail({
            to: email,
            subject: 'Password updated',
            from: config.get<string>('EMAIL_SENDER'),
            html: generateTemplate({
                title: 'Password updated',
                message,
                logo: 'cid:logo',
                banner: 'cid:forget_password',
                link: config.get<string>('SIGN_IN_URL'),
                btnTitle: 'Reset password',
            }),
            attachments: [
                {
                    filename: 'logo.png',
                    path: path.join(__dirname, '../assets/images/logo.png'),
                    cid: 'logo',
                },
                {
                    filename: 'forget_password.png',
                    path: path.join(__dirname, '../assets/images/forget_password.png'),
                    cid: 'forget_password',
                },
            ],
        })
        .catch(err => {
            logger.error(err);
        });
}
