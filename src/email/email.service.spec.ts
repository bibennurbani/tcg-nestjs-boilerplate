import { Test, TestingModule } from '@nestjs/testing';
import { EmailService } from './email.service';
import { MailerService } from '@nestjs-modules/mailer';

describe('EmailService', () => {
  let service: EmailService;
  let mailerService: MailerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailService,
        {
          provide: MailerService,
          useValue: {
            sendMail: jest.fn(), // Mock the sendMail function
          },
        },
      ],
    }).compile();

    service = module.get<EmailService>(EmailService);
    mailerService = module.get<MailerService>(MailerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should send a verification email', async () => {
    const email = 'test@example.com';
    const token = 'test-token';
    const expectedUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

    await service.sendVerificationEmail(email, token);

    expect(mailerService.sendMail).toHaveBeenCalledWith({
      to: email,
      subject: 'Email Verification',
      template: './verification',
      context: { url: expectedUrl },
    });
  });

  it('should send a password reset email', async () => {
    const email = 'test@example.com';
    const token = 'test-token';
    const expectedUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

    await service.sendPasswordResetEmail(email, token);

    expect(mailerService.sendMail).toHaveBeenCalledWith({
      to: email,
      subject: 'Password Reset Request',
      template: './password-reset',
      context: { url: expectedUrl },
    });
  });
});
