# -*- coding: utf-8 -*-
"""
Git post-commit hook: Notion Tasks DB 자동 기록
.env에서 NOTION_* 변수를 읽어 방금 완료된 커밋 정보를 Tasks DB에 기록합니다.
"""
import os
import sys
import subprocess
from pathlib import Path
from typing import Optional

if sys.stdout.encoding and sys.stdout.encoding.lower() not in ("utf-8", "utf8"):
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

try:
    import requests
except ImportError:
    print(
        "❌ Notion 기록 실패: requests 패키지가 없습니다. "
        "`pip install requests` 또는 `py -m pip install requests`로 설치하세요.",
        file=sys.stderr,
    )
    sys.exit(0)

NOTION_API = "https://api.notion.com/v1"
NOTION_VERSION = "2022-06-28"
RICH_TEXT_LIMIT = 2000

KNOWN_PREFIXES = [
    "feat",
    "fix",
    "refactor",
    "chore",
    "docs",
    "style",
    "test",
    "perf",
    "ci",
    "build",
]

VALID_TYPE_OPTIONS = set(KNOWN_PREFIXES)
VALID_TOOLS = {"Claude Code", "Cursor", "기타"}
VALID_PRIORITIES = {"높음", "보통", "낮음"}

PRIORITY_BY_PREFIX = {
    "fix": "높음",
    "feat": "보통",
    "refactor": "보통",
    "perf": "보통",
    "chore": "낮음",
    "docs": "낮음",
    "style": "낮음",
    "test": "낮음",
    "ci": "낮음",
    "build": "낮음",
}

DEFAULT_TEST_RESULT = "훅 자동 등록 — 수동 테스트 필요"


def load_env(repo_root: str) -> dict:
    env_file = Path(repo_root) / ".env"
    if not env_file.exists():
        raise FileNotFoundError(f".env 파일을 찾을 수 없습니다: {env_file}")

    env = {}
    with open(env_file, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, _, value = line.partition("=")
            env[key.strip()] = value.strip().strip("\"'")
    return env


def git_cmd(args: list) -> str:
    result = subprocess.run(
        ["git"] + args,
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
    )
    return result.stdout.strip().lstrip("\ufeff")


def get_commit_info(commit_ref: str = "HEAD") -> tuple:
    message = git_cmd(["log", "-1", "--pretty=%B", commit_ref])
    commit_hash = git_cmd(["log", "-1", "--pretty=%H", commit_ref])
    author_time = git_cmd(["log", "-1", "--pretty=%aI", commit_ref])
    commit_time = git_cmd(["log", "-1", "--pretty=%cI", commit_ref])
    changed_files = git_cmd(
        ["diff-tree", "--no-commit-id", "--name-only", "-r", commit_hash]
    )

    try:
        remote_url = git_cmd(["remote", "get-url", "origin"])
    except Exception:
        remote_url = ""

    return message, commit_hash, author_time, commit_time, changed_files, remote_url


def parse_commit_message(message: str) -> tuple:
    """prefix: 작업 유형, task_name: 커밋 첫 줄 전체 (feat: 포함)"""
    first_line = message.split("\n")[0].strip()

    for prefix in KNOWN_PREFIXES:
        if first_line.lower().startswith(prefix + ":"):
            return prefix.lower(), first_line

    return "", first_line


def get_body_lines(message: str) -> list[str]:
    lines = message.split("\n")[1:]
    result = []
    for line in lines:
        stripped = line.strip()
        if not stripped:
            continue
        if stripped.lower().startswith("co-authored-by:"):
            continue
        result.append(stripped)
    return result


def extract_lessons_learned(message: str) -> str:
    body_lines = get_body_lines(message)
    if not body_lines:
        return ""

    sections = []
    current = []
    stop_markers = ("test plan:", "## test plan", "prompt:", "프롬프트:")

    for line in body_lines:
        lower = line.lower()
        if any(lower.startswith(m) for m in stop_markers):
            break
        current.append(line)

    if current:
        sections.append("\n".join(current))

    text = "\n".join(sections).strip()
    return text[:RICH_TEXT_LIMIT]


def extract_test_plan(message: str) -> str:
    lines = message.split("\n")
    capture = False
    collected = []

    for line in lines:
        stripped = line.strip()
        lower = stripped.lower()
        if lower.startswith("test plan:") or lower.startswith("## test plan"):
            capture = True
            if lower.startswith("test plan:"):
                after = stripped.split(":", 1)[1].strip()
                if after:
                    collected.append(after)
            continue
        if capture:
            if lower.startswith("prompt:") or lower.startswith("프롬프트:"):
                break
            if stripped.startswith("#") and "test plan" not in lower:
                break
            collected.append(line.rstrip())

    text = "\n".join(collected).strip()
    return text[:RICH_TEXT_LIMIT] if text else DEFAULT_TEST_RESULT


def extract_prompt(message: str, env: dict) -> str:
    env_prompt = env.get("NOTION_PROMPT", "").strip()
    if env_prompt:
        return env_prompt[:RICH_TEXT_LIMIT]

    for line in message.split("\n"):
        stripped = line.strip()
        for marker in ("Prompt:", "prompt:", "프롬프트:", "PROMPT:"):
            if stripped.startswith(marker):
                value = stripped[len(marker) :].strip()
                if value:
                    return value[:RICH_TEXT_LIMIT]
    return ""


def detect_vibe_tool(message: str, env: dict) -> str:
    override = os.environ.get("VIBE_CODING_TOOL") or env.get("VIBE_CODING_TOOL", "")
    if override in VALID_TOOLS:
        return override

    lower_msg = message.lower()
    if "co-authored-by: cursor" in lower_msg:
        return "Cursor"
    if "co-authored-by: claude" in lower_msg:
        return "Claude Code"

    return "기타"


def map_priority(prefix: str) -> str:
    return PRIORITY_BY_PREFIX.get(prefix, "보통")


def format_changed_files(changed_files: str) -> tuple[str, list[str]]:
    if not changed_files:
        return "", []

    files = [f for f in changed_files.split("\n") if f.strip()]
    full_text = "\n".join(files)

    if len(full_text) <= RICH_TEXT_LIMIT:
        return full_text, []

    truncated_lines = []
    current_len = 0
    for f in files:
        line = f + "\n"
        if current_len + len(line) > RICH_TEXT_LIMIT - 30:
            break
        truncated_lines.append(f)
        current_len += len(line)

    remaining = len(files) - len(truncated_lines)
    summary = "\n".join(truncated_lines)
    if remaining > 0:
        summary += f"\n... (+{remaining} more)"
    return summary[:RICH_TEXT_LIMIT], files


def build_commit_url(remote_url: str, commit_hash: str) -> str:
    if not remote_url or "github.com" not in remote_url:
        return ""

    url = remote_url
    if url.startswith("git@github.com:"):
        url = "https://github.com/" + url[15:]
    if url.endswith(".git"):
        url = url[:-4]

    return f"{url}/commit/{commit_hash}"


def notion_headers(token: str) -> dict:
    return {
        "Authorization": f"Bearer {token}",
        "Notion-Version": NOTION_VERSION,
        "Content-Type": "application/json",
    }


def append_file_blocks(token: str, page_id: str, files: list[str]) -> None:
    if not files:
        return

    children = [
        {
            "object": "block",
            "type": "heading_3",
            "heading_3": {
                "rich_text": [{"type": "text", "text": {"content": "변경 파일 (전체)"}}]
            },
        }
    ]

    chunk = []
    chunk_len = 0
    for path in files:
        line = path + "\n"
        if chunk_len + len(line) > 1800 and chunk:
            children.append(
                {
                    "object": "block",
                    "type": "paragraph",
                    "paragraph": {
                        "rich_text": [
                            {"type": "text", "text": {"content": "".join(chunk)[:2000]}}
                        ]
                    },
                }
            )
            chunk = []
            chunk_len = 0
        chunk.append(line)
        chunk_len += len(line)

    if chunk:
        children.append(
            {
                "object": "block",
                "type": "paragraph",
                "paragraph": {
                    "rich_text": [
                        {"type": "text", "text": {"content": "".join(chunk)[:2000]}}
                    ]
                },
            }
        )

    response = requests.patch(
        f"{NOTION_API}/blocks/{page_id}/children",
        headers=notion_headers(token),
        json={"children": children},
        timeout=15,
    )
    if not response.ok:
        print(
            f"⚠️  변경 파일 블록 추가 실패: {response.status_code} {response.text[:200]}",
            file=sys.stderr,
        )


def build_task_properties(
    project_page_id: str,
    plan_page_id: str,
    task_name: str,
    prefix: str,
    commit_url: str,
    changed_files_summary: str,
    author_time: str,
    commit_time: str,
    lessons: str,
    test_result: str,
    prompt_text: str,
    vibe_tool: str,
    priority: str,
) -> dict:
    properties = {
        "Task명": {"title": [{"text": {"content": task_name[:2000]}}]},
        "상태": {"select": {"name": "완료"}},
        "프로젝트": {"relation": [{"id": project_page_id}]},
        "사용 도구": {"select": {"name": vibe_tool if vibe_tool in VALID_TOOLS else "기타"}},
    }

    if commit_url:
        properties["커밋 링크"] = {"url": commit_url}

    if changed_files_summary:
        properties["변경 파일"] = {
            "rich_text": [{"text": {"content": changed_files_summary}}]
        }

    if prefix and prefix in VALID_TYPE_OPTIONS:
        properties["작업 유형"] = {"select": {"name": prefix}}

    if author_time:
        properties["시작 시각"] = {"date": {"start": author_time}}

    if commit_time:
        properties["완료 시각"] = {"date": {"start": commit_time}}

    if lessons:
        properties["배운 점"] = {"rich_text": [{"text": {"content": lessons}}]}

    if plan_page_id:
        properties["관련 PLAN"] = {"relation": [{"id": plan_page_id}]}

    if priority in VALID_PRIORITIES:
        properties["우선순위"] = {"select": {"name": priority}}

    if test_result:
        properties["테스트 결과"] = {"rich_text": [{"text": {"content": test_result}}]}

    if prompt_text:
        properties["프롬프트 원문"] = {"rich_text": [{"text": {"content": prompt_text}}]}

    return properties


def query_tasks_db(token: str, tasks_db_id: str, body: dict) -> list:
    response = requests.post(
        f"{NOTION_API}/databases/{tasks_db_id}/query",
        headers=notion_headers(token),
        json=body,
        timeout=15,
    )
    if not response.ok:
        raise RuntimeError(
            f"Notion query {response.status_code}: {response.text[:500]}"
        )
    return response.json().get("results", [])


def find_existing_task(
    token: str,
    tasks_db_id: str,
    commit_hash: str,
    commit_url: str,
    task_name: str,
) -> Optional[dict]:
    if commit_url:
        for fragment in (commit_hash, commit_hash[:7]):
            results = query_tasks_db(
                token,
                tasks_db_id,
                {
                    "filter": {
                        "property": "커밋 링크",
                        "url": {"contains": fragment},
                    }
                },
            )
            if results:
                return results[0]

    title_without_prefix = task_name
    for prefix in KNOWN_PREFIXES:
        marker = prefix + ":"
        if task_name.lower().startswith(marker):
            title_without_prefix = task_name[len(marker) :].strip()
            break

    for candidate in {task_name, title_without_prefix}:
        if not candidate:
            continue
        results = query_tasks_db(
            token,
            tasks_db_id,
            {
                "filter": {
                    "property": "Task명",
                    "title": {"contains": candidate[:100]},
                }
            },
        )
        if results:
            return results[0]

    return None


def create_notion_task(
    token: str,
    tasks_db_id: str,
    properties: dict,
    all_files: list[str],
) -> dict:
    response = requests.post(
        f"{NOTION_API}/pages",
        headers=notion_headers(token),
        json={"parent": {"database_id": tasks_db_id}, "properties": properties},
        timeout=15,
    )

    if not response.ok:
        raise RuntimeError(f"Notion API {response.status_code}: {response.text[:500]}")

    page = response.json()

    if all_files:
        append_file_blocks(token, page["id"], all_files)

    return page


def update_notion_task(token: str, page_id: str, properties: dict) -> dict:
    response = requests.patch(
        f"{NOTION_API}/pages/{page_id}",
        headers=notion_headers(token),
        json={"properties": properties},
        timeout=15,
    )

    if not response.ok:
        raise RuntimeError(f"Notion API {response.status_code}: {response.text[:500]}")

    return response.json()


def upsert_notion_task(
    token: str,
    tasks_db_id: str,
    project_page_id: str,
    plan_page_id: str,
    task_name: str,
    prefix: str,
    commit_hash: str,
    commit_url: str,
    changed_files_summary: str,
    all_files: list[str],
    author_time: str,
    commit_time: str,
    lessons: str,
    test_result: str,
    prompt_text: str,
    vibe_tool: str,
    priority: str,
    update_only: bool = False,
) -> tuple[str, str]:
    properties = build_task_properties(
        project_page_id,
        plan_page_id,
        task_name,
        prefix,
        commit_url,
        changed_files_summary,
        author_time,
        commit_time,
        lessons,
        test_result,
        prompt_text,
        vibe_tool,
        priority,
    )

    existing = find_existing_task(
        token, tasks_db_id, commit_hash, commit_url, task_name
    )

    if existing:
        update_notion_task(token, existing["id"], properties)
        if all_files:
            append_file_blocks(token, existing["id"], all_files)
        return "updated", task_name

    if update_only:
        raise LookupError(
            f"기존 Task를 찾을 수 없습니다: {task_name} ({commit_hash[:7]})"
        )

    create_notion_task(token, tasks_db_id, properties, all_files)
    return "created", task_name


def parse_args(argv: list[str]) -> tuple:
    repo_root = os.getcwd()
    commit_ref = "HEAD"
    update_only = False
    backfill_refs: list[str] = []

    i = 0
    while i < len(argv):
        arg = argv[i]
        if arg == "--commit" and i + 1 < len(argv):
            commit_ref = argv[i + 1]
            i += 2
            continue
        if arg == "--update":
            update_only = True
            i += 1
            continue
        if arg == "--backfill" and i + 1 < len(argv):
            backfill_refs = [
                ref.strip() for ref in argv[i + 1].split(",") if ref.strip()
            ]
            i += 2
            continue
        if not arg.startswith("-") and repo_root == os.getcwd():
            repo_root = arg
        i += 1

    return repo_root, commit_ref, update_only, backfill_refs


def process_commit(
    repo_root: str,
    env: dict,
    commit_ref: str,
    update_only: bool,
) -> tuple[str, str]:
    token = env["NOTION_TOKEN"]
    tasks_db_id = env["NOTION_TASKS_DB_ID"]
    project_page_id = env["NOTION_PROJECT_PAGE_ID"]
    plan_page_id = env.get("NOTION_PLAN_PAGE_ID", "")

    message, commit_hash, author_time, commit_time, changed_files, remote_url = (
        get_commit_info(commit_ref)
    )
    prefix, task_name = parse_commit_message(message)
    commit_url = build_commit_url(remote_url, commit_hash)
    vibe_tool = detect_vibe_tool(message, env)
    lessons = extract_lessons_learned(message)
    test_result = extract_test_plan(message)
    prompt_text = extract_prompt(message, env)
    priority = map_priority(prefix)
    files_summary, overflow_files = format_changed_files(changed_files)

    return upsert_notion_task(
        token,
        tasks_db_id,
        project_page_id,
        plan_page_id,
        task_name,
        prefix,
        commit_hash,
        commit_url,
        files_summary,
        overflow_files,
        author_time,
        commit_time,
        lessons,
        test_result,
        prompt_text,
        vibe_tool,
        priority,
        update_only=update_only,
    )


def main():
    repo_root, commit_ref, update_only, backfill_refs = parse_args(sys.argv[1:])

    env = load_env(repo_root)
    token = env.get("NOTION_TOKEN", "")
    tasks_db_id = env.get("NOTION_TASKS_DB_ID", "")
    project_page_id = env.get("NOTION_PROJECT_PAGE_ID", "")

    if not all([token, tasks_db_id, project_page_id]):
        raise ValueError(
            "NOTION_TOKEN, NOTION_TASKS_DB_ID, NOTION_PROJECT_PAGE_ID가 "
            ".env에 모두 설정되어야 합니다."
        )

    env["NOTION_TOKEN"] = token
    env["NOTION_TASKS_DB_ID"] = tasks_db_id
    env["NOTION_PROJECT_PAGE_ID"] = project_page_id

    refs = backfill_refs if backfill_refs else [commit_ref]

    for ref in refs:
        action, task_name = process_commit(repo_root, env, ref, update_only)
        verb = "업데이트" if action == "updated" else "기록"
        print(f"✅ Notion Tasks {verb} ({ref[:7]}): {task_name}")


if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print(f"❌ Notion 기록 실패 (커밋은 정상 완료): {e}", file=sys.stderr)
        sys.exit(0)
