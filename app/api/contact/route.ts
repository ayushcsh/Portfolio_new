import { NextResponse } from "next/server";

const contactEmail = "ayushkumar.nov.2005@gmail.com";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function POST(request: Request) {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail =
    process.env.CONTACT_FROM_EMAIL ?? "Portfolio Contact <onboarding@resend.dev>";

  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "Contact email is not configured yet. Add RESEND_API_KEY to enable delivery.",
      },
      { status: 503 }
    );
  }

  try {
    const body = await request.json();
    const name = String(body?.name ?? "").trim();
    const email = String(body?.email ?? "").trim();
    const message = String(body?.message ?? "").trim();

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Please fill in every field before sending." },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safeMessage = escapeHtml(message).replace(/\n/g, "<br />");

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: contactEmail,
        reply_to: email,
        subject: `Portfolio hello from ${name}`,
        text: [`Name: ${name}`, `Email: ${email}`, "", message].join("\n"),
        html: `
          <div style="font-family:Arial,sans-serif;line-height:1.6;color:#18181b">
            <h2>New portfolio message</h2>
            <p><strong>Name:</strong> ${safeName}</p>
            <p><strong>Email:</strong> ${safeEmail}</p>
            <p><strong>Message:</strong></p>
            <p>${safeMessage}</p>
          </div>
        `,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => null);
      return NextResponse.json(
        {
          error:
            error?.message ??
            "The message could not be sent. Please try again later.",
        },
        { status: response.status }
      );
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Something went wrong while sending your message." },
      { status: 500 }
    );
  }
}
