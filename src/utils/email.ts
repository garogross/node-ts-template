import nodemailer, {TransportOptions} from "nodemailer"
import pug from 'pug'
import {convert} from "html-to-text";
import {DIRNAME} from "../constants/Dirname.js";

interface MyTransportOptions extends TransportOptions {
    host: string;
}

export class Email {
    url: string;
    to: string;
    firstName: string;
    from: string;


    constructor(user: {email: string,name: string},url: string) {
        this.url = url
        this.to = user.email
        this.firstName = user.name.split(' ')[0]
        this.from = 'Garik Gevorgyan <garik@gmail.com>'
    }


    newTransport() {
        if(process.env.NODE_ENV === "production") {
            // create account in sendGrid.com
            // setup guide
            // choose SMTP relay
            // create api key
            // copy username and password

            return nodemailer.createTransport({
                service: 'SendGrid',
                auth: {
                    user: process.env.SENDGRID_USERNAME,
                    pass: process.env.SENDGRID_PASSWORD
                }
            })
        }

        return nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            auth: {
                user: process.env.EMAIL_USERNAME,
                pass: process.env.EMAIL_PASSWORD
            }
        } as MyTransportOptions)
    }

    async send(template: string,subject: string) {
        const html = pug.renderFile(`${DIRNAME}/views/emails/${template}.pug`,{
            name: this.firstName,
            url: this.url
        })

        const options = {
            from: this.from,
            to: this.to,
            subject,
            html,
            text: convert(html,{wordwrap: 80})
        }

        await this.newTransport().sendMail(options)
    }

    async sendForgotPass() {
        await this.send('forgotPass',"Forgot Your Password")
    }
}