//Load from environment
require('dotenv').config({path : '../.env'});
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
  secure: true,
  host: 'smtp.gmail.com',
  auth: {
    user: process.env.NODEMAILER_ACCOUNT,
    pass: process.env.NODEMAILER_PASSWORD,
  }
});

module.exports = async function sendMail(to, otp) {
  const message = `
  <html>
    <head>
      <style>
        body {
          font-family: Arial, sans-serif;
          background-color: #f4f7fc;
          color: #333;
          padding: 20px;
        }
        .container {
          background-color: #ffffff;
          padding: 30px;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          max-width: 600px;
          margin: 0 auto;
        }
        h2 {
          color: #2c3e50;
          text-align: center;
        }
        p {
          font-size: 16px;
          line-height: 1.6;
        }
        .otp {
          background-color: #2ecc71;
          color: white;
          font-size: 24px;
          font-weight: bold;
          padding: 10px 20px;
          border-radius: 4px;
          display: inline-block;
          margin-top: 15px;
        }
        .footer {
          margin-top: 30px;
          text-align: center;
          font-size: 14px;
          color: #888;
        }
        .footer a {
          color: #3498db;
          text-decoration: none;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h2>Yêu Cầu Đặt Lại Mật Khẩu</h2>
        <p>Chào bạn,</p>
        <p>Chúng tôi đã nhận được yêu cầu đặt lại mật khẩu của bạn.Vui lòng không chia sẻ mã OTP với bất cứ ai khác ngoài bạn. Dưới đây là mã OTP của bạn:</p>
        <h3 class="otp">${otp}</h3>
        <p><strong>Thời gian hiệu lực của mã OTP là 2 phút. Hãy sử dụng ngay lập tức!</strong></p>
        <p>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này hoặc liên hệ với bộ phận hỗ trợ.</p>
        <div class="footer">
          <p>Trân trọng,</p>
          <p>4P NEWS</p>
        </div>
      </div>
    </body>
  </html>
  `;
  
  const sub = "Yêu cầu quên mật khẩu";

  // Awaiting the sendMail function to ensure it completes
  try {
    await transporter.sendMail({
      to: to,
      subject: sub,
      html: message
    });
  } catch (error) {
    console.error('Error sending email:', error);
  }
};
