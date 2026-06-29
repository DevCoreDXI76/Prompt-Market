import { redirect } from "next/navigation";

/**
 * /login은 하위 호환성을 위해 /sign-in으로 리다이렉트합니다.
 * Clerk의 공식 로그인 페이지는 /sign-in 입니다.
 */
export default function LoginPage() {
  redirect("/sign-in");
}
