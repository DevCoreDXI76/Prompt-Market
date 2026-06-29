import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getPrompts } from "@/lib/supabase/prompts";
import { AdminPromptsManager } from "@/components/admin/AdminPromptsManager";

const ADMIN_USER_ID = process.env.ADMIN_CLERK_USER_ID;

export default async function AdminPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  if (ADMIN_USER_ID && userId !== ADMIN_USER_ID) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <div className="rounded-2xl border border-red-100 bg-red-50 p-8 dark:border-red-900/30 dark:bg-red-900/10">
          <p className="font-bold text-red-700 dark:text-red-400 text-lg mb-2">접근 거부</p>
          <p className="text-red-600 dark:text-red-500 text-sm">
            관리자 권한이 없습니다. <code className="bg-red-100 dark:bg-red-900/30 rounded px-1">ADMIN_CLERK_USER_ID</code> 환경변수를 확인하세요.
          </p>
        </div>
      </div>
    );
  }

  const prompts = await getPrompts();

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <AdminPromptsManager initialPrompts={prompts} />
    </div>
  );
}
