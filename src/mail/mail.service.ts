import { Injectable, Logger } from '@nestjs/common';
import { I18nContext } from 'nestjs-i18n';
import { MailData } from './interfaces/mail-data.interface';
import path from 'path';
import fs from 'node:fs/promises';
import Handlebars from 'handlebars';
import SendGrid from '@sendgrid/mail';
import { ApiConfigService } from '@/shared/services/api-config.service';
import { MaybeType } from '@/utils/types/maybe.type';

@Injectable()
export class MailService {
  constructor(private readonly apiConfigService: ApiConfigService) {
    SendGrid.setApiKey(this.apiConfigService.sendGridConfig.apiKey);
  }

  private async sendMail({
    templatePath,
    context,
    ...mailOptions
  }: {
    to: string;
    subject: MaybeType<string>;
    text?: string;
    html?: string;
    templatePath: string;
    context: Record<string, unknown>;
  }): Promise<void> {
    let html: string | undefined;
    if (templatePath) {
      const template = await fs.readFile(templatePath, 'utf-8');
      html = Handlebars.compile(template, {
        strict: true,
      })(context);
    }

    const mail = {
      to: mailOptions.to,
      from: this.apiConfigService.sendGridConfig.sender,
      subject: mailOptions.subject,
      text: mailOptions.text,
      html: mailOptions.html || html,
    } as SendGrid.MailDataRequired;

    try {
      const response = await SendGrid.send(mail);
      Logger.debug(response[0].toString());
    } catch (error) {
      Logger.error(error);
      throw new Error('Error sending email.');
    }
  }

  async userSignUp(mailData: MailData<{ hash: string }>): Promise<void> {
    const i18n = I18nContext.current();
    let emailConfirmTitle: MaybeType<string>;
    let text1: MaybeType<string>;
    let text2: MaybeType<string>;
    let text3: MaybeType<string>;

    if (i18n) {
      [emailConfirmTitle, text1, text2, text3] = await Promise.all([
        i18n.t('common.confirmEmail'),
        i18n.t('confirm-email.text1'),
        i18n.t('confirm-email.text2'),
        i18n.t('confirm-email.text3'),
      ]);
    }

    const url = new URL(
      this.apiConfigService.frontendDomain + '/confirm-email',
    );
    url.searchParams.set('hash', mailData.data.hash);

    await this.sendMail({
      to: mailData.to,
      subject: emailConfirmTitle,
      text: `${url.toString()} ${emailConfirmTitle}`,
      templatePath: path.join(
        this.apiConfigService.workingDirectory,
        'src',
        'mail',
        'mail-templates',
        'activation.hbs',
      ),
      context: {
        title: emailConfirmTitle,
        url: url.toString(),
        actionTitle: emailConfirmTitle,
        app_name: this.apiConfigService.appConfig.name,
        text1,
        text2,
        text3,
      },
    });
  }

  async createUser(
    mailData: MailData<{ hash: string; password: string }>,
  ): Promise<void> {
    const i18n = I18nContext.current();
    let emailConfirmTitle: MaybeType<string>;
    let text1: MaybeType<string>;
    let text2: MaybeType<string>;
    let text3: MaybeType<string>;
    let passwordText: MaybeType<string>;

    if (i18n) {
      [emailConfirmTitle, text1, text2, text3, passwordText] =
        await Promise.all([
          i18n.t('common.confirmEmail'),
          i18n.t('create-user.text1'),
          i18n.t('create-user.text2'),
          i18n.t('create-user.text3'),
          i18n.t('create-user.passwordText'),
        ]);
    }

    const url = new URL(
      this.apiConfigService.frontendDomain + '/confirm-email',
    );
    url.searchParams.set('hash', mailData.data.hash);

    await this.sendMail({
      to: mailData.to,
      subject: emailConfirmTitle,
      text: `${url.toString()} ${emailConfirmTitle}`,
      templatePath: path.join(
        this.apiConfigService.workingDirectory,
        'src',
        'mail',
        'mail-templates',
        'create-user.hbs',
      ),
      context: {
        title: emailConfirmTitle,
        url: url.toString(),
        actionTitle: emailConfirmTitle,
        app_name: this.apiConfigService.appConfig.name,
        text1,
        text2,
        text3,
        password_text: passwordText,
        password: mailData.data.password,
      },
    });
  }

  async forgotPassword(
    mailData: MailData<{ hash: string; tokenExpires: number }>,
  ): Promise<void> {
    const i18n = I18nContext.current();
    let resetPasswordTitle: MaybeType<string>;
    let text1: MaybeType<string>;
    let text2: MaybeType<string>;
    let text3: MaybeType<string>;
    let text4: MaybeType<string>;

    if (i18n) {
      [resetPasswordTitle, text1, text2, text3, text4] = await Promise.all([
        i18n.t('common.resetPassword'),
        i18n.t('reset-password.text1'),
        i18n.t('reset-password.text2'),
        i18n.t('reset-password.text3'),
        i18n.t('reset-password.text4'),
      ]);
    }

    const url = new URL(
      this.apiConfigService.frontendDomain + '/password-change',
    );
    url.searchParams.set('hash', mailData.data.hash);
    url.searchParams.set('expires', mailData.data.tokenExpires.toString());

    await this.sendMail({
      to: mailData.to,
      subject: resetPasswordTitle,
      text: `${url.toString()} ${resetPasswordTitle}`,
      templatePath: path.join(
        this.apiConfigService.workingDirectory,
        'src',
        'mail',
        'mail-templates',
        'reset-password.hbs',
      ),
      context: {
        title: resetPasswordTitle,
        url: url.toString(),
        actionTitle: resetPasswordTitle,
        app_name: this.apiConfigService.appConfig.name,
        text1,
        text2,
        text3,
        text4,
      },
    });
  }

  async confirmNewEmail(mailData: MailData<{ hash: string }>): Promise<void> {
    const i18n = I18nContext.current();
    let emailConfirmTitle: MaybeType<string>;
    let text1: MaybeType<string>;
    let text2: MaybeType<string>;
    let text3: MaybeType<string>;

    if (i18n) {
      [emailConfirmTitle, text1, text2, text3] = await Promise.all([
        i18n.t('common.confirmEmail'),
        i18n.t('confirm-new-email.text1'),
        i18n.t('confirm-new-email.text2'),
        i18n.t('confirm-new-email.text3'),
      ]);
    }

    const url = new URL(
      this.apiConfigService.frontendDomain + '/confirm-new-email',
    );
    url.searchParams.set('hash', mailData.data.hash);

    await this.sendMail({
      to: mailData.to,
      subject: emailConfirmTitle,
      text: `${url.toString()} ${emailConfirmTitle}`,
      templatePath: path.join(
        this.apiConfigService.workingDirectory,
        'src',
        'mail',
        'mail-templates',
        'confirm-new-email.hbs',
      ),
      context: {
        title: emailConfirmTitle,
        url: url.toString(),
        actionTitle: emailConfirmTitle,
        app_name: this.apiConfigService.appConfig.name,
        text1,
        text2,
        text3,
      },
    });
  }
}
