"use client";

import { FormEvent, useState } from "react";

type Status = "idle" | "loading" | "success" | "error";

export function ContactForm({
  defaultSubject,
  productId,
  serviceId,
  content,
}: {
  defaultSubject?: string;
  productId?: string;
  serviceId?: string;
  content?: {
    formHeading?: string;
    nameLabel?: string;
    emailFieldLabel?: string;
    phoneFieldLabel?: string;
    companyFieldLabel?: string;
    inquiryTypeLabel?: string;
    inquiryTypeOptions?: string[];
    subjectLabel?: string;
    messageLabel?: string;
    submitButtonText?: string;
    successMessage?: string;
    errorMessage?: string;
  };
}) {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  const nameLabel = content?.nameLabel || "Name";
  const emailFieldLabel = content?.emailFieldLabel || "Email";
  const phoneFieldLabel = content?.phoneFieldLabel || "Phone";
  const companyFieldLabel = content?.companyFieldLabel || "Company / Workshop";
  const inquiryTypeLabel = content?.inquiryTypeLabel || "Inquiry type";
  const inquiryTypeOptions =
    Array.isArray(content?.inquiryTypeOptions) && content.inquiryTypeOptions.length > 0
      ? content.inquiryTypeOptions
      : ["Product quote", "Parts sourcing", "Technical service", "Other"];
  const subjectLabel = content?.subjectLabel || "Subject";
  const messageLabel = content?.messageLabel || "Message";
  const submitButtonText = content?.submitButtonText || "Send inquiry";
  const successMsg = content?.successMessage || "Message received. We will reply shortly.";
  const fallbackErrorMsg = content?.errorMessage || "Failed to send message. Please try again.";

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setError("");
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          product: productId,
          service: serviceId,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || fallbackErrorMsg);
      }
      setStatus("success");
      form.reset();
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : fallbackErrorMsg);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex h-full flex-col space-y-1.5">
      {content?.formHeading ? (
        <h2 className="text-sm font-bold uppercase tracking-wider text-navy pb-1">
          {content.formHeading}
        </h2>
      ) : null}
      <div className="grid gap-1.5 sm:grid-cols-2">
        <label className="block text-[11px] font-semibold uppercase tracking-wider text-steel">
          {nameLabel}
          <input name="name" required className="field mt-0.5 !px-2.5 !py-1.5" />
        </label>
        <label className="block text-[11px] font-semibold uppercase tracking-wider text-steel">
          {emailFieldLabel}
          <input name="email" type="email" required className="field mt-0.5 !px-2.5 !py-1.5" />
        </label>
        <label className="block text-[11px] font-semibold uppercase tracking-wider text-steel">
          {phoneFieldLabel}
          <input name="phone" type="tel" className="field mt-0.5 !px-2.5 !py-1.5" />
        </label>
        <label className="block text-[11px] font-semibold uppercase tracking-wider text-steel">
          {companyFieldLabel}
          <input name="company" className="field mt-0.5 !px-2.5 !py-1.5" />
        </label>
      </div>
      <label className="block text-[11px] font-semibold uppercase tracking-wider text-steel">
        {inquiryTypeLabel}
        <select
          name="inquiryType"
          defaultValue={inquiryTypeOptions[0] || "Product quote"}
          className="field mt-0.5 !px-2.5 !py-1.5"
        >
          {inquiryTypeOptions.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </label>
      <label className="block text-[11px] font-semibold uppercase tracking-wider text-steel">
        {subjectLabel}
        <input
          name="subject"
          required
          defaultValue={defaultSubject}
          className="field mt-0.5 !px-2.5 !py-1.5"
        />
      </label>
      <label className="block text-[11px] font-semibold uppercase tracking-wider text-steel">
        {messageLabel}
        <textarea name="message" required rows={3} className="field mt-0.5 !px-2.5 !py-1.5" />
      </label>
      <button
        type="submit"
        disabled={status === "loading"}
        className="btn-orange mt-auto disabled:opacity-60"
      >
        {status === "loading" ? "Sending…" : submitButtonText}
      </button>
      {status === "success" && (
        <p className="text-sm text-signal">{successMsg}</p>
      )}
      {status === "error" && <p className="text-sm text-orange">{error}</p>}
    </form>
  );
}
