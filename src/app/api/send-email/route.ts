import { NextResponse } from "next/server"
import nodemailer from "nodemailer"
import { safeError, isProduction } from "@/lib/env"

export async function POST(request: Request) {
 
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, SMTP_FROM_EMAIL, SMTP_FROM_NAME, CONTACT_RECIPIENT_EMAIL } =
    process.env

  const requiredEnvVars = [
    SMTP_HOST,
    SMTP_PORT,
    SMTP_USER,
    SMTP_PASSWORD,
    SMTP_FROM_EMAIL,
    SMTP_FROM_NAME,
    CONTACT_RECIPIENT_EMAIL,
  ]

  if (requiredEnvVars.some((envVar) => !envVar)) {
    if (!isProduction()) {
      console.error("Missing one or more required SMTP environment variables")
    }
    return NextResponse.json(
      { success: false, error: "Email service is not configured." },
      { status: 500 },
    )
  }

  try {
    // Validate and sanitize input
    const { name, email, message } = await request.json()

    if (!name || !email || !message) {
      return NextResponse.json(
        { success: false, error: "Missing name, email, or message in request body." },
        { status: 400 },
      )
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: "Invalid email format." },
        { status: 400 },
      )
    }

    // Sanitize inputs to prevent injection
    const sanitizedName = String(name).substring(0, 100).replace(/[<>]/g, '')
    const sanitizedEmail = String(email).substring(0, 254)
    const sanitizedMessage = String(message).substring(0, 5000).replace(/[<>]/g, '')

    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT),
      secure: Number(SMTP_PORT) === 465, 
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASSWORD, 
      },
      connectionTimeout: 10000, 
      greetingTimeout: 10000,
      socketTimeout: 10000,
    })

    try {
      await transporter.verify()
    } catch (verifyError) {
      safeError("SMTP Connection/Verification Error", verifyError)
      return NextResponse.json(
        { success: false, error: "Failed to connect to email server." },
        { status: 500 },
      )
    }

    const mailOptions = {
      from: `"${SMTP_FROM_NAME}" <${SMTP_FROM_EMAIL}>`,
      to: CONTACT_RECIPIENT_EMAIL,
      replyTo: sanitizedEmail,
      subject: `New message from ${sanitizedName} via Saviour Contact Form`,
      text: `You have received a new message from your Saviour contact form:\n\nName: ${sanitizedName}\nEmail: ${sanitizedEmail}\nMessage:\n${sanitizedMessage}`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2 style="color: #333;">New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${sanitizedName}</p>
          <p><strong>Email:</strong> <a href="mailto:${sanitizedEmail}">${sanitizedEmail}</a></p>
          <p><strong>Message:</strong></p>
          <p style="padding: 10px; border-left: 3px solid #eee;">${sanitizedMessage.replace(/\n/g, "<br>")}</p>
          <hr>
          <p style="font-size: 0.9em; color: #777;">This message was sent from your Saviour contact form.</p>
        </div>
      `,
    }

    await transporter.sendMail(mailOptions)
    return NextResponse.json({ success: true, message: "Email sent successfully!" })
  } catch (error) {
    safeError("Error in POST /api/send-email", error)
    return NextResponse.json({ success: false, error: "Failed to send email. Please try again later." }, { status: 500 })
  }
}