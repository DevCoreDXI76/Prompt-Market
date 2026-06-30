import { copyFileSync, chmodSync, existsSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, "..");
const hooksSrc = join(repoRoot, "scripts", "git-hooks");
const hooksDest = join(repoRoot, ".git", "hooks");

const HOOK_FILES = ["post-commit", "notion_task_logger.py"];

if (!existsSync(hooksDest)) {
  console.warn("⚠️  .git/hooks 디렉터리를 찾을 수 없습니다. git init 후 다시 실행하세요.");
  process.exit(0);
}

for (const file of HOOK_FILES) {
  const src = join(hooksSrc, file);
  const dest = join(hooksDest, file);
  if (!existsSync(src)) {
    console.warn(`⚠️  소스 훅 파일 없음: ${src}`);
    continue;
  }
  copyFileSync(src, dest);
  try {
    chmodSync(dest, 0o755);
  } catch {
    // Windows에서는 무시
  }
  console.log(`✓ ${file} → .git/hooks/${file}`);
}

console.log("Git hooks 설치 완료 (Notion Tasks 자동 기록)");
