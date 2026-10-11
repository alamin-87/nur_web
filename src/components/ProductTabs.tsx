"use client";

import { useState } from "react";

export interface ProductTabsProps {
  description: string;
  features?: string[];
  specTable?: { label: string; value: string }[] | null;
  specsList?: string[];
  warranty?: string;
  warrantyAndReturns?: string;
  condition?: string;
  packing?: string;
  className?: string;
}

export function ProductTabs({
  description,
  features = [],
  specTable = null,
  specsList = [],
  warranty = "",
  warrantyAndReturns = "",
  condition = "",
  packing = "",
  className = "",
}: ProductTabsProps) {
  const [activeTab, setActiveTab] = useState<"desc" | "specs" | "warranty">("desc");

  const defaultWarrantyText =
    warrantyAndReturns ||
    `All genuine products supplied by Nur Engineering Solution come with standard manufacturer warranty support. 
In the event of verified factory defects or incorrect part delivery, replacement is provided within standard lead time. 
Physical damage, electrical overload, or incorrect installation is not covered under warranty.`;

  return (
    <div className={`w-full ${className}`}>
      {/* Tabs Header */}
      <div className="border-b border-[#e2e8f0] flex items-center gap-5 sm:gap-7 overflow-x-auto scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveTab("desc")}
            className={`pb-2 text-xs sm:text-[13px] font-display font-bold uppercase tracking-wider transition whitespace-nowrap -mb-px ${
            activeTab === "desc"
              ? "text-navy border-b-[3px] border-[#1ea952]"
              : "text-steel/80 hover:text-navy border-b-[3px] border-transparent"
          }`}
        >
          Description
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("specs")}
            className={`pb-2 text-xs sm:text-[13px] font-display font-bold uppercase tracking-wider transition whitespace-nowrap -mb-px ${
            activeTab === "specs"
              ? "text-navy border-b-[3px] border-[#1ea952]"
              : "text-steel/80 hover:text-navy border-b-[3px] border-transparent"
          }`}
        >
          Specifications
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("warranty")}
            className={`pb-2 text-xs sm:text-[13px] font-display font-bold uppercase tracking-wider transition whitespace-nowrap -mb-px ${
            activeTab === "warranty"
              ? "text-navy border-b-[3px] border-[#1ea952]"
              : "text-steel/80 hover:text-navy border-b-[3px] border-transparent"
          }`}
        >
          Warranty & Returns
        </button>
      </div>

      {/* Tabs Body */}
      <div className="pt-2">
        {/* Description Tab */}
        {activeTab === "desc" && (
          <div className="space-y-2 animate-in fade-in duration-200">
            <div className="max-w-4xl text-xs sm:text-sm leading-relaxed text-steel whitespace-pre-line font-normal">
              {description || "No product description available."}
            </div>

            {features && features.length > 0 && (
              <div className="mt-3 pt-3 border-t border-line">
                <h4 className="font-display text-xs sm:text-sm font-bold uppercase tracking-wider text-navy mb-2">
                  Key Features & Highlights
                </h4>
                <ul className="grid gap-2.5 sm:grid-cols-2 max-w-4xl">
                  {features.map((item, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2.5 text-xs sm:text-sm text-ink leading-relaxed"
                    >
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 bg-orange" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Specifications Tab */}
        {activeTab === "specs" && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {specTable && specTable.length > 0 ? (
              <div className="overflow-x-auto border border-line bg-white">
                <table className="w-full text-left border-collapse text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-line bg-paper/60 text-navy font-display font-bold uppercase tracking-wider text-[11px] sm:text-xs">
                      <th className="py-2.5 px-4 w-1/3">Parameter</th>
                      <th className="py-2.5 px-4 w-2/3">Specification Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {specTable.map((row, i) => (
                      <tr key={i} className={i % 2 === 1 ? "bg-paper/30" : "bg-white"}>
                        <td className="py-2.5 px-4 font-medium text-steel text-xs sm:text-[13px] align-top">
                          {row.label}
                        </td>
                        <td className="py-2.5 px-4 font-semibold text-navy text-xs sm:text-[13px] align-top">
                          {row.value}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : specsList && specsList.length > 0 ? (
              <div className="grid gap-2.5 sm:grid-cols-2 max-w-3xl">
                {specsList.map((spec, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 border border-line bg-paper/40 px-3.5 py-2.5 text-xs sm:text-[13px] text-navy font-medium"
                  >
                    <span className="h-1.5 w-1.5 shrink-0 bg-orange" />
                    <span>{spec}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs sm:text-sm text-mist">
                Technical specifications will be confirmed on the official quotation.
              </p>
            )}
          </div>
        )}

        {/* Warranty & Returns Tab */}
        {activeTab === "warranty" && (
          <div className="space-y-2.5 animate-in fade-in duration-200 max-w-4xl">
            <div className="grid gap-3 sm:grid-cols-3 border border-line bg-paper/40 p-2.5">
              <div>
                <span className="block text-[11px] uppercase tracking-wider text-mist font-bold">
                  Warranty Period
                </span>
                <span className="text-xs sm:text-sm font-semibold text-navy mt-0.5 block">
                  {warranty || "12-month manufacturer warranty"}
                </span>
              </div>
              <div>
                <span className="block text-[11px] uppercase tracking-wider text-mist font-bold">
                  Condition
                </span>
                <span className="text-xs sm:text-sm font-semibold text-navy mt-0.5 block">
                  {condition || "100% Genuine, Authorised Stock"}
                </span>
              </div>
              <div>
                <span className="block text-[11px] uppercase tracking-wider text-mist font-bold">
                  Packaging
                </span>
                <span className="text-xs sm:text-sm font-semibold text-navy mt-0.5 block">
                  {packing || "Carton / Factory sealed"}
                </span>
              </div>
            </div>

            <div className="text-xs sm:text-sm leading-relaxed sm:leading-7 text-steel space-y-3 whitespace-pre-line">
              <p>{defaultWarrantyText}</p>
            </div>

            <div className="border-t border-line pt-4 space-y-2 text-xs sm:text-[12.5px] text-mist leading-relaxed">
              <p className="font-semibold text-navy">Return & Replacement Policy Guidelines:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Check items immediately upon delivery with the dispatch note.</li>
                <li>Replacement requests must be submitted within 7 business days of delivery.</li>
                <li>Parts must remain in original packaging with serial number stickers intact.</li>
                <li>Custom-ordered or programmed automation components are subject to review.</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
