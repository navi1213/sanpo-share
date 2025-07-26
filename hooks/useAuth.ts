import { useSession, signIn, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { UserLoginData } from "@/validation/schemas";

export const useAuth = () => {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const { toast } = useToast();

  const login = async (credentials: UserLoginData, redirectUrl?: string) => {
    try {
      const result = await signIn("credentials", {
        email: credentials.email,
        password: credentials.password,
        token: credentials.token,
        redirect: false,
      });

      if (result?.error) {
        toast({
          title: "ログインエラー",
          description: result.error,
          variant: "destructive",
        });
        return { success: false, error: result.error };
      }

      if (result?.ok) {
        await update();
        toast({
          title: "ログイン成功",
          description: "正常にログインしました",
        });
        
        if (redirectUrl) {
          router.push(redirectUrl);
        }
        return { success: true };
      }

      return { success: false, error: "ログインに失敗しました" };
    } catch (error) {
      toast({
        title: "エラー",
        description: "予期しないエラーが発生しました",
        variant: "destructive",
      });
      return { success: false, error: "予期しないエラーが発生しました" };
    }
  };

  const logout = async () => {
    try {
      await signOut({ redirect: false });
      await update();
      toast({
        title: "ログアウト",
        description: "正常にログアウトしました",
      });
      router.push("/");
    } catch (error) {
      toast({
        title: "エラー",
        description: "ログアウト中にエラーが発生しました",
        variant: "destructive",
      });
    }
  };

  const guestLogin = async () => {
    try {
      const result = await signIn("guest-login", {
        redirect: false,
      });

      if (result?.error) {
        toast({
          title: "ゲストログインエラー",
          description: result.error,
          variant: "destructive",
        });
        return { success: false, error: result.error };
      }

      if (result?.ok) {
        await update();
        toast({
          title: "ゲストログイン成功",
          description: "ゲストとしてログインしました",
        });
        return { success: true };
      }

      return { success: false, error: "ゲストログインに失敗しました" };
    } catch (error) {
      toast({
        title: "エラー",
        description: "予期しないエラーが発生しました",
        variant: "destructive",
      });
      return { success: false, error: "予期しないエラーが発生しました" };
    }
  };

  return {
    session,
    status,
    isAuthenticated: !!session,
    isLoading: status === "loading",
    login,
    logout,
    guestLogin,
  };
}; 