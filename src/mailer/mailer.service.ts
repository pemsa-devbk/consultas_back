import { Injectable, OnModuleInit } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';
import { existsSync } from 'fs';


@Injectable()
export class MailerService implements OnModuleInit {

  private mail: string = '';
  private password: string = '';
  private transporter: nodemailer.Transporter<SMTPTransport.SentMessageInfo> | undefined;
  private host: string = '';
  private port: number = 587;

  constructor(
    private configService: ConfigService
  ) {
    this.mail = this.configService.get<string>('EMAIL_MAIL');
    this.password = this.configService.get('PASSWORD_MAIL');
    this.host = this.configService.get('HOST_MAIL') || '';
    this.port = this.configService.get<number>('PORT_MAIL', 587);
  }

  async sendWelcome(name: string, email: string, password: string) {
    const pathLogo = join(__dirname, '../assets/logo.png');
    const pathFace = join(__dirname, '../assets/logo-facebook.png');
    const pathTwit = join(__dirname, '../assets/logo-twitter.png');
    const pathInst = join(__dirname, '../assets/logo-instagram.png');
    if (existsSync(pathLogo) && existsSync(pathFace) && existsSync(pathTwit) && existsSync(pathInst)) {
      await this.transporter.sendMail({
        from: `PEMSA <${this.mail}>`,
        to: email,
        subject: 'Registro para PEMSA Monitoreo APP',
        attachments: [
          {
            filename: `pem-logo.jpg`,
            path: pathLogo,
            cid: 'logo-pem'
          },
          {
            filename: `facebook-logo.jpg`,
            path: pathFace,
            cid: 'logo-facebook'
          },
          {
            filename: `twitter-logo.jpg`,
            path: pathTwit,
            cid: 'logo-twitter'
          },
          {
            filename: `instalgram-logo.jpg`,
            path: pathInst,
            cid: 'logo-instagram'
          },
        ],
        html: this.htmlWelcome(name, email, password)

      })
      return true;
    }
    console.error('ASSETS NOT FOUND');
    return false;
  }

  async sendResetPw(userName: string, email: string, password: string, holderName: string){
    const pathLogo = join(__dirname, '../assets/logo.png');
    const pathFace = join(__dirname, '../assets/logo-facebook.png');
    const pathTwit = join(__dirname, '../assets/logo-twitter.png');
    const pathInst = join(__dirname, '../assets/logo-instagram.png');
    if (existsSync(pathLogo) && existsSync(pathFace) && existsSync(pathTwit) && existsSync(pathInst)) {
      await this.transporter.sendMail({
        from: `PEMSA <${this.mail}>`,
        to: email,
        subject: 'Reinicio de contraseña para PEMSA Monitoreo APP',
        attachments: [
          {
            filename: `pem-logo.jpg`,
            path: pathLogo,
            cid: 'logo-pem'
          },
          {
            filename: `facebook-logo.jpg`,
            path: pathFace,
            cid: 'logo-facebook'
          },
          {
            filename: `twitter-logo.jpg`,
            path: pathTwit,
            cid: 'logo-twitter'
          },
          {
            filename: `instalgram-logo.jpg`,
            path: pathInst,
            cid: 'logo-instagram'
          },
        ],
        html: this.htmlResetPw(userName, password, holderName)

      })
      return true;
    }
    console.error('ASSETS NOT FOUND');
    return false;
  }

  private htmlWelcome(userName: string, email: string, password: string) {
    return `
          <!doctype html><html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office"><head><title></title><!--[if !mso]><!-- --><meta http-equiv="X-UA-Compatible" content="IE=edge"><!--<![endif]--><meta http-equiv="Content-Type" content="text/html; charset=UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style type="text/css">#outlook a { padding:0; }
          .ReadMsgBody { width:100%; }
          .ExternalClass { width:100%; }
          .ExternalClass * { line-height:100%; }
          body { margin:0;padding:0;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%; }
          table, td { border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt; }
          img { border:0;height:auto;line-height:100%; outline:none;text-decoration:none;-ms-interpolation-mode:bicubic; }
          p { display:block;margin:13px 0; }</style><!--[if !mso]><!--><style type="text/css">@media only screen and (max-width:480px) {
            @-ms-viewport { width:320px; }
            @viewport { width:320px; }
          }</style><!--<![endif]--><!--[if mso]>
        <xml>
        <o:OfficeDocumentSettings>
          <o:AllowPNG/>
          <o:PixelsPerInch>96</o:PixelsPerInch>
        </o:OfficeDocumentSettings>
        </xml>
        <![endif]--><!--[if lte mso 11]>
        <style type="text/css">
          .outlook-group-fix { width:100% !important; }
        </style>
        <![endif]--><!--[if !mso]><!--><link href="https://fonts.googleapis.com/css2?family=Poppins" rel="stylesheet" type="text/css"><style type="text/css">@import url(https://fonts.googleapis.com/css2?family=Poppins);</style><!--<![endif]--><style type="text/css">@media only screen and (min-width:480px) {
        .mj-column-per-100 { width:100% !important; max-width: 100%; }
.mj-column-px-120 { width:120px !important; max-width: 120px; }
.mj-column-px-300 { width:300px !important; max-width: 300px; }
.mj-column-px-70 { width:70px !important; max-width: 70px; }
      }</style><style type="text/css">@media only screen and (max-width:480px) {
      table.full-width-mobile { width: 100% !important; }
      td.full-width-mobile { width: auto !important; }
    }</style></head><body style="background-color:#f1f1f1;"><div style="background-color:#f1f1f1;"><!--[if mso | IE]><table align="center" border="0" cellpadding="0" cellspacing="0" class="" style="width:600px;" width="600" ><tr><td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;"><![endif]--><div style="Margin:0px auto;max-width:600px;"><table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:100%;"><tbody><tr><td style="direction:ltr;font-size:0px;padding:0px;padding-top:50px;text-align:center;vertical-align:top;"><!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr></tr></table><![endif]--></td></tr></tbody></table></div><!--[if mso | IE]></td></tr></table><![endif]--><!-- Logo section --><!--[if mso | IE]><table align="center" border="0" cellpadding="0" cellspacing="0" class="" style="width:600px;" width="600" ><tr><td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;"><![endif]--><div style="background:#ffffff;background-color:#ffffff;Margin:0px auto;max-width:600px;"><table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#ffffff;background-color:#ffffff;width:100%;"><tbody><tr><td style="direction:ltr;font-size:0px;padding:0px;text-align:center;vertical-align:top;"><!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td class="" style="vertical-align:top;width:600px;" ><![endif]--><div class="mj-column-per-100 outlook-group-fix" style="font-size:13px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;"><table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%"><tbody><tr><td style="vertical-align:top;padding-top:50px;"><table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%"><tr><td align="center" style="font-size:0px;padding:0px;word-break:break-word;"><table border="0" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse:collapse;border-spacing:0px;"><tbody><tr><td style="width:100px;"><img alt="Logo PRELMO" height="auto" src="cid:logo-pem" style="border:0;display:block;outline:none;text-decoration:none;height:auto;width:100%;" width="100"></td></tr></tbody></table></td></tr></table></td></tr></tbody></table></div><!--[if mso | IE]></td></tr></table><![endif]--></td></tr></tbody></table></div><!--[if mso | IE]></td></tr></table><![endif]--><!-- Title section --><!--[if mso | IE]><table align="center" border="0" cellpadding="0" cellspacing="0" class="" style="width:600px;" width="600" ><tr><td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;"><![endif]--><div style="background:#ffffff;background-color:#ffffff;Margin:0px auto;max-width:600px;"><table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#ffffff;background-color:#ffffff;width:100%;"><tbody><tr><td style="direction:ltr;font-size:0px;padding:0px;padding-left:20px;padding-right:20px;text-align:center;vertical-align:top;"><!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td class="" style="vertical-align:top;width:560px;" ><![endif]--><div class="mj-column-per-100 outlook-group-fix" style="font-size:13px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;"><table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;" width="100%"><tr><td align="center" style="font-size:0px;padding:0px;padding-top:50px;word-break:break-word;"><div style="font-family:Poppins, sans-serif;font-size:30px;font-weight:600;line-height:26px;text-align:center;color:#000000;">¡Gracias por unirte!</div></td></tr></table></div><!--[if mso | IE]></td><td class="" style="vertical-align:top;width:560px;" ><![endif]--><div class="mj-column-per-100 outlook-group-fix" style="font-size:13px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;"><table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%"><tbody><tr><td style="vertical-align:top;padding-top:20px;"><table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%"><tr><td align="justify" style="font-size:0px;padding:0px;word-break:break-word;"><div style="font-family:Poppins, sans-serif;font-size:12px;line-height:20px;text-align:justify;color:#000000;">Hola, ${userName} gracias por unirte a nuestra plataforma de consultas. Ahora podrás revisar y descargar los eventos de tu panel de alarma entre otras consultas.</div></td></tr></table></td></tr></tbody></table></div><!--[if mso | IE]></td></tr></table><![endif]--></td></tr></tbody></table></div><!--[if mso | IE]></td></tr></table><![endif]--><!-- Session space --><!--[if mso | IE]><table align="center" border="0" cellpadding="0" cellspacing="0" class="" style="width:600px;" width="600" ><tr><td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;"><![endif]--><div style="background:#ffffff;background-color:#ffffff;Margin:0px auto;max-width:600px;"><table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#ffffff;background-color:#ffffff;width:100%;"><tbody><tr><td style="direction:ltr;font-size:0px;padding:0px;padding-top:30px;text-align:center;vertical-align:top;"><!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td class="" style="vertical-align:top;width:120px;" ><![endif]--><div class="mj-column-px-120 outlook-group-fix" style="font-size:13px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;"><table border="0" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#DED0E8;border-radius:5px 0px 0px 0px;vertical-align:top;" width="100%"><tr><td align="center" style="font-size:0px;padding:0px;word-break:break-word;"><div style="font-family:Poppins, sans-serif;font-size:12px;line-height:26px;text-align:center;color:#000000;">Correo:</div></td></tr></table></div><!--[if mso | IE]></td><td class="" style="vertical-align:top;width:300px;" ><![endif]--><div class="mj-column-px-300 outlook-group-fix" style="font-size:13px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;"><table border="0" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#DED0E8;border-radius:0px 5px 0px 0px;vertical-align:top;" width="100%"><tr><td align="center" style="font-size:0px;padding:0px;word-break:break-word;"><div style="font-family:Poppins, sans-serif;font-size:14px;font-weight:bold;line-height:26px;text-align:center;color:#6f3996;">${email}</div></td></tr></table></div><!--[if mso | IE]></td></tr></table><![endif]--></td></tr></tbody></table></div><!--[if mso | IE]></td></tr></table><table align="center" border="0" cellpadding="0" cellspacing="0" class="" style="width:600px;" width="600" ><tr><td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;"><![endif]--><div style="background:#ffffff;background-color:#ffffff;Margin:0px auto;max-width:600px;"><table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#ffffff;background-color:#ffffff;width:100%;"><tbody><tr><td style="direction:ltr;font-size:0px;padding:0px;padding-top:0px;text-align:center;vertical-align:top;"><!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td class="" style="vertical-align:top;width:120px;" ><![endif]--><div class="mj-column-px-120 outlook-group-fix" style="font-size:13px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;"><table border="0" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#DED0E8;border-radius:0px 0 0 5px;vertical-align:top;" width="100%"><tr><td align="center" style="font-size:0px;padding:0px;word-break:break-word;"><div style="font-family:Poppins, sans-serif;font-size:12px;line-height:26px;text-align:center;color:#000000;">Contraseña:</div></td></tr></table></div><!--[if mso | IE]></td><td class="" style="vertical-align:top;width:300px;" ><![endif]--><div class="mj-column-px-300 outlook-group-fix" style="font-size:13px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;"><table border="0" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#DED0E8;border-radius:0px 0px 5px 0px;vertical-align:top;" width="100%"><tr><td align="center" style="font-size:0px;padding:0px;word-break:break-word;"><div style="font-family:Poppins, sans-serif;font-size:14px;font-weight:bold;line-height:26px;text-align:center;color:#6f3996;">${password}</div></td></tr></table></div><!--[if mso | IE]></td></tr></table><![endif]--></td></tr></tbody></table></div><!--[if mso | IE]></td></tr></table><table align="center" border="0" cellpadding="0" cellspacing="0" class="" style="width:600px;" width="600" ><tr><td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;"><![endif]--><div style="background:#ffffff;background-color:#ffffff;Margin:0px auto;max-width:600px;"><table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#ffffff;background-color:#ffffff;width:100%;"><tbody><tr><td style="direction:ltr;font-size:0px;padding:0px;padding-top:10px;text-align:center;vertical-align:top;"><!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td class="" style="vertical-align:top;width:600px;" ><![endif]--><div class="mj-column-per-100 outlook-group-fix" style="font-size:13px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;"><table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;" width="100%"><tr><td align="center" vertical-align="middle" style="font-size:0px;padding:10px 25px;word-break:break-word;"><table border="0" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse:separate;line-height:100%;"><tr><td align="center" bgcolor="#6f3996" role="presentation" style="border:none;border-radius:3px;cursor:auto;padding:10px 25px;background:#6f3996;" valign="middle"><a href="https://conweb.pem-sa.com.mx" style="background:#6f3996;color:#ffffff;font-family:Poppins;font-size:14px;font-weight:normal;line-height:120%;Margin:0;text-decoration:none;text-transform:none;" target="_blank">INICIA AHORA</a></td></tr></table></td></tr></table></div><!--[if mso | IE]></td></tr></table><![endif]--></td></tr></tbody></table></div><!--[if mso | IE]></td></tr></table><![endif]--><!-- About --><!--[if mso | IE]><table align="center" border="0" cellpadding="0" cellspacing="0" class="" style="width:600px;" width="600" ><tr><td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;"><![endif]--><div style="background:#ffffff;background-color:#ffffff;Margin:0px auto;max-width:600px;"><table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#ffffff;background-color:#ffffff;width:100%;"><tbody><tr><td style="direction:ltr;font-size:0px;padding:0px;padding-bottom:30px;padding-left:20px;padding-right:20px;padding-top:20px;text-align:center;vertical-align:top;"><!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td class="" style="vertical-align:top;width:560px;" ><![endif]--><div class="mj-column-per-100 outlook-group-fix" style="font-size:13px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;"><table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;" width="100%"><tr><td align="justify" style="font-size:0px;padding:0px;word-break:break-word;"><div style="font-family:Poppins, sans-serif;font-size:12px;line-height:20px;text-align:justify;color:#000000;">¿Tienes alguna pregunta? Envienos un correo a <a href="mailto:app.movil@pem-sa.com.mx?subject=Registro en la aplicación móvil">app.movil@pem-sa.com.mx</a> o llámenos al <a href="tel:222-141-12-30">222 141 12 30</a> ext: 122.</div></td></tr></table></div><!--[if mso | IE]></td><td class="" style="vertical-align:top;width:560px;" ><![endif]--><div class="mj-column-per-100 outlook-group-fix" style="font-size:13px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;"><table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%"><tbody><tr><td style="vertical-align:top;padding-top:10px;"><table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%"><tr><td align="left" style="font-size:0px;padding:0px;word-break:break-word;"><div style="font-family:Poppins, sans-serif;font-size:12px;line-height:26px;text-align:left;color:#000000;">Gracias.</div></td></tr><tr><td align="left" style="font-size:0px;padding:0px;word-break:break-word;"><div style="font-family:Poppins, sans-serif;font-size:12px;line-height:26px;text-align:left;color:#000000;">¡El equipo de PEMSA!</div></td></tr></table></td></tr></tbody></table></div><!--[if mso | IE]></td></tr></table><![endif]--></td></tr></tbody></table></div><!--[if mso | IE]></td></tr></table><![endif]--> <!-- Foother --><!-- Foother --><!--[if mso | IE]><table align="center" border="0" cellpadding="0" cellspacing="0" class="" style="width:600px;" width="600" ><tr><td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;"><![endif]--><div style="Margin:0px auto;max-width:600px;"><table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:100%;"><tbody><tr><td style="direction:ltr;font-size:0px;padding:0px;text-align:center;vertical-align:top;"><!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td class="" style="vertical-align:top;width:70px;" ><![endif]--><div class="mj-column-px-70 outlook-group-fix" style="font-size:13px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;"><table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%"><tbody><tr><td style="vertical-align:top;padding-top:30px;padding-bottom:15px;"><table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%"><tr><td align="center" style="font-size:0px;padding:0px;word-break:break-word;"><div style="font-family:Poppins, sans-serif;font-size:18px;line-height:26px;text-align:center;color:#000000;"><a href="https://www.facebook.com/people/PEMSA-Protecci%C3%B3n-Electr%C3%B3nica-Monterrey-SA-de-CV/100063501522534/?ref=bookmarks"><img src="cid:logo-facebook" width="25px"></a></div></td></tr></table></td></tr></tbody></table></div><!--[if mso | IE]></td><td class="" style="vertical-align:top;width:70px;" ><![endif]--><div class="mj-column-px-70 outlook-group-fix" style="font-size:13px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;"><table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%"><tbody><tr><td style="vertical-align:top;padding-top:30px;"><table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%"><tr><td align="center" style="font-size:0px;padding:0px;word-break:break-word;"><div style="font-family:Poppins, sans-serif;font-size:18px;line-height:26px;text-align:center;color:#000000;"><a href="https://twitter.com/PEMSA_85"><img src="cid:logo-twitter" width="25px"></a></div></td></tr></table></td></tr></tbody></table></div><!--[if mso | IE]></td><td class="" style="vertical-align:top;width:70px;" ><![endif]--><div class="mj-column-px-70 outlook-group-fix" style="font-size:13px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;"><table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%"><tbody><tr><td style="vertical-align:top;padding-top:30px;"><table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%"><tr><td align="center" style="font-size:0px;padding:0px;word-break:break-word;"><div style="font-family:Poppins, sans-serif;font-size:18px;line-height:26px;text-align:center;color:#000000;"><a href="https://www.instagram.com/pemsa_85/"><img src="cid:logo-instagram" width="25px"></a></div></td></tr></table></td></tr></tbody></table></div><!--[if mso | IE]></td></tr></table><![endif]--></td></tr></tbody></table></div><!--[if mso | IE]></td></tr></table><table align="center" border="0" cellpadding="0" cellspacing="0" class="" style="width:600px;" width="600" ><tr><td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;"><![endif]--><div style="Margin:0px auto;max-width:600px;"><table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:100%;"><tbody><tr><td style="direction:ltr;font-size:0px;padding:0px;padding-bottom:50px;text-align:center;vertical-align:top;"><!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td class="" style="vertical-align:top;width:600px;" ><![endif]--><div class="mj-column-per-100 outlook-group-fix" style="font-size:13px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;"><table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;" width="100%"><tr><td align="center" style="font-size:0px;padding:0px;word-break:break-word;"><div style="font-family:Poppins, sans-serif;font-size:12px;line-height:20px;text-align:center;color:#000000;">Protección Electrónica Mnterrey S.A. de C.V. &copy; 2023 Protección Electrónica Mnterrey S.A. de C.V.Todos los derechos reservados.<br>Calle 33 Poniente #307 Col. Chulavista C.P. 72420 Puebla, Pue.<br>PERMISO SSP FEDERAL: DGSP/303-16/3302<br>PERMISO SSP EDO. DE PUEBLA: SSP/SUBCOP/DGSP/114-15/109</div></td></tr></table></div><!--[if mso | IE]></td></tr></table><![endif]--></td></tr></tbody></table></div><!--[if mso | IE]></td></tr></table><![endif]--></div></body></html>
        `;
  }
  
  private htmlResetPw(userName: string, password: string, holderName: string){
    return `
      <!doctype html><html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office"><head><title></title><!--[if !mso]><!-- --><meta http-equiv="X-UA-Compatible" content="IE=edge"><!--<![endif]--><meta http-equiv="Content-Type" content="text/html; charset=UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style type="text/css">#outlook a { padding:0; }
          .ReadMsgBody { width:100%; }
          .ExternalClass { width:100%; }
          .ExternalClass * { line-height:100%; }
          body { margin:0;padding:0;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%; }
          table, td { border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt; }
          img { border:0;height:auto;line-height:100%; outline:none;text-decoration:none;-ms-interpolation-mode:bicubic; }
          p { display:block;margin:13px 0; }</style><!--[if !mso]><!--><style type="text/css">@media only screen and (max-width:480px) {
            @-ms-viewport { width:320px; }
            @viewport { width:320px; }
          }</style><!--<![endif]--><!--[if mso]>
        <xml>
        <o:OfficeDocumentSettings>
          <o:AllowPNG/>
          <o:PixelsPerInch>96</o:PixelsPerInch>
        </o:OfficeDocumentSettings>
        </xml>
        <![endif]--><!--[if lte mso 11]>
        <style type="text/css">
          .outlook-group-fix { width:100% !important; }
        </style>
        <![endif]--><!--[if !mso]><!--><link href="https://fonts.googleapis.com/css2?family=Poppins" rel="stylesheet" type="text/css"><style type="text/css">@import url(https://fonts.googleapis.com/css2?family=Poppins);</style><!--<![endif]--><style type="text/css">@media only screen and (min-width:480px) {
        .mj-column-per-100 { width:100% !important; max-width: 100%; }
.mj-column-per-90 { width:90% !important; max-width: 90%; }
.mj-column-px-70 { width:70px !important; max-width: 70px; }
      }</style><style type="text/css">@media only screen and (max-width:480px) {
      table.full-width-mobile { width: 100% !important; }
      td.full-width-mobile { width: auto !important; }
    }</style></head><body style="background-color:#f1f1f1;"><div style="background-color:#f1f1f1;"><!--[if mso | IE]><table align="center" border="0" cellpadding="0" cellspacing="0" class="" style="width:600px;" width="600" ><tr><td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;"><![endif]--><div style="Margin:0px auto;max-width:600px;"><table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:100%;"><tbody><tr><td style="direction:ltr;font-size:0px;padding:0px;padding-top:50px;text-align:center;vertical-align:top;"><!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr></tr></table><![endif]--></td></tr></tbody></table></div><!--[if mso | IE]></td></tr></table><![endif]--><!-- Logo section --><!--[if mso | IE]><table align="center" border="0" cellpadding="0" cellspacing="0" class="" style="width:600px;" width="600" ><tr><td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;"><![endif]--><div style="background:#ffffff;background-color:#ffffff;Margin:0px auto;max-width:600px;"><table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#ffffff;background-color:#ffffff;width:100%;"><tbody><tr><td style="direction:ltr;font-size:0px;padding:0px;text-align:center;vertical-align:top;"><!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td class="" style="vertical-align:top;width:600px;" ><![endif]--><div class="mj-column-per-100 outlook-group-fix" style="font-size:13px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;"><table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%"><tbody><tr><td style="vertical-align:top;padding-top:50px;"><table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%"><tr><td align="center" style="font-size:0px;padding:0px;word-break:break-word;"><table border="0" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse:collapse;border-spacing:0px;"><tbody><tr><td style="width:100px;"><img alt="Logo PRELMO" height="auto" src="cid:logo-pem" style="border:0;display:block;outline:none;text-decoration:none;height:auto;width:100%;" width="100"></td></tr></tbody></table></td></tr></table></td></tr></tbody></table></div><!--[if mso | IE]></td></tr></table><![endif]--></td></tr></tbody></table></div><!--[if mso | IE]></td></tr></table><![endif]--><!-- Title section --><!--[if mso | IE]><table align="center" border="0" cellpadding="0" cellspacing="0" class="" style="width:600px;" width="600" ><tr><td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;"><![endif]--><div style="background:#ffffff;background-color:#ffffff;Margin:0px auto;max-width:600px;"><table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#ffffff;background-color:#ffffff;width:100%;"><tbody><tr><td style="direction:ltr;font-size:0px;padding:0px;padding-left:20px;padding-right:20px;text-align:center;vertical-align:top;"><!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td class="" style="vertical-align:top;width:560px;" ><![endif]--><div class="mj-column-per-100 outlook-group-fix" style="font-size:13px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;"><table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;" width="100%"><tr><td align="center" style="font-size:0px;padding:0px;padding-top:50px;word-break:break-word;"><div style="font-family:Poppins, sans-serif;font-size:30px;font-weight:600;line-height:26px;text-align:center;color:#000000;">Tu contraseña ha sido reiniciada</div></td></tr></table></div><!--[if mso | IE]></td><td class="" style="vertical-align:top;width:560px;" ><![endif]--><div class="mj-column-per-100 outlook-group-fix" style="font-size:13px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;"><table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%"><tbody><tr><td style="vertical-align:top;padding-top:20px;"><table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%"><tr><td align="justify" style="font-size:0px;padding:0px;word-break:break-word;"><div style="font-family:Poppins, sans-serif;font-size:12px;line-height:20px;text-align:justify;color:#000000;">Hola ${userName} se realizo una petición de reinicio de contraseña, si tienes alguna duda contacta a tu titular ${holderName} o administrador.</div></td></tr></table></td></tr></tbody></table></div><!--[if mso | IE]></td></tr></table><![endif]--></td></tr></tbody></table></div><!--[if mso | IE]></td></tr></table><![endif]--><!-- New password --><!--[if mso | IE]><table align="center" border="0" cellpadding="0" cellspacing="0" class="" style="width:600px;" width="600" ><tr><td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;"><![endif]--><div style="background:#ffffff;background-color:#ffffff;Margin:0px auto;max-width:600px;"><table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#ffffff;background-color:#ffffff;width:100%;"><tbody><tr><td style="direction:ltr;font-size:0px;padding:0px;padding-top:20px;text-align:center;vertical-align:top;"><!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td class="" style="vertical-align:top;width:540px;" ><![endif]--><div class="mj-column-per-90 outlook-group-fix" style="font-size:13px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;"><table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%"><tbody><tr><td style="border:2px dashed #DED0E8;vertical-align:top;padding:15px 0;"><table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%"><tr><td align="center" style="font-size:0px;padding:0px;word-break:break-word;"><div style="font-family:Poppins, sans-serif;font-size:18px;font-weight:600;line-height:26px;text-align:center;color:#000000;">Tu nueva contraseña es</div></td></tr><tr><td align="center" style="font-size:0px;padding:0px;padding-top:10px;word-break:break-word;"><div style="font-family:Poppins, sans-serif;font-size:28px;font-weight:bold;line-height:26px;text-align:center;color:#6f3996;">${password}</div></td></tr></table></td></tr></tbody></table></div><!--[if mso | IE]></td></tr></table><![endif]--></td></tr></tbody></table></div><!--[if mso | IE]></td></tr></table><table align="center" border="0" cellpadding="0" cellspacing="0" class="" style="width:600px;" width="600" ><tr><td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;"><![endif]--><div style="background:#ffffff;background-color:#ffffff;Margin:0px auto;max-width:600px;"><table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#ffffff;background-color:#ffffff;width:100%;"><tbody><tr><td style="direction:ltr;font-size:0px;padding:10px 0px;text-align:center;vertical-align:top;"><!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td class="" style="vertical-align:top;width:600px;" ><![endif]--><div class="mj-column-per-100 outlook-group-fix" style="font-size:13px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;"><table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;" width="100%"><tr><td align="center" vertical-align="middle" style="font-size:0px;padding:10px 25px;word-break:break-word;"><table border="0" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse:separate;line-height:100%;"><tr><td align="center" bgcolor="#6f3996" role="presentation" style="border:none;border-radius:3px;cursor:auto;padding:10px 25px;background:#6f3996;" valign="middle"><a href="https://conweb.pem-sa.com.mx" style="background:#6f3996;color:#ffffff;font-family:Poppins;font-size:14px;font-weight:normal;line-height:120%;Margin:0;text-decoration:none;text-transform:none;" target="_blank">INICIA AHORA</a></td></tr></table></td></tr></table></div><!--[if mso | IE]></td></tr></table><![endif]--></td></tr></tbody></table></div><!--[if mso | IE]></td></tr></table><![endif]--><!-- Foother --><!--[if mso | IE]><table align="center" border="0" cellpadding="0" cellspacing="0" class="" style="width:600px;" width="600" ><tr><td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;"><![endif]--><div style="Margin:0px auto;max-width:600px;"><table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:100%;"><tbody><tr><td style="direction:ltr;font-size:0px;padding:0px;text-align:center;vertical-align:top;"><!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td class="" style="vertical-align:top;width:70px;" ><![endif]--><div class="mj-column-px-70 outlook-group-fix" style="font-size:13px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;"><table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%"><tbody><tr><td style="vertical-align:top;padding-top:30px;padding-bottom:15px;"><table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%"><tr><td align="center" style="font-size:0px;padding:0px;word-break:break-word;"><div style="font-family:Poppins, sans-serif;font-size:18px;line-height:26px;text-align:center;color:#000000;"><a href="https://www.facebook.com/people/PEMSA-Protecci%C3%B3n-Electr%C3%B3nica-Monterrey-SA-de-CV/100063501522534/?ref=bookmarks"><img src="cid:logo-facebook" width="25px"></a></div></td></tr></table></td></tr></tbody></table></div><!--[if mso | IE]></td><td class="" style="vertical-align:top;width:70px;" ><![endif]--><div class="mj-column-px-70 outlook-group-fix" style="font-size:13px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;"><table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%"><tbody><tr><td style="vertical-align:top;padding-top:30px;"><table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%"><tr><td align="center" style="font-size:0px;padding:0px;word-break:break-word;"><div style="font-family:Poppins, sans-serif;font-size:18px;line-height:26px;text-align:center;color:#000000;"><a href="https://twitter.com/PEMSA_85"><img src="cid:logo-twitter" width="25px"></a></div></td></tr></table></td></tr></tbody></table></div><!--[if mso | IE]></td><td class="" style="vertical-align:top;width:70px;" ><![endif]--><div class="mj-column-px-70 outlook-group-fix" style="font-size:13px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;"><table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%"><tbody><tr><td style="vertical-align:top;padding-top:30px;"><table border="0" cellpadding="0" cellspacing="0" role="presentation" width="100%"><tr><td align="center" style="font-size:0px;padding:0px;word-break:break-word;"><div style="font-family:Poppins, sans-serif;font-size:18px;line-height:26px;text-align:center;color:#000000;"><a href="https://www.instagram.com/pemsa_85/"><img src="cid:logo-instagram" width="25px"></a></div></td></tr></table></td></tr></tbody></table></div><!--[if mso | IE]></td></tr></table><![endif]--></td></tr></tbody></table></div><!--[if mso | IE]></td></tr></table><table align="center" border="0" cellpadding="0" cellspacing="0" class="" style="width:600px;" width="600" ><tr><td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;"><![endif]--><div style="Margin:0px auto;max-width:600px;"><table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:100%;"><tbody><tr><td style="direction:ltr;font-size:0px;padding:0px;padding-bottom:50px;text-align:center;vertical-align:top;"><!--[if mso | IE]><table role="presentation" border="0" cellpadding="0" cellspacing="0"><tr><td class="" style="vertical-align:top;width:600px;" ><![endif]--><div class="mj-column-per-100 outlook-group-fix" style="font-size:13px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;"><table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;" width="100%"><tr><td align="center" style="font-size:0px;padding:0px;word-break:break-word;"><div style="font-family:Poppins, sans-serif;font-size:12px;line-height:20px;text-align:center;color:#000000;">Protección Electrónica Mnterrey S.A. de C.V. &copy; 2023 Protección Electrónica Mnterrey S.A. de C.V.Todos los derechos reservados.<br>Calle 33 Poniente #307 Col. Chulavista C.P. 72420 Puebla, Pue.<br>PERMISO SSP FEDERAL: DGSP/303-16/3302<br>PERMISO SSP EDO. DE PUEBLA: SSP/SUBCOP/DGSP/114-15/109</div></td></tr></table></div><!--[if mso | IE]></td></tr></table><![endif]--></td></tr></tbody></table></div><!--[if mso | IE]></td></tr></table><![endif]--></div></body></html>
    `;
  }

  onModuleInit() {

    this.transporter = nodemailer.createTransport({
      host: this.host,
      port: this.port,
      secure: (this.port === 465),
      auth: {
        user: this.mail,
        pass: this.password
      },
      tls: {
        rejectUnauthorized: false
      }
    })

    this.transporter.verify()
      .then(() => console.log("Email success"))
      .catch((err) => {
        throw new Error(`Error to connect with mail ${this.mail}. ${err}`);
      })
  }

}
