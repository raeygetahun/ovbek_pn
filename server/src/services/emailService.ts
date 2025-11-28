import nodemailer from "nodemailer";
import { getMessage } from "./messageBank";
import { IEmailData } from "../types";

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVICE,
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const formatMessage = (message: string, data: IEmailData = {}): string => {
  return message.replace(/\{([^}]+)\}/g, (match, p1) => {
    return (data as Record<string, string | undefined>)[p1] ?? "";
  });
};

const sendEmail = (
  recipient: string | string[],
  subject: string,
  isArray: boolean = false,
  data: IEmailData | null = null,
): void => {
  const messageEn = getMessage(subject, "en");
  const messageDe = getMessage(subject, "de");
  const formattedMessageEn = formatMessage(messageEn, data || {});
  const formattedMessageDe = formatMessage(messageDe, data || {});

  const mailOptions: nodemailer.SendMailOptions = {
    from: process.env.EMAIL_USER,
    subject: subject,
    html: `
            <html>
                <body style="font-family: Arial, sans-serif;">

                    <p style="">${formattedMessageDe}</p>
                    <hr style="margin: 24px 0; border: none; border-top: 1px solid #e5e7eb;" />
                    <p style="font-weight: 600;">English</p>
                    <p style="">${formattedMessageEn}</p>
                </body>
            </html>
        `,
  };

  if (isArray && Array.isArray(recipient)) {
    mailOptions.to = recipient.join(",");
  } else {
    mailOptions.to = recipient as string;
  }

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Email error:", error);
    }
  });
};

export default sendEmail;
