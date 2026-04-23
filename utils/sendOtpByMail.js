import dotenv from "dotenv"
dotenv.config()
import nodemailer from "nodemailer"

export default async function sendOtpByMail(otp, email){

    console.log("OTP: ", otp);
    console.log("Email: ", email);

    console.log({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    user: process.env.SMTP_USER,
    });

    // creating our transporter object to verify mail
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });

    // verify if smtp is working 
    try {
        await transporter.verify()
        console.log("SMTP server ready to take messages");
    } catch (error) {
        console.error("Error in SMTP: ", error);   
    }

    // send the message
    try{
        const info = await transporter.sendMail({
            from: "ShaadiBio-Register <noreply.shaadibio@gmail.com>",
            to: email,
            subject: "OTP to register to ShaadiBio",
            text: `${otp} is your OTP to register your ShaadiBio Account. Do not share your otp. Valid for 5 minutes`,
            html: `<p><b>${otp}</b> is your OTP to register your ShaadiBio Account. Do not share your otp. Valid for 5 minutes </p>`,
        });

        console.log("Message sent: ", info.messageId);

        // handling rejected emails
        if(info.rejected.length > 0){
            console.warn("Some recipients were rejected: ", info.rejected);
        }

        return info
    
    }catch(error){
        // handling various errors
        switch(error.code){
            case "ECONNECTION":
            case "ETIMEDOUT":
                console.error("Server not responding -- retry later");
                break;
            case "EAUTH":
                console.error("Authentication failure: ensure if the credentials are correct");
                break;
            case "EENVELOPE":
                console.error("Invalid recipients: ", error.rejected);
                break;
            default: 
                console.error("Send failed -- retry later: ", error.message);
        }
    }
}