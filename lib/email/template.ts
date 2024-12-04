export const passwordResetEmail = (emailAddress: string, resetLink: string) => `
  <div style="font-family: Arial, sans-serif; line-height: 1.6; color: black;">
    <h2 style="margin-top: 0; color: #333;">パスワード再設定のご案内</h2>
    <p style="color: black;">こんにちは ${emailAddress} 様,</p>
    <p style="color: black;">お客様のアカウントのパスワード再設定を希望されましたので、以下のリンクから再設定を行ってください。</p>
    <p style="text-align: center; margin: 20px 0;">
      <a href="${resetLink}" style="
        display: inline-block;
        background-color: #4CAF50;
        color: white;
        text-decoration: none;
        padding: 10px 20px;
        border-radius: 5px;
        font-weight: bold;
      ">パスワードを再設定する</a>
    </p>
    <p style="color: black;">このリンクは<strong>1時間</strong>の間のみ有効です。</p>
    <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
    <p style="color: black;">このメールに心当たりがない場合は、このメールを無視してください。アカウントは安全です。</p>
  </div>
`;