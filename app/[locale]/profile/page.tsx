"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { Camera, Edit2, Check, X, Shield, Mail, User, UploadCloud } from "lucide-react";

export default function ProfilePage() {
  const t = useTranslations("ProfilePage");
  const { user, updateProfile } = useAuth();
  const { addToast } = useToast();
  const router = useRouter();

  const [editMode, setEditMode] = useState(false);
  const [nicknameInput, setNicknameInput] = useState(user?.nickname || "");
  const [avatarPreview, setAvatarPreview] = useState("");
  const [dragActive, setDragActive] = useState(false);

  React.useEffect(() => {
    if (user?.profileImage && !avatarPreview) {
      setAvatarPreview(user.profileImage);
    }
  }, [user?.profileImage]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!user) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
        <div className="text-center">
          <p className="text-slate-500 dark:text-zinc-400">{t("loginRequired")}</p>
          <button
            onClick={() => router.push("/sign-in")}
            className="mt-4 rounded-xl bg-slate-900 px-4 py-2 text-xs sm:text-sm font-semibold text-white hover:bg-slate-800 transition-all cursor-pointer dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
          >
            {t("goToLogin")}
          </button>
        </div>
      </div>
    );
  }

  const handleImageFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      addToast(t("imageOnly"));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const b64 = e.target?.result as string;
      if (b64) {
        setAvatarPreview(b64);
        updateProfile(user.nickname, b64);
        addToast(t("imageChanged"));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleImageFile(e.target.files[0]);
    }
  };

  const onAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageFile(e.dataTransfer.files[0]);
    }
  };

  const handleEditClick = () => {
    setNicknameInput(user.nickname);
    setEditMode(true);
  };

  const handleSaveNickname = () => {
    if (!nicknameInput.trim()) {
      addToast(t("nicknameRequired"));
      return;
    }
    updateProfile(nicknameInput.trim(), avatarPreview);
    setEditMode(false);
  };

  const handleCancelEdit = () => {
    setNicknameInput(user.nickname);
    setEditMode(false);
  };

  return (
    <div id="profile-page-container" className="mx-auto max-w-2xl px-4 py-8 sm:py-12">
      <h1 className="font-display font-bold text-2xl sm:text-3xl text-slate-900 mb-8 border-b border-slate-100 pb-4 dark:text-zinc-50 dark:border-zinc-800">
        {t("title")}
      </h1>

      <div className="rounded-3xl border border-slate-100 bg-white p-6 sm:p-10 shadow-xl space-y-10 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex flex-col items-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4 dark:text-zinc-500">{t("profileImage")}</p>

          <div
            id="avatar-upload-zone"
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={onAvatarClick}
            className={`group relative h-28 w-28 cursor-pointer rounded-full border-2 overflow-hidden shadow-md transition-all ${
              dragActive ? "border-indigo-600 scale-105 bg-indigo-50/10" : "border-slate-200 hover:border-slate-300 dark:border-zinc-700 dark:hover:border-zinc-500"
            }`}
          >
            <input
              id="avatar-file-input"
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />

            {(avatarPreview || user?.profileImage) && (
              <img
                src={avatarPreview || user?.profileImage}
                alt={t("profileImage")}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            )}

            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <Camera className="h-5 w-5 mb-1" />
              <span className="text-[10px] font-bold">{t("changePhoto")}</span>
            </div>

            {dragActive && (
              <div className="absolute inset-0 flex items-center justify-center bg-indigo-600/90 text-white">
                <UploadCloud className="h-8 w-8 animate-bounce" />
              </div>
            )}
          </div>

          <p className="mt-3 text-[11px] text-slate-400 text-center dark:text-zinc-500 whitespace-pre-line">
            {t("uploadHint")}
          </p>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label id="label-email" htmlFor="email-display" className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 dark:text-zinc-500">
              <Mail className="h-3.5 w-3.5" />
              <span>{t("emailLabel")}</span>
            </label>
            <div className="relative">
              <input
                id="email-display"
                type="text"
                disabled
                value={user.email}
                className="block w-full rounded-2xl border border-slate-100 bg-slate-50 py-3 px-4 text-xs sm:text-sm text-slate-400 cursor-not-allowed select-none font-sans font-medium dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-500"
              />
              <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                <Shield className="h-4 w-4 text-slate-300 dark:text-zinc-600" />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label id="label-nickname" className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 dark:text-zinc-500">
              <User className="h-3.5 w-3.5" />
              <span>{t("nicknameLabel")}</span>
            </label>

            {editMode ? (
              <div id="nickname-edit-block" className="flex flex-col sm:flex-row gap-2.5">
                <input
                  id="nickname-edit-input"
                  type="text"
                  placeholder={t("nicknamePlaceholder")}
                  value={nicknameInput}
                  onChange={(e) => setNicknameInput(e.target.value)}
                  maxLength={15}
                  className="flex-1 rounded-2xl border border-slate-200 bg-white py-3 px-4 text-xs sm:text-sm text-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-indigo-500"
                />
                <div className="flex gap-2 shrink-0">
                  <button
                    id="nickname-save-btn"
                    onClick={handleSaveNickname}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-1 rounded-xl bg-slate-900 px-4 py-3 text-xs sm:text-sm font-semibold text-white hover:bg-slate-800 transition-all cursor-pointer dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
                  >
                    <Check className="h-4 w-4 text-emerald-400 dark:text-emerald-600" />
                    <span>{t("saveNickname")}</span>
                  </button>
                  <button
                    id="nickname-cancel-btn"
                    onClick={handleCancelEdit}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-1 rounded-xl border border-slate-200 px-4 py-3 text-xs sm:text-sm font-semibold text-slate-600 bg-white hover:bg-slate-50 transition-all cursor-pointer dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
                  >
                    <X className="h-4 w-4 text-rose-400" />
                    <span>{t("cancelEdit")}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div id="nickname-read-block" className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/50 p-4 dark:border-zinc-800 dark:bg-zinc-800/50">
                <span className="text-sm sm:text-base font-bold text-slate-800 dark:text-zinc-100">
                  {user.nickname}
                </span>
                <button
                  id="nickname-edit-trigger"
                  onClick={handleEditClick}
                  className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300 transition-all cursor-pointer dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-700 dark:hover:text-zinc-100"
                >
                  <Edit2 className="h-3 w-3 text-slate-400 dark:text-zinc-500" />
                  <span>{t("editNickname")}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
