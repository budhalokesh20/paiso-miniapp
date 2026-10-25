const nodemailer = require('nodemailer');
require('fs').readFileSync('.env', 'utf8').split(/\r?\n/).forEach(l => {
  const line = l.trim();
  if (!line || line.startsWith('#')) return;
  const idx = line.indexOf('=');
  if (idx !== -1) process.env[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
});

console.log('Testing SMTP connection with:');
console.log('Host:', process.env.SMTP_HOST);
console.log('Port:', process.env.SMTP_PORT);
console.log('User:', process.env.SMTP_USER);
console.log('Pass length:', process.env.SMTP_PASS ? process.env.SMTP_PASS.length : 0);

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: +(process.env.SMTP_PORT || 465),
  secure: (process.env.SMTP_PORT || '465') === '465',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  },
  debug: true,
  logger: true
});

transporter.verify()
  .then(() => {
    console.log('✅ SMTP transporter verify PASSED');
    return transporter.sendMail({
      from: `"Paiso Verification" <${process.env.SMTP_USER}>`,
      to: 'budhalokesh20@gmail.com',
      subject: 'Test Email from Paiso Debugger',
      html: '<h3>Test Email</h3><p>Testing email delivery directly from Paiso server.</p>'
    });
  })
  .then((info) => {
    console.log('✅ Email sent successfully!');
    console.log('Message ID:', info.messageId);
    console.log('Response:', info.response);
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ Email error:', err);
    process.exit(1);
  });
