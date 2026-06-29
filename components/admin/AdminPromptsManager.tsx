"use client";

import { useState, useTransition } from "react";
import type { PromptProduct } from "@/lib/promptData";
import {
  createPromptAction,
  updatePromptAction,
  deletePromptAction,
} from "@/app/[locale]/admin/actions";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  ChevronDown,
  ChevronUp,
  Loader2,
  AlertTriangle,
} from "lucide-react";

const CATEGORIES = ["ChatGPT", "Midjourney", "Stable Diffusion", "Claude"] as const;

interface AdminPromptsManagerProps {
  initialPrompts: PromptProduct[];
}

interface FormState {
  id?: string;
  title: string;
  description: string;
  price: string;
  category: string;
  prompt_text: string;
  image_urls: string;
  tags: string;
  rating: string;
  author: string;
  views: string;
  sales_count: string;
}

const emptyForm: FormState = {
  title: "",
  description: "",
  price: "",
  category: "ChatGPT",
  prompt_text: "",
  image_urls: "",
  tags: "",
  rating: "0",
  author: "",
  views: "0",
  sales_count: "0",
};

function productToForm(p: PromptProduct): FormState {
  return {
    id: p.id,
    title: p.title,
    description: p.description,
    price: String(p.price),
    category: p.category,
    prompt_text: p.prompt_text,
    image_urls: p.images.join(", "),
    tags: p.tags.join(", "),
    rating: String(p.rating),
    author: p.author,
    views: String(p.views),
    sales_count: String(p.salesCount),
  };
}

function CategoryBadge({ category }: { category: string }) {
  const colorMap: Record<string, string> = {
    ChatGPT: "bg-emerald-50 text-emerald-700 border-emerald-100",
    Midjourney: "bg-indigo-50 text-indigo-700 border-indigo-100",
    "Stable Diffusion": "bg-purple-50 text-purple-700 border-purple-100",
    Claude: "bg-orange-50 text-orange-700 border-orange-100",
  };
  return (
    <span
      className={`inline-flex rounded-lg px-2 py-0.5 text-[10px] font-bold border ${colorMap[category] ?? "bg-slate-50 text-slate-700 border-slate-100"}`}
    >
      {category}
    </span>
  );
}

export function AdminPromptsManager({ initialPrompts }: AdminPromptsManagerProps) {
  const [prompts, setPrompts] = useState<PromptProduct[]>(initialPrompts);
  const [modal, setModal] = useState<"create" | "edit" | null>(null);
  const [editTarget, setEditTarget] = useState<PromptProduct | null>(null);
  const [formData, setFormData] = useState<FormState>(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState<PromptProduct | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const openCreate = () => {
    setFormData(emptyForm);
    setEditTarget(null);
    setModal("create");
    setErrorMsg(null);
  };

  const openEdit = (product: PromptProduct) => {
    setFormData(productToForm(product));
    setEditTarget(product);
    setModal("edit");
    setErrorMsg(null);
  };

  const closeModal = () => {
    setModal(null);
    setEditTarget(null);
    setErrorMsg(null);
  };

  const handleFieldChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(formData).forEach(([k, v]) => {
      if (v !== undefined) fd.set(k, v);
    });

    startTransition(async () => {
      const result =
        modal === "edit" && editTarget
          ? await updatePromptAction(editTarget.id, fd)
          : await createPromptAction(fd);

      if (!result.success) {
        setErrorMsg(result.error ?? "알 수 없는 오류가 발생했습니다.");
        return;
      }

      // 로컬 state 업데이트 (페이지 새로고침 없이 반영)
      if (modal === "create" && result.data) {
        setPrompts((prev) => [result.data!, ...prev]);
      } else if (modal === "edit" && result.data) {
        setPrompts((prev) =>
          prev.map((p) => (p.id === result.data!.id ? result.data! : p))
        );
      }

      closeModal();
    });
  };

  const handleDelete = (product: PromptProduct) => {
    startTransition(async () => {
      const result = await deletePromptAction(product.id);
      if (!result.success) {
        setErrorMsg(result.error ?? "삭제 실패");
        setDeleteTarget(null);
        return;
      }
      setPrompts((prev) => prev.filter((p) => p.id !== product.id));
      setDeleteTarget(null);
    });
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-zinc-50">
            프롬프트 관리
          </h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            총 {prompts.length}개의 프롬프트
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition-all cursor-pointer shadow-sm"
        >
          <Plus className="h-4 w-4" />
          새 프롬프트
        </button>
      </div>

      {errorMsg && !modal && (
        <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-red-700 text-sm dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>{errorMsg}</span>
          <button className="ml-auto text-red-400 hover:text-red-600 cursor-pointer" onClick={() => setErrorMsg(null)}>
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* 프롬프트 목록 */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-100 dark:border-zinc-800 overflow-hidden shadow-sm">
        {prompts.length === 0 ? (
          <div className="py-16 text-center text-slate-400 dark:text-zinc-600 text-sm">
            프롬프트가 없습니다. 새 프롬프트를 추가하세요.
          </div>
        ) : (
          <div className="divide-y divide-slate-50 dark:divide-zinc-800">
            {prompts.map((product) => {
              const isExpanded = expandedId === product.id;
              return (
                <div key={product.id}>
                  <div className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors">
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : product.id)}
                      className="p-1 text-slate-400 hover:text-slate-600 dark:text-zinc-600 dark:hover:text-zinc-400 cursor-pointer"
                    >
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </button>

                    <div className="w-12 text-[11px] font-mono text-slate-400 dark:text-zinc-600 truncate" title={product.id}>
                      {product.id}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-slate-800 dark:text-zinc-100 truncate">
                        {product.title}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <CategoryBadge category={product.category} />
                        <span className="text-[11px] text-slate-400 dark:text-zinc-600">
                          {product.price.toLocaleString()}원 · ★{product.rating} · {product.salesCount.toLocaleString()}판매
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => openEdit(product)}
                        className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all cursor-pointer dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-100"
                      >
                        <Pencil className="h-3 w-3" />
                        수정
                      </button>
                      <button
                        onClick={() => setDeleteTarget(product)}
                        className="flex items-center gap-1 rounded-lg border border-red-100 bg-white px-2.5 py-1.5 text-xs font-semibold text-red-500 hover:bg-red-50 hover:text-red-700 transition-all cursor-pointer dark:border-red-900/30 dark:bg-zinc-800 dark:text-red-400 dark:hover:text-red-300"
                      >
                        <Trash2 className="h-3 w-3" />
                        삭제
                      </button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="px-6 pb-4 pt-2 bg-slate-50/50 dark:bg-zinc-800/30 text-xs text-slate-600 dark:text-zinc-400 space-y-2 border-t border-slate-50 dark:border-zinc-800">
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                        <div><span className="font-semibold text-slate-700 dark:text-zinc-300">작가:</span> {product.author}</div>
                        <div><span className="font-semibold text-slate-700 dark:text-zinc-300">조회수:</span> {product.views.toLocaleString()}</div>
                        <div className="col-span-2">
                          <span className="font-semibold text-slate-700 dark:text-zinc-300">태그:</span>{" "}
                          {product.tags.join(", ")}
                        </div>
                        <div className="col-span-2">
                          <span className="font-semibold text-slate-700 dark:text-zinc-300">이미지:</span>{" "}
                          <span className="break-all">{product.images.join(", ")}</span>
                        </div>
                      </div>
                      <div>
                        <p className="font-semibold text-slate-700 dark:text-zinc-300 mb-1">설명:</p>
                        <p className="line-clamp-3 text-slate-500 dark:text-zinc-500">{product.description}</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 생성/수정 모달 */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl my-8">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-zinc-800">
              <h2 className="font-bold text-lg text-slate-900 dark:text-zinc-50">
                {modal === "create" ? "새 프롬프트 추가" : "프롬프트 수정"}
              </h2>
              <button
                onClick={closeModal}
                className="text-slate-400 hover:text-slate-600 dark:text-zinc-600 dark:hover:text-zinc-400 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {errorMsg && (
                <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-red-700 text-sm dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
                  {errorMsg}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {modal === "create" && (
                  <Field label="ID (빈칸 시 자동 생성)">
                    <input
                      name="id"
                      value={formData.id ?? ""}
                      onChange={handleFieldChange}
                      placeholder="예: 5 또는 자동 UUID"
                      className={inputClass}
                    />
                  </Field>
                )}

                <Field label="제목 *" className="sm:col-span-2">
                  <input
                    name="title"
                    value={formData.title}
                    onChange={handleFieldChange}
                    required
                    className={inputClass}
                  />
                </Field>

                <Field label="카테고리 *">
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleFieldChange}
                    required
                    className={inputClass}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="가격 (원) *">
                  <input
                    name="price"
                    type="number"
                    min="0"
                    value={formData.price}
                    onChange={handleFieldChange}
                    required
                    className={inputClass}
                  />
                </Field>

                <Field label="작가 *">
                  <input
                    name="author"
                    value={formData.author}
                    onChange={handleFieldChange}
                    required
                    className={inputClass}
                  />
                </Field>

                <Field label="평점 (0~5)">
                  <input
                    name="rating"
                    type="number"
                    min="0"
                    max="5"
                    step="0.1"
                    value={formData.rating}
                    onChange={handleFieldChange}
                    className={inputClass}
                  />
                </Field>

                <Field label="조회수">
                  <input
                    name="views"
                    type="number"
                    min="0"
                    value={formData.views}
                    onChange={handleFieldChange}
                    className={inputClass}
                  />
                </Field>

                <Field label="판매수">
                  <input
                    name="sales_count"
                    type="number"
                    min="0"
                    value={formData.sales_count}
                    onChange={handleFieldChange}
                    className={inputClass}
                  />
                </Field>

                <Field label="이미지 URL (쉼표 구분)" className="sm:col-span-2">
                  <input
                    name="image_urls"
                    value={formData.image_urls}
                    onChange={handleFieldChange}
                    placeholder="https://example.com/img1.jpg, https://..."
                    className={inputClass}
                  />
                </Field>

                <Field label="태그 (쉼표 구분)" className="sm:col-span-2">
                  <input
                    name="tags"
                    value={formData.tags}
                    onChange={handleFieldChange}
                    placeholder="태그1, 태그2, ..."
                    className={inputClass}
                  />
                </Field>

                <Field label="설명 *" className="sm:col-span-2">
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleFieldChange}
                    required
                    rows={4}
                    className={`${inputClass} resize-y`}
                  />
                </Field>

                <Field label="프롬프트 원문 *" className="sm:col-span-2">
                  <textarea
                    name="prompt_text"
                    value={formData.prompt_text}
                    onChange={handleFieldChange}
                    required
                    rows={5}
                    className={`${inputClass} resize-y font-mono text-xs`}
                  />
                </Field>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white hover:bg-slate-50 transition-all cursor-pointer dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all cursor-pointer shadow-sm"
                >
                  {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                  {modal === "create" ? "추가" : "저장"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 삭제 확인 다이얼로그 */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-white dark:bg-zinc-900 rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 dark:bg-red-900/20">
                <Trash2 className="h-5 w-5 text-red-500" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-zinc-50">프롬프트 삭제</h3>
            </div>
            <p className="text-sm text-slate-500 dark:text-zinc-400 mb-6">
              <span className="font-semibold text-slate-700 dark:text-zinc-200">{deleteTarget.title}</span>
              을(를) 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={isPending}
                className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 bg-white hover:bg-slate-50 transition-all cursor-pointer dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400"
              >
                취소
              </button>
              <button
                onClick={() => handleDelete(deleteTarget)}
                disabled={isPending}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-red-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-60 transition-all cursor-pointer"
              >
                {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                삭제
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const inputClass =
  "block w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500 transition-all outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-600 dark:focus:bg-zinc-700";

function Field({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
        {label}
      </label>
      {children}
    </div>
  );
}
