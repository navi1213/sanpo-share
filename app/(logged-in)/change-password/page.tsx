import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ChangePasswordForm from "./change-password-form";

export default function ChangePassword() {
    return (
        <Card className="w-[350px]">
            <CardHeader>
                <CardTitle>
                パスワードの変更
                </CardTitle>
            </CardHeader>
        <CardContent>
            <ChangePasswordForm/>
        </CardContent>
        </Card>
    )
}