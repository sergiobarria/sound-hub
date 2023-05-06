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
