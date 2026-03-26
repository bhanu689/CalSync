import nodemailer from 'nodemailer';
import { env } from '../config/env';

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: false,
  auth: env.SMTP_USER ? { user: env.SMTP_USER, pass: env.SMTP_PASS } : undefined,
});

function formatDate(date: Date): string {
  return date.toLocaleString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

export const mailService = {
  async sendBookingConfirmation(data: {
    hostEmail: string;
    hostName: string;
    inviteeName: string;
    inviteeEmail: string;
    eventTitle: string;
    startTime: Date;
    endTime: Date;
  }) {
    if (!env.SMTP_USER) return; // Skip if not configured

    const timeStr = formatDate(data.startTime);

    // Email to host
    await transporter.sendMail({
      from: `"CalSync" <${env.SMTP_USER}>`,
      to: data.hostEmail,
      subject: `New booking: ${data.eventTitle} with ${data.inviteeName}`,
      html: `
        <h2>New Booking Confirmed</h2>
        <p><strong>${data.inviteeName}</strong> (${data.inviteeEmail}) booked <strong>${data.eventTitle}</strong>.</p>
        <p><strong>When:</strong> ${timeStr}</p>
      `,
    }).catch(() => console.error('Failed to send host email'));

    // Email to invitee
    await transporter.sendMail({
      from: `"CalSync" <${env.SMTP_USER}>`,
      to: data.inviteeEmail,
      subject: `Booking confirmed: ${data.eventTitle} with ${data.hostName}`,
      html: `
        <h2>Booking Confirmed</h2>
        <p>Your meeting with <strong>${data.hostName}</strong> is confirmed.</p>
        <p><strong>Event:</strong> ${data.eventTitle}</p>
        <p><strong>When:</strong> ${timeStr}</p>
      `,
    }).catch(() => console.error('Failed to send invitee email'));
  },

  async sendBookingCancellation(data: {
    inviteeEmail: string;
    inviteeName: string;
    hostName: string;
    eventTitle: string;
    startTime: Date;
    reason?: string;
  }) {
    if (!env.SMTP_USER) return;

    await transporter.sendMail({
      from: `"CalSync" <${env.SMTP_USER}>`,
      to: data.inviteeEmail,
      subject: `Booking cancelled: ${data.eventTitle} with ${data.hostName}`,
      html: `
        <h2>Booking Cancelled</h2>
        <p>Your meeting with <strong>${data.hostName}</strong> for <strong>${data.eventTitle}</strong> on ${formatDate(data.startTime)} has been cancelled.</p>
        ${data.reason ? `<p><strong>Reason:</strong> ${data.reason}</p>` : ''}
      `,
    }).catch(() => console.error('Failed to send cancellation email'));
  },
};
