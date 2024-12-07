"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";
import { activate2fa, disable2fa, get2faSecret } from "./actions";
import { useToast } from "@/hooks/use-toast";
import { QRCodeSVG } from "qrcode.react";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";

type Props = {
  twoFactorActivated: boolean;
};
export default function TwoFactorAuthForm({ twoFactorActivated }: Props) {
  const { toast } = useToast();
  const [isActivated, setIsActivated] = useState(twoFactorActivated);
  const [step, setStep] = useState(1);
  const [code, setCode] = useState("");
  const [otp, setOtp] = useState("");
  const handleEnableClick = async () => {
    const response = await get2faSecret();
    if (response.error) {
      toast({
        variant: "destructive",
        title: response.message,
      });
      return;
    }
    setStep(2);
    setCode(response.twoFactorSecret ?? "");
  };
  const handleOTPSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const response = await activate2fa(otp);
    if (response?.error) {
      toast({
        variant: "destructive",
        title: response.message,
      });
      return;
    }
    toast({
      className: "bg-green-500 text-white",
      title: "２段階認証が有効になりました",
    });
    setIsActivated(true);
  };
  const handleDisable2faClick = async () => {
    await disable2fa();
    toast({
      className: "bg-green-500 text-white",
      title: "２段階認証が無効になりました",
    });
    setIsActivated(false);
    setStep(1);
  };
  return (
    <div>
      {!!isActivated && (
        <Button variant="destructive" onClick={handleDisable2faClick}className="my-2">
          2段階認証を無効化する
        </Button>
      )}
      {!isActivated && (
        <div>
          {step === 1 && (
            <Button onClick={handleEnableClick} className="my-3">
              ２段階認証を有効にする
            </Button>
          )}
          {step === 2 && (
            <div>
              <p className="text-muted-foreground text-xs my-2">
                2段階認証を有効にするには、Google
                Authenticatorアプリで以下のQRコードをスキャンしてください。
              </p>
              <QRCodeSVG value={code} />
              <Button onClick={() => setStep(3)} className="w-full my-2">
                QRコードをスキャンしました
              </Button>
              <Button
                onClick={() => setStep(1)}
                variant="outline"
                className="w-full my-2"
              >
                設定を中止する
              </Button>
            </div>
          )}
          {step === 3 && (
            <form onSubmit={handleOTPSubmit} className="flex flex-col gap-2">
              <p className="text-xs text-muted-foreground">
                GoogleAuthenticatorで確認したワンタイムパスワードを入力してください
              </p>
              <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                </InputOTPGroup>
                <InputOTPSeparator />
                <InputOTPGroup>
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
              <Button disabled={otp.length !== 6} type="submit">
                送信
              </Button>
              <Button onClick={() => setStep(2)} variant="outline">
                キャンセル
              </Button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
