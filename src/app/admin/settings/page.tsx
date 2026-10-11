"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { MediaPickerModal } from "@/components/admin/MediaPickerModal";
import {
  PaletteIcon,
  PhoneIcon,
  MapPinIcon,
  GlobeIcon,
  SettingsIcon,
  ImageIcon,
  TrashIcon,
  PlusCircleIcon,
  FileTextIcon,
} from "@/components/admin/AdminIcons";
import { defaultFooterQuickLinks, defaultFooterServices } from "@/lib/footer-defaults";
import { NoticeTickerItems } from "@/components/NoticeTickerItems";
import { getValidMapEmbedUrl } from "@/lib/google-maps";

function AdminSettingsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tabParam = searchParams.get("tab") || "branding";
  const [tab, setTab] = useState(tabParam);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerField, setPickerField] = useState<
    "logo" | "footerLogo" | "favicon" | "wechatQr" | "whatsappQr" | "hero1" | "hero2" | "hero3"
  >("logo");

  // Settings state across all tabs
  const [brandName, setBrandName] = useState("Nur Engineering Solution");
  const [tagline, setTagline] = useState("Machine, spare parts and Technical service provider");
  const [description, setDescription] = useState("");
  const [logo, setLogo] = useState("");
  const [footerLogo, setFooterLogo] = useState("");
  const [favicon, setFavicon] = useState("");
  const [phone, setPhone] = useState("+8801805030940");
  const [phone2, setPhone2] = useState("01805030941");
  const [phone3, setPhone3] = useState("");
  const [wechatId, setWechatId] = useState("nurul01713798987");
  const [email, setEmail] = useState("ceo@nurengineering.bd.com");
  const [hours, setHours] = useState("Sat–Thu 9:00–18:00");
  const [workingDays, setWorkingDays] = useState("Saturday – Thursday");
  const [notice, setNotice] = useState("Out of stock products will be delivered within 3–5 days.");
  const [noticeBn, setNoticeBn] = useState(
    "★ কোন পার্টস স্টকে না থাকলে জরুরী প্রয়োজনে অর্ডার দেওয়ার ০৩ কার্যদিবসের মধ্যে চায়না থেকে আমদানি করে সরবরাহ করা হয় ★"
  );
  const [noticeBoardSpeed, setNoticeBoardSpeed] = useState(50);
  const [address, setAddress] = useState(
    "House#43-44, Road-1, Block -B, Mirpur-1 (Beside Shah Ali Thana), Dhaka-1216"
  );
  const [addressHouse, setAddressHouse] = useState("");
  const [addressRoad, setAddressRoad] = useState("");
  const [addressBlock, setAddressBlock] = useState("");
  const [mapsEmbed, setMapsEmbed] = useState("");
  const [mapShareUrl, setMapShareUrl] = useState("");
  const [mapZoom, setMapZoom] = useState(16);
  const [mapResolving, setMapResolving] = useState(false);
  const [mapResolveMessage, setMapResolveMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Contact Page Content state
  const [contactHeading, setContactHeading] = useState("Send a part number or photo");
  const [contactDescription, setContactDescription] = useState(
    "We reply with options, stock and pricing. Same desk for products and technical service."
  );
  const [contactPhoneLabel, setContactPhoneLabel] = useState("Phone");
  const [contactEmailLabel, setContactEmailLabel] = useState("Email");
  const [contactAddressLabel, setContactAddressLabel] = useState("Address");
  const [contactHoursLabel, setContactHoursLabel] = useState("Hours");
  const [contactFormHeading, setContactFormHeading] = useState("");
  const [contactNameLabel, setContactNameLabel] = useState("Name");
  const [contactEmailFieldLabel, setContactEmailFieldLabel] = useState("Email");
  const [contactPhoneFieldLabel, setContactPhoneFieldLabel] = useState("Phone");
  const [contactCompanyFieldLabel, setContactCompanyFieldLabel] = useState("Company / Workshop");
  const [contactInquiryTypeLabel, setContactInquiryTypeLabel] = useState("Inquiry type");
  const [contactInquiryTypeOptions, setContactInquiryTypeOptions] = useState<string[]>([
    "Product quote",
    "Parts sourcing",
    "Technical service",
    "Other",
  ]);
  const [newInquiryOption, setNewInquiryOption] = useState("");
  const [contactSubjectLabel, setContactSubjectLabel] = useState("Subject");
  const [contactMessageLabel, setContactMessageLabel] = useState("Message");
  const [contactSubmitButtonText, setContactSubmitButtonText] = useState("Send inquiry");
  const [contactSuccessMessage, setContactSuccessMessage] = useState(
    "Message received. We will reply shortly."
  );
  const [contactErrorMessage, setContactErrorMessage] = useState(
    "Failed to send message. Please try again."
  );

  const [facebook, setFacebook] = useState("https://www.facebook.com/");
  const [linkedin, setLinkedin] = useState("https://www.linkedin.com/");
  const [youtube, setYoutube] = useState("https://www.youtube.com/");
  const [whatsapp, setWhatsapp] = useState("+8801713798987");

  // Footer Links state
  const [footerQuickLinks, setFooterQuickLinks] = useState<{ label: string; href: string }[]>(
    defaultFooterQuickLinks
  );
  const [footerServices, setFooterServices] = useState<{ label: string; href: string }[]>(
    defaultFooterServices
  );

  // Footer QR Codes state
  const [wechatQr, setWechatQr] = useState("");
  const [wechatQrLabel, setWechatQrLabel] = useState("WECHAT QR SCAN");
  const [wechatQrEnabled, setWechatQrEnabled] = useState(true);
  const [whatsappQr, setWhatsappQr] = useState("");
  const [whatsappQrLabel, setWhatsappQrLabel] = useState("WHATSAPP QR SCAN");
  const [whatsappQrEnabled, setWhatsappQrEnabled] = useState(true);

  const [heroBanner1, setHeroBanner1] = useState("");
  const [heroBanner2, setHeroBanner2] = useState("");
  const [heroBanner3, setHeroBanner3] = useState("");
  const [heroSizeWarning, setHeroSizeWarning] = useState<{
    1?: string;
    2?: string;
    3?: string;
  }>({});

  // SEO & Analytics state
  const [seoTitle, setSeoTitle] = useState("Nur Engineering Solution | Machine Parts & Technical Service");
  const [seoDescription, setSeoDescription] = useState("");
  const [seoKeywords, setSeoKeywords] = useState("PLC Bangladesh, machine parts, VFD, motors, sensors, EEE spare parts");
  const [gaMeasurementId, setGaMeasurementId] = useState("");
  const [googleSiteVerification, setGoogleSiteVerification] = useState("");

  // Sync active tab with URL query parameter
  useEffect(() => {
    if (tabParam && tabParam !== tab) {
      setTab(tabParam);
    }
  }, [tabParam, tab]);

  function handleTabClick(newTab: string) {
    setTab(newTab);
    const params = new URLSearchParams(window.location.search);
    params.set("tab", newTab);
    router.replace(`/admin/settings?${params.toString()}`);
  }

  // Load existing saved settings from API
  useEffect(() => {
    fetch("/api/admin/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.settings) {
          const s = data.settings;
          if (s.brandName) setBrandName(s.brandName);
          if (s.tagline) setTagline(s.tagline);
          if (s.description) setDescription(s.description);
          if (s.logoUrl || s.logo) setLogo(s.logoUrl || s.logo);
          if (s.footerLogoUrl !== undefined) setFooterLogo(s.footerLogoUrl || "");
          if (s.favicon) setFavicon(s.favicon);
          if (s.phone) setPhone(s.phone);
          if (s.phone2 !== undefined) setPhone2(s.phone2 || "");
          if (s.phone3 !== undefined) setPhone3(s.phone3 || "");
          if (s.wechatId !== undefined) setWechatId(s.wechatId || "");
          if (s.email) setEmail(s.email);
          if (s.hours) setHours(s.hours);
          if (s.workingDays !== undefined) setWorkingDays(s.workingDays || "");
          if (s.notice) setNotice(s.notice);
          if (s.noticeBn !== undefined) setNoticeBn(s.noticeBn || "");
          if (typeof s.noticeBoardSpeed === "number" && !isNaN(s.noticeBoardSpeed) && s.noticeBoardSpeed > 0) {
            setNoticeBoardSpeed(s.noticeBoardSpeed);
          } else if (typeof s.noticeSpeed === "number" && !isNaN(s.noticeSpeed) && s.noticeSpeed > 0 && s.noticeSpeed <= 100) {
            setNoticeBoardSpeed(s.noticeSpeed);
          }
          if (s.address) setAddress(s.address);
          if (s.addressHouse !== undefined) setAddressHouse(s.addressHouse || "");
          if (s.addressRoad !== undefined) setAddressRoad(s.addressRoad || "");
          if (s.addressBlock !== undefined) setAddressBlock(s.addressBlock || "");
          if (s.mapEmbedUrl) setMapsEmbed(s.mapEmbedUrl);
          if (s.mapShareUrl !== undefined) setMapShareUrl(s.mapShareUrl || "");
          if (typeof s.mapZoom === "number" && !isNaN(s.mapZoom)) setMapZoom(s.mapZoom);

          if (s.contactPage) {
            const cp = s.contactPage;
            if (cp.heading !== undefined) setContactHeading(cp.heading);
            if (cp.description !== undefined) setContactDescription(cp.description);
            if (cp.phoneLabel !== undefined) setContactPhoneLabel(cp.phoneLabel);
            if (cp.emailLabel !== undefined) setContactEmailLabel(cp.emailLabel);
            if (cp.addressLabel !== undefined) setContactAddressLabel(cp.addressLabel);
            if (cp.hoursLabel !== undefined) setContactHoursLabel(cp.hoursLabel);
            if (cp.formHeading !== undefined) setContactFormHeading(cp.formHeading);
            if (cp.nameLabel !== undefined) setContactNameLabel(cp.nameLabel);
            if (cp.emailFieldLabel !== undefined) setContactEmailFieldLabel(cp.emailFieldLabel);
            if (cp.phoneFieldLabel !== undefined) setContactPhoneFieldLabel(cp.phoneFieldLabel);
            if (cp.companyFieldLabel !== undefined) setContactCompanyFieldLabel(cp.companyFieldLabel);
            if (cp.inquiryTypeLabel !== undefined) setContactInquiryTypeLabel(cp.inquiryTypeLabel);
            if (Array.isArray(cp.inquiryTypeOptions) && cp.inquiryTypeOptions.length > 0) {
              setContactInquiryTypeOptions(cp.inquiryTypeOptions);
            }
            if (cp.subjectLabel !== undefined) setContactSubjectLabel(cp.subjectLabel);
            if (cp.messageLabel !== undefined) setContactMessageLabel(cp.messageLabel);
            if (cp.submitButtonText !== undefined) setContactSubmitButtonText(cp.submitButtonText);
            if (cp.successMessage !== undefined) setContactSuccessMessage(cp.successMessage);
            if (cp.errorMessage !== undefined) setContactErrorMessage(cp.errorMessage);
          }

          if (s.social?.facebook) setFacebook(s.social.facebook);
          if (s.social?.linkedin) setLinkedin(s.social.linkedin);
          if (s.social?.youtube) setYoutube(s.social.youtube);
          if (s.social?.whatsapp) setWhatsapp(s.social.whatsapp);

          if (s.footerQr) {
            if (s.footerQr.wechatQr !== undefined) setWechatQr(s.footerQr.wechatQr);
            if (s.footerQr.wechatQrLabel) setWechatQrLabel(s.footerQr.wechatQrLabel);
            if (s.footerQr.wechatQrEnabled !== undefined) setWechatQrEnabled(s.footerQr.wechatQrEnabled);
            if (s.footerQr.whatsappQr !== undefined) setWhatsappQr(s.footerQr.whatsappQr);
            if (s.footerQr.whatsappQrLabel) setWhatsappQrLabel(s.footerQr.whatsappQrLabel);
            if (s.footerQr.whatsappQrEnabled !== undefined) setWhatsappQrEnabled(s.footerQr.whatsappQrEnabled);
          }

          if (Array.isArray(s.footerQuickLinks) && s.footerQuickLinks.length > 0) {
            setFooterQuickLinks(s.footerQuickLinks);
          }
          if (Array.isArray(s.footerServices) && s.footerServices.length > 0) {
            setFooterServices(s.footerServices);
          }

          if (s.seo?.defaultTitle) setSeoTitle(s.seo.defaultTitle);
          if (s.seo?.defaultDescription) setSeoDescription(s.seo.defaultDescription);
          if (Array.isArray(s.seo?.keywords)) {
            setSeoKeywords(s.seo.keywords.join(", "));
          } else if (typeof s.seo?.keywords === "string") {
            setSeoKeywords(s.seo.keywords);
          }

          if (s.analytics?.gaMeasurementId) setGaMeasurementId(s.analytics.gaMeasurementId);
          if (s.analytics?.googleSiteVerification) setGoogleSiteVerification(s.analytics.googleSiteVerification);

          if (s.heroBanners) {
            if (s.heroBanners.banner1 !== undefined) setHeroBanner1(s.heroBanners.banner1 || "");
            if (s.heroBanners.banner2 !== undefined) setHeroBanner2(s.heroBanners.banner2 || "");
            if (s.heroBanners.banner3 !== undefined) setHeroBanner3(s.heroBanners.banner3 || "");
          }
        }
      })
      .catch((err) => console.error("Error fetching settings:", err))
      .finally(() => setLoading(false));
  }, []);

  function checkHeroBannerSize(url: string, slot: 1 | 2 | 3) {
    if (!url) {
      setHeroSizeWarning((prev) => ({ ...prev, [slot]: undefined }));
      return;
    }
    const img = new window.Image();
    img.onload = () => {
      const matches = img.naturalWidth === 1920 && img.naturalHeight === 500;
      setHeroSizeWarning((prev) => ({
        ...prev,
        [slot]: matches
          ? undefined
          : `Uploaded ${img.naturalWidth} × ${img.naturalHeight} px. Recommended size: 1920 × 500 px`,
      }));
    };
    img.onerror = () => {
      setHeroSizeWarning((prev) => ({ ...prev, [slot]: undefined }));
    };
    img.src = url;
  }

  function handleSelectMedia(url: string) {
    if (pickerField === "logo") setLogo(url);
    if (pickerField === "footerLogo") setFooterLogo(url);
    if (pickerField === "favicon") setFavicon(url);
    if (pickerField === "wechatQr") setWechatQr(url);
    if (pickerField === "whatsappQr") setWhatsappQr(url);
    if (pickerField === "hero1") {
      setHeroBanner1(url);
      checkHeroBannerSize(url, 1);
    }
    if (pickerField === "hero2") {
      setHeroBanner2(url);
      checkHeroBannerSize(url, 2);
    }
    if (pickerField === "hero3") {
      setHeroBanner3(url);
      checkHeroBannerSize(url, 3);
    }
  }

  async function handleResolveMapLink(linkToResolve?: string, zoomOverride?: number) {
    const inputLink = (linkToResolve !== undefined ? linkToResolve : mapsEmbed).trim();
    if (!inputLink) {
      setMapResolveMessage({
        type: "error",
        text: "Please enter a Google Maps link or embed code first.",
      });
      return;
    }

    setMapResolving(true);
    setMapResolveMessage(null);

    try {
      const res = await fetch("/api/admin/maps/resolve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: inputLink,
          zoom: zoomOverride ?? mapZoom,
          address: [
            addressHouse ? `House ${addressHouse}` : "",
            addressRoad ? `Road ${addressRoad}` : "",
            addressBlock ? `Block ${addressBlock}` : "",
            address,
          ]
            .filter(Boolean)
            .join(", "),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success && data.result) {
        if (data.result.embedUrl) {
          setMapsEmbed(data.result.embedUrl);
          if (!mapShareUrl && !inputLink.includes("output=embed")) {
            setMapShareUrl(inputLink);
          }
          if (data.result.zoom && !zoomOverride) {
            setMapZoom(data.result.zoom);
          }
          setMapResolveMessage({
            type: "success",
            text: `✓ Location accurately resolved${
              data.result.placeName ? `: "${data.result.placeName}"` : ""
            }! Live map updated below.`,
          });
        }
      } else {
        setMapResolveMessage({
          type: "error",
          text: data.error || "Unable to resolve the provided Google Maps URL.",
        });
      }
    } catch {
      setMapResolveMessage({
        type: "error",
        text: "Failed to resolve Google Maps link. Please verify your connection.",
      });
    } finally {
      setMapResolving(false);
    }
  }

  async function handleSave(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);
    setErrorMessage("");

    try {
      const keywordsArray = seoKeywords
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean);

      const payload = {
        settings: {
          brandName,
          tagline,
          description,
          logoUrl: logo,
          logo,
          footerLogoUrl: footerLogo,
          favicon,
          phone,
          phone2,
          phone3,
          wechatId,
          email,
          hours,
          workingDays,
          notice,
          noticeBn,
          noticeBoardSpeed: Number(noticeBoardSpeed) || 50,
          noticeSpeed: Math.max(5, Math.round((84 * 50) / (Number(noticeBoardSpeed) || 50))),
          address,
          addressHouse,
          addressRoad,
          addressBlock,
          mapEmbedUrl: mapsEmbed,
          mapShareUrl,
          mapZoom: Number(mapZoom) || 16,
          contactPage: {
            heading: contactHeading,
            description: contactDescription,
            phoneLabel: contactPhoneLabel,
            emailLabel: contactEmailLabel,
            addressLabel: contactAddressLabel,
            hoursLabel: contactHoursLabel,
            formHeading: contactFormHeading,
            nameLabel: contactNameLabel,
            emailFieldLabel: contactEmailFieldLabel,
            phoneFieldLabel: contactPhoneFieldLabel,
            companyFieldLabel: contactCompanyFieldLabel,
            inquiryTypeLabel: contactInquiryTypeLabel,
            inquiryTypeOptions: contactInquiryTypeOptions.filter(Boolean),
            subjectLabel: contactSubjectLabel,
            messageLabel: contactMessageLabel,
            submitButtonText: contactSubmitButtonText,
            successMessage: contactSuccessMessage,
            errorMessage: contactErrorMessage,
          },
          footerQuickLinks,
          footerServices,
          social: {
            facebook,
            linkedin,
            youtube,
            whatsapp,
          },
          footerQr: {
            wechatQr,
            wechatQrLabel,
            wechatQrEnabled,
            whatsappQr,
            whatsappQrLabel,
            whatsappQrEnabled,
          },
          heroBanners: {
            banner1: heroBanner1,
            banner2: heroBanner2,
            banner3: heroBanner3,
          },
          seo: {
            defaultTitle: seoTitle,
            defaultDescription: seoDescription || description,
            keywords: keywordsArray,
          },
          analytics: {
            gaMeasurementId,
            googleSiteVerification,
          },
        },
      };

      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      let data: Record<string, unknown> | null = null;
      try {
        data = await res.json();
      } catch {
        const text = await res.text().catch(() => "");
        data = { error: text || `Server responded with status ${res.status}` };
      }

      if (res.ok && data?.success) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 4000);
      } else {
        setErrorMessage(
          (data?.error as string) || "Failed to save settings. Please try again."
        );
      }
    } catch (err: unknown) {
      console.error("Settings save error:", err);
      const msg = err instanceof Error ? err.message : "Network error while saving settings.";
      setErrorMessage(msg);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-xs font-bold uppercase tracking-wider text-mist">Loading website settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3.5 sm:gap-4">
        <div>
          <h2 className="font-display text-lg sm:text-xl font-bold uppercase tracking-wide text-navy">
            Website Settings &amp; Live CMS
          </h2>
          <p className="text-xs text-steel">
            Changes saved here automatically update the live public website.
          </p>
        </div>

        <button
          type="button"
          onClick={() => handleSave()}
          disabled={saving}
          className="btn-orange px-5 sm:px-6 py-2 text-xs font-bold uppercase shadow-sm disabled:opacity-50 w-full sm:w-auto text-center"
        >
          {saving ? "Saving Settings..." : "Save & Update Live Site"}
        </button>
      </div>

      {savedSuccess && (
        <div className="rounded border border-emerald-500/30 bg-emerald-50 p-3 text-xs font-bold text-emerald-700">
          ✓ Website settings successfully updated and published to the live frontend!
        </div>
      )}

      {errorMessage && (
        <div className="rounded border border-red-500/30 bg-red-50 p-3 text-xs font-bold text-red-700">
          ✕ {errorMessage}
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap gap-1.5 sm:gap-2 border-b border-line pb-2">
        {[
          { id: "branding", label: "Logo & Branding", Icon: PaletteIcon },
          { id: "header", label: "Header & Contacts", Icon: PhoneIcon },
          { id: "location", label: "Location & Maps", Icon: MapPinIcon },
          { id: "contact", label: "Contact Page", Icon: FileTextIcon },
          { id: "social", label: "Social Links", Icon: GlobeIcon },
          { id: "footer", label: "Footer & QR Codes", Icon: ImageIcon },
          { id: "hero", label: "Hero Banners", Icon: ImageIcon },
          { id: "general", label: "General & SEO", Icon: SettingsIcon },
        ].map((t) => {
          const ActiveIcon = t.Icon;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => handleTabClick(t.id)}
              className={`flex items-center gap-2 rounded px-3 sm:px-4 py-2 text-xs font-bold transition flex-1 sm:flex-none justify-center ${
                tab === t.id
                  ? "bg-navy text-white shadow-xs"
                  : "bg-white text-navy hover:bg-paper border border-line"
              }`}
            >
              <ActiveIcon size={16} className={tab === t.id ? "text-orange" : "text-steel"} />
              <span className="truncate">{t.label}</span>
            </button>
          );
        })}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Tab 1: Logo & Branding */}
        {tab === "branding" && (
          <div className="rounded-lg border border-line bg-white p-4 sm:p-6 shadow-xs space-y-5">
            <h3 className="font-display text-sm font-bold uppercase tracking-wider text-navy border-b border-line pb-3">
              Logo & Visual Branding
            </h3>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold uppercase text-navy">Company Brand Name</label>
                <input
                  type="text"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  className="mt-1 w-full rounded border border-line px-3 py-2 text-xs outline-none focus:border-orange font-bold text-navy"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-navy">Tagline / Sub-heading</label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  className="mt-1 w-full rounded border border-line px-3 py-2 text-xs outline-none focus:border-orange"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-navy">Header Logo (Optional)</label>
              <div className="flex flex-wrap sm:flex-nowrap gap-2 mt-1">
                <input
                  type="text"
                  value={logo}
                  onChange={(e) => setLogo(e.target.value)}
                  placeholder="Paste URL or select from Media Library..."
                  className="flex-1 min-w-0 rounded border border-line px-3 py-2 text-xs outline-none focus:border-orange font-mono text-[11px]"
                />
                <button
                  type="button"
                  onClick={() => {
                    setPickerField("logo");
                    setPickerOpen(true);
                  }}
                  className="btn-navy px-3 py-2 text-xs font-bold shrink-0 flex items-center gap-1.5"
                >
                  <ImageIcon size={16} />
                  <span>Media Library</span>
                </button>
              </div>
              <p className="mt-1.5 text-[10.5px] text-mist">
                If blank, the default classic circular NES emblem displays cleanly.
              </p>

              {/* Live Preview */}
              {logo && (
                <div className="mt-3 flex items-center gap-3 p-3 rounded border border-line bg-paper/30">
                  <div className="relative h-14 w-14 shrink-0 rounded-full border-2 border-orange/40 bg-white p-1 shadow-sm overflow-hidden flex items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={logo} alt="Logo Preview" className="max-h-full max-w-full object-contain" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-navy">Active Logo Preview</p>
                    <p className="text-[10.5px] text-steel">This logo is live on your header.</p>
                    <button
                      type="button"
                      onClick={() => setLogo("")}
                      className="mt-1 text-[10.5px] font-bold text-red-600 hover:underline"
                    >
                      Reset to Default Badge
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-navy">Footer Logo (Optional)</label>
              <div className="flex flex-wrap sm:flex-nowrap gap-2 mt-1">
                <input
                  type="text"
                  value={footerLogo}
                  onChange={(e) => setFooterLogo(e.target.value)}
                  placeholder="Paste URL or select from Media Library..."
                  className="flex-1 min-w-0 rounded border border-line px-3 py-2 text-xs outline-none focus:border-orange font-mono text-[11px]"
                />
                <button
                  type="button"
                  onClick={() => {
                    setPickerField("footerLogo");
                    setPickerOpen(true);
                  }}
                  className="btn-navy px-3 py-2 text-xs font-bold shrink-0 flex items-center gap-1.5"
                >
                  <ImageIcon size={16} />
                  <span>Media Library</span>
                </button>
              </div>
              <p className="mt-1.5 text-[10.5px] text-mist">
                Managed separately from the header logo. If blank, the header logo is used in the footer.
              </p>
              {footerLogo && (
                <div className="mt-3 flex items-center gap-3 p-3 rounded border border-line bg-paper/30">
                  <div className="relative h-14 w-14 shrink-0 rounded-full border-2 border-orange/40 bg-white p-1 shadow-sm overflow-hidden flex items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={footerLogo} alt="Footer Logo Preview" className="max-h-full max-w-full object-contain" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-navy">Footer Logo Preview</p>
                    <p className="text-[10.5px] text-steel">This logo is live in the footer only.</p>
                    <button
                      type="button"
                      onClick={() => setFooterLogo("")}
                      className="mt-1 text-[10.5px] font-bold text-red-600 hover:underline"
                    >
                      Clear Footer Logo
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-line pt-4">
              <label className="block text-xs font-bold uppercase text-navy">Favicon Icon (Optional)</label>
              <div className="flex flex-wrap sm:flex-nowrap gap-2 mt-1">
                <input
                  type="text"
                  value={favicon}
                  onChange={(e) => setFavicon(e.target.value)}
                  placeholder="Paste favicon URL or select from Media Library..."
                  className="flex-1 min-w-0 rounded border border-line px-3 py-2 text-xs outline-none focus:border-orange font-mono text-[11px]"
                />
                <button
                  type="button"
                  onClick={() => {
                    setPickerField("favicon");
                    setPickerOpen(true);
                  }}
                  className="btn-navy px-3 py-2 text-xs font-bold shrink-0 flex items-center gap-1.5"
                >
                  <ImageIcon size={16} />
                  <span>Media Library</span>
                </button>
              </div>
              {favicon && (
                <div className="mt-3 flex items-center gap-3 p-2.5 rounded border border-line bg-paper/30">
                  <div className="relative h-8 w-8 shrink-0 rounded border border-line bg-white p-1 shadow-xs overflow-hidden flex items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={favicon} alt="Favicon Preview" className="max-h-full max-w-full object-contain" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-navy">Favicon Preview</p>
                    <button
                      type="button"
                      onClick={() => setFavicon("")}
                      className="text-[10.5px] font-bold text-red-600 hover:underline"
                    >
                      Remove Favicon
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {tab === "hero" && (
          <div className="rounded-lg border border-line bg-white p-4 sm:p-6 shadow-xs space-y-5">
            <h3 className="font-display text-sm font-bold uppercase tracking-wider text-navy border-b border-line pb-3">
              Hero Banners
            </h3>
            <p className="text-[10.5px] text-mist">
              Recommended size: 1920 × 500 px. Images are used as the existing homepage Hero Slider backgrounds. Leave a slot empty to keep the current default banner.
            </p>
            {(
              [
                { n: 1 as const, value: heroBanner1, set: setHeroBanner1, field: "hero1" as const },
                { n: 2 as const, value: heroBanner2, set: setHeroBanner2, field: "hero2" as const },
                { n: 3 as const, value: heroBanner3, set: setHeroBanner3, field: "hero3" as const },
              ]
            ).map((slot) => (
              <div key={slot.n} className="rounded border border-line bg-paper/30 p-4 space-y-3">
                <label className="block text-xs font-bold uppercase text-navy">
                  Banner {slot.n}
                </label>
                {slot.value ? (
                  <div className="relative h-28 w-full overflow-hidden rounded border border-line bg-navy">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={slot.value}
                      alt={`Banner ${slot.n} preview`}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex h-28 items-center justify-center rounded border border-dashed border-line bg-white text-[11px] text-steel">
                    No custom image — live site uses the default Banner {slot.n}
                  </div>
                )}
                <div className="flex flex-wrap sm:flex-nowrap gap-2">
                  <input
                    type="text"
                    value={slot.value}
                    onChange={(e) => {
                      slot.set(e.target.value);
                      checkHeroBannerSize(e.target.value, slot.n);
                    }}
                    placeholder="Paste URL or select from Media Library..."
                    className="flex-1 min-w-0 rounded border border-line px-3 py-2 text-xs outline-none focus:border-orange font-mono text-[11px]"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setPickerField(slot.field);
                      setPickerOpen(true);
                    }}
                    className="btn-navy px-3 py-2 text-xs font-bold shrink-0 flex items-center gap-1.5"
                  >
                    <ImageIcon size={16} />
                    <span>{slot.value ? "Change Image" : "Upload / Change Image"}</span>
                  </button>
                </div>
                <p className="text-[10.5px] text-mist">Recommended size: 1920 × 500 px</p>
                {heroSizeWarning[slot.n] && (
                  <p className="text-[10.5px] font-bold text-amber-700">{heroSizeWarning[slot.n]}</p>
                )}
                {slot.value && (
                  <button
                    type="button"
                    onClick={() => {
                      slot.set("");
                      checkHeroBannerSize("", slot.n);
                    }}
                    className="text-[10.5px] font-bold text-red-600 hover:underline"
                  >
                    Clear and use default Banner {slot.n}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Tab 2: Header & Contacts */}
        {tab === "header" && (
          <div className="rounded-lg border border-line bg-white p-6 shadow-xs space-y-5">
            <h3 className="font-display text-sm font-bold uppercase tracking-wider text-navy border-b border-line pb-3">
              Top Bar & Header Contacts
            </h3>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="block text-xs font-bold uppercase text-navy">Phone Number</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="mt-1 w-full rounded border border-line px-3 py-2 text-xs outline-none focus:border-orange font-medium"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-navy">Phone 2</label>
                <input
                  type="text"
                  value={phone2}
                  onChange={(e) => setPhone2(e.target.value)}
                  className="mt-1 w-full rounded border border-line px-3 py-2 text-xs outline-none focus:border-orange font-medium"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-navy">Phone 3</label>
                <input
                  type="text"
                  value={phone3}
                  onChange={(e) => setPhone3(e.target.value)}
                  className="mt-1 w-full rounded border border-line px-3 py-2 text-xs outline-none focus:border-orange font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-navy">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 w-full rounded border border-line px-3 py-2 text-xs outline-none focus:border-orange font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-navy">Business / Office Hours</label>
                <input
                  type="text"
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                  placeholder="Sat–Thu 9:00–18:00"
                  className="mt-1 w-full rounded border border-line px-3 py-2 text-xs outline-none focus:border-orange font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-navy">Working Days</label>
                <input
                  type="text"
                  value={workingDays}
                  onChange={(e) => setWorkingDays(e.target.value)}
                  placeholder="Saturday – Thursday"
                  className="mt-1 w-full rounded border border-line px-3 py-2 text-xs outline-none focus:border-orange font-medium"
                />
              </div>
            </div>

            {/* Top Bar Notice / Announcement Ticker */}
            <div className="border-t border-line pt-4 space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold uppercase text-navy">
                  Top Bar Notice / Announcement Ticker
                </label>
                <span className="text-[10.5px] font-bold text-orange uppercase tracking-wider">
                  Live Ticker Banner
                </span>
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase text-navy mb-1">
                  Bangla Notice
                </label>
                <textarea
                  value={noticeBn}
                  onChange={(e) => setNoticeBn(e.target.value)}
                  rows={3}
                  lang="bn"
                  placeholder="★ কোন পার্টস স্টকে না থাকলে জরুরী প্রয়োজনে অর্ডার দেওয়ার ০৩ কার্যদিবসের মধ্যে চায়না থেকে আমদানি করে সরবরাহ করা হয় ★"
                  className="w-full rounded border border-line px-3 py-2 text-xs outline-none focus:border-orange font-medium leading-relaxed"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase text-navy mb-1">
                  English Notice
                </label>
                <input
                  type="text"
                  value={notice}
                  onChange={(e) => setNotice(e.target.value)}
                  placeholder="e.g. Out of stock products will be delivered within 3–5 days."
                  className="w-full rounded border border-line px-3 py-2 text-xs outline-none focus:border-orange font-medium"
                />
              </div>
              {/* Notice Board Speed Control */}
              <div className="rounded border border-line bg-paper/40 p-3.5 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-navy">
                      Notice Board Speed
                    </label>
                    <p className="text-[10.5px] text-mist">
                      Adjust how fast or slow the continuous notice marquee scrolls across the screen.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center px-2.5 py-1 rounded bg-navy text-white text-xs font-bold font-mono tracking-wide shadow-2xs">
                      Current: {noticeBoardSpeed}
                    </span>
                    <span className="text-[11px] font-bold text-orange uppercase tracking-wide">
                      {noticeBoardSpeed <= 25
                        ? "Slow"
                        : noticeBoardSpeed < 45
                        ? "Medium Slow"
                        : noticeBoardSpeed <= 55
                        ? noticeBoardSpeed === 50
                          ? "Default Speed"
                          : "Normal"
                        : noticeBoardSpeed <= 80
                        ? "Fast"
                        : "Very Fast"}
                    </span>
                  </div>
                </div>

                {/* Slider */}
                <div className="space-y-1.5">
                  <input
                    type="range"
                    min={10}
                    max={100}
                    step={1}
                    value={noticeBoardSpeed}
                    onChange={(e) => setNoticeBoardSpeed(Number(e.target.value))}
                    className="w-full h-2 bg-line rounded-lg appearance-none cursor-pointer accent-orange focus:outline-none"
                  />
                  <div className="flex justify-between text-[10px] font-semibold text-mist uppercase tracking-wider">
                    <span className="text-navy">🐢 Slower (10)</span>
                    <button
                      type="button"
                      onClick={() => setNoticeBoardSpeed(50)}
                      className={`hover:text-orange transition ${
                        noticeBoardSpeed === 50 ? "font-bold text-orange" : "text-steel"
                      }`}
                    >
                      Reset Default (50)
                    </button>
                    <span className="text-navy">⚡ Faster (100)</span>
                  </div>
                </div>

                {/* Preset Buttons */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10px] font-bold uppercase text-mist mr-1">Presets:</span>
                  {[
                    { label: "Slow", val: 25 },
                    { label: "Medium", val: 40 },
                    { label: "Normal (Default)", val: 50 },
                    { label: "Fast", val: 75 },
                    { label: "Very Fast", val: 100 },
                  ].map((preset) => (
                    <button
                      key={preset.val}
                      type="button"
                      onClick={() => setNoticeBoardSpeed(preset.val)}
                      className={`px-2.5 py-1 rounded text-[11px] font-bold transition border ${
                        noticeBoardSpeed === preset.val
                          ? "bg-orange text-white border-orange shadow-2xs"
                          : "bg-white text-navy border-line hover:border-orange hover:bg-paper"
                      }`}
                    >
                      {preset.label} ({preset.val})
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded border border-line bg-paper/60 p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-mist uppercase">
                    Live Notice Preview (Hover to pause):
                  </span>
                  <span className="text-[10px] font-bold text-orange uppercase tracking-wider">
                    Speed: {noticeBoardSpeed} ({Math.max(5, Math.round((84 * 50) / noticeBoardSpeed))}s loop)
                  </span>
                </div>
                <div
                  className="notice-ticker-container overflow-hidden relative bg-[#1F456E] text-white py-1 px-2 rounded-[2px]"
                  title="Hover to pause preview"
                >
                  <div
                    className="notice-ticker-track"
                    style={{
                      animationDuration: `${Math.max(5, Math.round((84 * 50) / noticeBoardSpeed))}s`,
                    }}
                  >
                    <div className="notice-ticker-group">
                      {[0, 1].map((i) => (
                        <NoticeTickerItems
                          key={`admin-prev1-${i}`}
                          noticeBn={noticeBn}
                          noticeEn={notice}
                        />
                      ))}
                    </div>
                    <div className="notice-ticker-group" aria-hidden="true">
                      {[0, 1].map((i) => (
                        <NoticeTickerItems
                          key={`admin-prev2-${i}`}
                          noticeBn={noticeBn}
                          noticeEn={notice}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-[10.5px] text-mist">
                Both notices appear in the header and footer ticker: Bangla first, then English. Hovering pauses the movement for easy reading.
              </p>
            </div>
          </div>
        )}

        {/* Tab 3: Location & Maps */}
        {tab === "location" && (
          <div className="rounded-lg border border-line bg-white p-6 shadow-xs space-y-6">
            <div className="border-b border-line pb-3">
              <h3 className="font-display text-sm font-bold uppercase tracking-wider text-navy">
                Office Location &amp; Google Maps Configuration
              </h3>
              <p className="text-xs text-steel mt-0.5">
                Set up your official physical address and Google Maps location. Supports Shareable short links (maps.app.goo.gl), Place URLs, coordinate links, and direct iframe embed codes.
              </p>
            </div>

            {/* Address Details */}
            <div className="p-4 rounded border border-line bg-paper/30 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-navy">
                1. Physical Office Address
              </h4>

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-navy">House Number</label>
                  <input
                    type="text"
                    value={addressHouse}
                    onChange={(e) => setAddressHouse(e.target.value)}
                    placeholder="e.g. 43-44"
                    className="mt-1 w-full rounded border border-line px-3 py-2 text-xs outline-none focus:border-orange font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-navy">Road Number</label>
                  <input
                    type="text"
                    value={addressRoad}
                    onChange={(e) => setAddressRoad(e.target.value)}
                    placeholder="e.g. 1"
                    className="mt-1 w-full rounded border border-line px-3 py-2 text-xs outline-none focus:border-orange font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-navy">Block Number</label>
                  <input
                    type="text"
                    value={addressBlock}
                    onChange={(e) => setAddressBlock(e.target.value)}
                    placeholder="e.g. B"
                    className="mt-1 w-full rounded border border-line px-3 py-2 text-xs outline-none focus:border-orange font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-navy">
                  Complete Office Address (Area, City, Postal Code)
                </label>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="House#43-44, Road-1, Block -B, Mirpur-1 (Beside Shah Ali Thana), Dhaka-1216"
                  rows={2}
                  className="mt-1 w-full rounded border border-line px-3 py-2 text-xs outline-none focus:border-orange font-medium leading-relaxed"
                />
                <p className="mt-1 text-[10.5px] text-mist">
                  This address is synchronized across the Contact Page, Footer, and fallback Google Map pin.
                </p>
              </div>
            </div>

            {/* Google Maps Link & Resolution */}
            <div className="p-4 rounded border border-line bg-paper/30 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-navy">
                  2. Google Maps Shareable Link / Embed URL
                </h4>
                <span className="text-[10.5px] font-bold text-orange uppercase tracking-wider">
                  Universal Google Maps Resolver
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-navy">
                  Paste Google Maps Link / Share URL / Embed Code
                </label>
                <div className="mt-1 flex flex-wrap sm:flex-nowrap gap-2">
                  <input
                    type="text"
                    value={mapsEmbed}
                    onChange={(e) => {
                      setMapsEmbed(e.target.value);
                      setMapResolveMessage(null);
                    }}
                    onPaste={(e) => {
                      const pasted = e.clipboardData.getData("text");
                      if (pasted) {
                        setTimeout(() => handleResolveMapLink(pasted), 100);
                      }
                    }}
                    placeholder="e.g. https://maps.app.goo.gl/... or https://www.google.com/maps/place/... or <iframe src='...'></iframe>"
                    className="flex-1 min-w-0 rounded border border-line px-3 py-2 text-xs outline-none focus:border-orange font-mono text-[11px]"
                  />
                  <button
                    type="button"
                    onClick={() => handleResolveMapLink()}
                    disabled={mapResolving}
                    className="btn-navy px-4 py-2 text-xs font-bold shrink-0 flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {mapResolving ? (
                      <>
                        <svg className="animate-spin h-3.5 w-3.5 text-orange" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                        </svg>
                        <span>Resolving...</span>
                      </>
                    ) : (
                      <>
                        <MapPinIcon size={15} />
                        <span>Resolve &amp; Test Link</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="mt-1.5 text-[10.5px] text-mist">
                  Paste any share link from your phone or Google Maps app (e.g. <span className="font-mono text-navy">https://maps.app.goo.gl/...</span>), desktop browser URL, or iframe code. It will be automatically converted to the exact embed format.
                </p>

                {mapResolveMessage && (
                  <div
                    className={`mt-2 p-2.5 rounded text-xs font-bold ${
                      mapResolveMessage.type === "success"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-500/30"
                        : "bg-red-50 text-red-700 border border-red-500/30"
                    }`}
                  >
                    {mapResolveMessage.text}
                  </div>
                )}
              </div>

              {/* Map Zoom Control */}
              <div className="border-t border-line/60 pt-3 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label className="block text-xs font-bold uppercase text-navy">
                    Map Zoom Level: <span className="font-mono text-orange">{mapZoom}</span>
                  </label>
                  <span className="text-[10.5px] text-steel">
                    {mapZoom <= 12
                      ? "City Overview"
                      : mapZoom <= 14
                      ? "Area / Sub-district"
                      : mapZoom <= 16
                      ? "Street Level (Recommended)"
                      : "Building / Detailed Close-up"}
                  </span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={20}
                  step={1}
                  value={mapZoom}
                  onChange={(e) => {
                    const newZoom = Number(e.target.value);
                    setMapZoom(newZoom);
                    if (mapsEmbed && mapsEmbed.includes("output=embed") && mapsEmbed.includes("z=")) {
                      setMapsEmbed(mapsEmbed.replace(/z=\d+/, `z=${newZoom}`));
                    }
                  }}
                  className="w-full h-2 bg-line rounded-lg appearance-none cursor-pointer accent-orange focus:outline-none"
                />
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10px] font-bold uppercase text-mist mr-1">Presets:</span>
                  {[
                    { label: "City (12)", val: 12 },
                    { label: "Area (14)", val: 14 },
                    { label: "Street (16 - Default)", val: 16 },
                    { label: "Close-up (18)", val: 18 },
                  ].map((preset) => (
                    <button
                      key={preset.val}
                      type="button"
                      onClick={() => {
                        setMapZoom(preset.val);
                        if (mapsEmbed && mapsEmbed.includes("output=embed") && mapsEmbed.includes("z=")) {
                          setMapsEmbed(mapsEmbed.replace(/z=\d+/, `z=${preset.val}`));
                        }
                      }}
                      className={`px-2.5 py-1 rounded text-[11px] font-bold transition border ${
                        mapZoom === preset.val
                          ? "bg-orange text-white border-orange shadow-2xs"
                          : "bg-white text-navy border-line hover:border-orange hover:bg-paper"
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Live Interactive Map Preview */}
            <div className="p-4 rounded border border-line bg-paper/30 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-navy flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-orange animate-pulse"></span>
                  Live Contact Page Map Preview
                </h4>
                <span className="text-[10.5px] font-bold text-steel uppercase">
                  Exact Frontend Mirror
                </span>
              </div>
              <div className="relative w-full h-64 md:h-72 overflow-hidden rounded border border-line bg-white shadow-inner">
                <iframe
                  title="Admin Location Map Preview"
                  src={getValidMapEmbedUrl(mapsEmbed, mapZoom, address)}
                  className="h-full w-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
              </div>
              <p className="text-[10.5px] text-mist">
                This live preview reflects the exact Google Map iframe rendered on the public <span className="font-semibold text-navy">/contact</span> page. Click &ldquo;Save &amp; Update Live Site&rdquo; above to publish changes.
              </p>
            </div>
          </div>
        )}

        {/* Tab: Contact Page Content Customization */}
        {tab === "contact" && (
          <div className="rounded-lg border border-line bg-white p-4 sm:p-6 shadow-xs space-y-6">
            <div className="border-b border-line pb-3">
              <h3 className="font-display text-sm font-bold uppercase tracking-wider text-navy">
                Contact Page Content &amp; Form Customization
              </h3>
              <p className="text-xs text-steel mt-0.5">
                Customize every heading, section label, form field label, inquiry option, submit button text, and notification message on the public Contact page.
              </p>
            </div>

            {/* Section 1: Page Header & Description */}
            <div className="p-4 rounded border border-line bg-paper/30 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-navy">
                1. Page Header &amp; Subtitle (Left Blue Banner)
              </h4>

              <div>
                <label className="block text-xs font-bold uppercase text-navy">Contact Page Heading</label>
                <input
                  type="text"
                  value={contactHeading}
                  onChange={(e) => setContactHeading(e.target.value)}
                  placeholder="Send a part number or photo"
                  className="mt-1 w-full rounded border border-line px-3 py-2 text-xs outline-none focus:border-orange font-bold text-navy"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-navy">Contact Page Description</label>
                <textarea
                  value={contactDescription}
                  onChange={(e) => setContactDescription(e.target.value)}
                  placeholder="We reply with options, stock and pricing. Same desk for products and technical service."
                  rows={2}
                  className="mt-1 w-full rounded border border-line px-3 py-2 text-xs outline-none focus:border-orange font-medium leading-relaxed"
                />
              </div>
            </div>

            {/* Section 2: Contact Information Section Labels */}
            <div className="p-4 rounded border border-line bg-paper/30 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-navy">
                2. Contact Info Labels (Left Card)
              </h4>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-navy">Phone Section Label</label>
                  <input
                    type="text"
                    value={contactPhoneLabel}
                    onChange={(e) => setContactPhoneLabel(e.target.value)}
                    placeholder="Phone"
                    className="mt-1 w-full rounded border border-line px-3 py-2 text-xs outline-none focus:border-orange font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-navy">Email Section Label</label>
                  <input
                    type="text"
                    value={contactEmailLabel}
                    onChange={(e) => setContactEmailLabel(e.target.value)}
                    placeholder="Email"
                    className="mt-1 w-full rounded border border-line px-3 py-2 text-xs outline-none focus:border-orange font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-navy">Address Section Label</label>
                  <input
                    type="text"
                    value={contactAddressLabel}
                    onChange={(e) => setContactAddressLabel(e.target.value)}
                    placeholder="Address"
                    className="mt-1 w-full rounded border border-line px-3 py-2 text-xs outline-none focus:border-orange font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-navy">Hours Section Label</label>
                  <input
                    type="text"
                    value={contactHoursLabel}
                    onChange={(e) => setContactHoursLabel(e.target.value)}
                    placeholder="Hours"
                    className="mt-1 w-full rounded border border-line px-3 py-2 text-xs outline-none focus:border-orange font-semibold"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Inquiry Form Customization */}
            <div className="p-4 rounded border border-line bg-paper/30 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-navy">
                3. Inquiry Form Fields &amp; Labels (Right Card)
              </h4>

              <div>
                <label className="block text-xs font-bold uppercase text-navy">
                  Form Heading (Optional — leave empty to show no extra header)
                </label>
                <input
                  type="text"
                  value={contactFormHeading}
                  onChange={(e) => setContactFormHeading(e.target.value)}
                  placeholder="e.g. Send Us An Inquiry"
                  className="mt-1 w-full rounded border border-line px-3 py-2 text-xs outline-none focus:border-orange font-medium"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold uppercase text-navy">Name Field Label</label>
                  <input
                    type="text"
                    value={contactNameLabel}
                    onChange={(e) => setContactNameLabel(e.target.value)}
                    placeholder="Name"
                    className="mt-1 w-full rounded border border-line px-3 py-2 text-xs outline-none focus:border-orange font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-navy">Email Field Label</label>
                  <input
                    type="text"
                    value={contactEmailFieldLabel}
                    onChange={(e) => setContactEmailFieldLabel(e.target.value)}
                    placeholder="Email"
                    className="mt-1 w-full rounded border border-line px-3 py-2 text-xs outline-none focus:border-orange font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-navy">Phone Field Label</label>
                  <input
                    type="text"
                    value={contactPhoneFieldLabel}
                    onChange={(e) => setContactPhoneFieldLabel(e.target.value)}
                    placeholder="Phone"
                    className="mt-1 w-full rounded border border-line px-3 py-2 text-xs outline-none focus:border-orange font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-navy">Company / Workshop Field Label</label>
                  <input
                    type="text"
                    value={contactCompanyFieldLabel}
                    onChange={(e) => setContactCompanyFieldLabel(e.target.value)}
                    placeholder="Company / Workshop"
                    className="mt-1 w-full rounded border border-line px-3 py-2 text-xs outline-none focus:border-orange font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-navy">Inquiry Type Field Label</label>
                  <input
                    type="text"
                    value={contactInquiryTypeLabel}
                    onChange={(e) => setContactInquiryTypeLabel(e.target.value)}
                    placeholder="Inquiry type"
                    className="mt-1 w-full rounded border border-line px-3 py-2 text-xs outline-none focus:border-orange font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-navy">Subject Field Label</label>
                  <input
                    type="text"
                    value={contactSubjectLabel}
                    onChange={(e) => setContactSubjectLabel(e.target.value)}
                    placeholder="Subject"
                    className="mt-1 w-full rounded border border-line px-3 py-2 text-xs outline-none focus:border-orange font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-navy">Message Field Label</label>
                <input
                  type="text"
                  value={contactMessageLabel}
                  onChange={(e) => setContactMessageLabel(e.target.value)}
                  placeholder="Message"
                  className="mt-1 w-full rounded border border-line px-3 py-2 text-xs outline-none focus:border-orange font-medium"
                />
              </div>

              {/* Inquiry Type Dropdown Options Editor */}
              <div className="border-t border-line/60 pt-3 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <label className="block text-xs font-bold uppercase text-navy">
                      Inquiry Type Dropdown Options
                    </label>
                    <p className="text-[10.5px] text-mist">
                      Options available for visitors when submitting the Contact Page form.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setContactInquiryTypeOptions([
                        "Product quote",
                        "Parts sourcing",
                        "Technical service",
                        "Other",
                      ])
                    }
                    className="text-[10.5px] font-bold text-steel hover:text-navy hover:underline"
                  >
                    Reset Default Options
                  </button>
                </div>

                <div className="space-y-2">
                  {contactInquiryTypeOptions.map((opt, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-1.5 rounded bg-white border border-line">
                      <span className="text-[10.5px] font-bold text-mist w-5 text-center shrink-0">
                        {idx + 1}
                      </span>
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => {
                          const updated = [...contactInquiryTypeOptions];
                          updated[idx] = e.target.value;
                          setContactInquiryTypeOptions(updated);
                        }}
                        className="flex-1 rounded border border-line px-2.5 py-1 text-xs outline-none focus:border-orange font-medium"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setContactInquiryTypeOptions((prev) => prev.filter((_, i) => i !== idx))
                        }
                        className="p-1 text-steel hover:text-red-600 rounded hover:bg-paper shrink-0 transition"
                        title="Remove option"
                      >
                        <TrashIcon size={15} />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newInquiryOption}
                    onChange={(e) => setNewInquiryOption(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        if (newInquiryOption.trim()) {
                          setContactInquiryTypeOptions((prev) => [...prev, newInquiryOption.trim()]);
                          setNewInquiryOption("");
                        }
                      }
                    }}
                    placeholder="Add new inquiry option..."
                    className="flex-1 rounded border border-line px-3 py-1.5 text-xs outline-none focus:border-orange"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newInquiryOption.trim()) {
                        setContactInquiryTypeOptions((prev) => [...prev, newInquiryOption.trim()]);
                        setNewInquiryOption("");
                      }
                    }}
                    className="btn-navy px-3 py-1.5 text-xs font-bold shrink-0 flex items-center gap-1"
                  >
                    <PlusCircleIcon size={14} />
                    <span>Add Option</span>
                  </button>
                </div>
              </div>

              {/* Submit Button & Feedback Messages */}
              <div className="border-t border-line/60 pt-3 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-navy">
                  4. Submit Button &amp; Feedback Messages
                </h4>

                <div>
                  <label className="block text-xs font-bold uppercase text-navy">Submit Button Text</label>
                  <input
                    type="text"
                    value={contactSubmitButtonText}
                    onChange={(e) => setContactSubmitButtonText(e.target.value)}
                    placeholder="Send inquiry"
                    className="mt-1 w-full rounded border border-line px-3 py-2 text-xs outline-none focus:border-orange font-bold text-orange"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-bold uppercase text-navy">Success Message</label>
                    <input
                      type="text"
                      value={contactSuccessMessage}
                      onChange={(e) => setContactSuccessMessage(e.target.value)}
                      placeholder="Message received. We will reply shortly."
                      className="mt-1 w-full rounded border border-line px-3 py-2 text-xs outline-none focus:border-orange font-medium text-emerald-700"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-navy">Error Message</label>
                    <input
                      type="text"
                      value={contactErrorMessage}
                      onChange={(e) => setContactErrorMessage(e.target.value)}
                      placeholder="Failed to send message. Please try again."
                      className="mt-1 w-full rounded border border-line px-3 py-2 text-xs outline-none focus:border-orange font-medium text-red-600"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Social Links */}
        {tab === "social" && (
          <div className="rounded-lg border border-line bg-white p-6 shadow-xs space-y-5">
            <h3 className="font-display text-sm font-bold uppercase tracking-wider text-navy border-b border-line pb-3">
              Social Media & WhatsApp
            </h3>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold uppercase text-navy">Facebook Page URL</label>
                <input
                  type="url"
                  value={facebook}
                  onChange={(e) => setFacebook(e.target.value)}
                  className="mt-1 w-full rounded border border-line px-3 py-2 text-xs outline-none focus:border-orange"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-navy">LinkedIn URL</label>
                <input
                  type="url"
                  value={linkedin}
                  onChange={(e) => setLinkedin(e.target.value)}
                  className="mt-1 w-full rounded border border-line px-3 py-2 text-xs outline-none focus:border-orange"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-navy">YouTube Channel URL</label>
                <input
                  type="url"
                  value={youtube}
                  onChange={(e) => setYoutube(e.target.value)}
                  className="mt-1 w-full rounded border border-line px-3 py-2 text-xs outline-none focus:border-orange"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-navy">WeChat ID</label>
                <input
                  type="text"
                  value={wechatId}
                  onChange={(e) => setWechatId(e.target.value)}
                  className="mt-1 w-full rounded border border-line px-3 py-2 text-xs outline-none focus:border-orange"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-navy">WhatsApp Phone / Direct Link</label>
                <input
                  type="text"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="+880170000000"
                  className="mt-1 w-full rounded border border-line px-3 py-2 text-xs outline-none focus:border-orange font-mono"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: Footer & QR Codes */}
        {tab === "footer" && (
          <div className="rounded-lg border border-line bg-white p-4 sm:p-6 shadow-xs space-y-6">
            <div>
              <h3 className="font-display text-sm font-bold uppercase tracking-wider text-navy border-b border-line pb-3">
                Footer Settings & QR Scan Codes
              </h3>
              <p className="mt-1 text-xs text-steel">
                Manage contact information, Quick Links, Our Services list, and WeChat / WhatsApp QR codes displayed in the website Footer.
              </p>
            </div>

            {/* 1. Contact Information */}
            <div className="p-4 rounded border border-line bg-paper/30 space-y-4">
              <div className="flex items-center justify-between border-b border-line pb-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-navy">
                  Footer Contact Information (Column 4 &amp; Info)
                </h4>
                <span className="text-[10.5px] font-bold text-steel">Live Footer Contacts</span>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-navy">Company Brand Name</label>
                  <input
                    type="text"
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                    placeholder="Nur Engineering Solution"
                    className="mt-1 w-full rounded border border-line px-3 py-2 text-xs outline-none focus:border-orange font-bold text-navy"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-navy">Email Address (Clickable mailto:)</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ceo@nurengineering.bd.com"
                    className="mt-1 w-full rounded border border-line px-3 py-2 text-xs outline-none focus:border-orange font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-navy">Primary Phone (Clickable tel:)</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+880 1713-798987"
                    className="mt-1 w-full rounded border border-line px-3 py-2 text-xs outline-none focus:border-orange font-mono font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-navy">Phone 2 (Additional Number)</label>
                  <input
                    type="text"
                    value={phone2}
                    onChange={(e) => setPhone2(e.target.value)}
                    placeholder="01805030941"
                    className="mt-1 w-full rounded border border-line px-3 py-2 text-xs outline-none focus:border-orange font-mono font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-navy">Phone 3 (Additional Number)</label>
                  <input
                    type="text"
                    value={phone3}
                    onChange={(e) => setPhone3(e.target.value)}
                    placeholder="01805030947"
                    className="mt-1 w-full rounded border border-line px-3 py-2 text-xs outline-none focus:border-orange font-mono font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-navy">WhatsApp / Contact Number</label>
                  <input
                    type="text"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="+880 1713-798987"
                    className="mt-1 w-full rounded border border-line px-3 py-2 text-xs outline-none focus:border-orange font-mono font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-navy">WeChat ID / Information</label>
                  <input
                    type="text"
                    value={wechatId}
                    onChange={(e) => setWechatId(e.target.value)}
                    placeholder="nurul01713798987"
                    className="mt-1 w-full rounded border border-line px-3 py-2 text-xs outline-none focus:border-orange font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-navy">Office / Business Hours</label>
                  <input
                    type="text"
                    value={hours}
                    onChange={(e) => setHours(e.target.value)}
                    placeholder="Sat–Thu 9:00–18:00"
                    className="mt-1 w-full rounded border border-line px-3 py-2 text-xs outline-none focus:border-orange font-medium"
                  />
                </div>
              </div>

              {/* Address details */}
              <div className="border-t border-line/60 pt-3 space-y-3">
                <label className="block text-[11px] font-bold uppercase text-navy">Company Address Details</label>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div>
                    <label className="block text-[10.5px] font-bold text-steel">House Number</label>
                    <input
                      type="text"
                      value={addressHouse}
                      onChange={(e) => setAddressHouse(e.target.value)}
                      placeholder="e.g. 43-44"
                      className="mt-1 w-full rounded border border-line px-3 py-1.5 text-xs outline-none focus:border-orange"
                    />
                  </div>
                  <div>
                    <label className="block text-[10.5px] font-bold text-steel">Road Number</label>
                    <input
                      type="text"
                      value={addressRoad}
                      onChange={(e) => setAddressRoad(e.target.value)}
                      placeholder="e.g. Road-1"
                      className="mt-1 w-full rounded border border-line px-3 py-1.5 text-xs outline-none focus:border-orange"
                    />
                  </div>
                  <div>
                    <label className="block text-[10.5px] font-bold text-steel">Block Number</label>
                    <input
                      type="text"
                      value={addressBlock}
                      onChange={(e) => setAddressBlock(e.target.value)}
                      placeholder="e.g. Block -B"
                      className="mt-1 w-full rounded border border-line px-3 py-1.5 text-xs outline-none focus:border-orange"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10.5px] font-bold text-steel">Full / Area Address Text</label>
                  <textarea
                    rows={2}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="House#43-44, Road-1, Block -B, Mirpur-1 (Beside Shah Ali Thana), Dhaka-1216"
                    className="mt-1 w-full rounded border border-line px-3 py-2 text-xs outline-none focus:border-orange font-medium leading-relaxed"
                  />
                </div>
              </div>
            </div>

            {/* 2. Quick Links Section */}
            <div className="p-4 rounded border border-line bg-paper/30 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line pb-2">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-navy">
                    Footer Quick Links (Column 2)
                  </h4>
                  <p className="text-[10.5px] text-steel">
                    Items displayed under the &ldquo;QUICK LINK&rdquo; column in the website footer.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setFooterQuickLinks(defaultFooterQuickLinks)}
                    className="text-[10.5px] font-bold text-steel hover:text-navy hover:underline"
                  >
                    Reset Defaults
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setFooterQuickLinks((prev) => [...prev, { label: "New Link", href: "/" }])
                    }
                    className="btn-navy px-2.5 py-1 text-xs font-bold flex items-center gap-1"
                  >
                    <PlusCircleIcon size={14} />
                    <span>Add Quick Link</span>
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                {footerQuickLinks.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex flex-wrap sm:flex-nowrap items-center gap-2 p-2 rounded bg-white border border-line"
                  >
                    <span className="text-[10px] font-bold text-mist w-5 text-center shrink-0">
                      {idx + 1}
                    </span>
                    <div className="flex-1 min-w-[140px]">
                      <input
                        type="text"
                        value={item.label}
                        onChange={(e) => {
                          const next = [...footerQuickLinks];
                          next[idx] = { ...next[idx], label: e.target.value };
                          setFooterQuickLinks(next);
                        }}
                        placeholder="Link Name (e.g. Home)"
                        className="w-full rounded border border-line px-2.5 py-1.5 text-xs outline-none focus:border-orange font-medium"
                      />
                    </div>
                    <div className="flex-1 min-w-[160px]">
                      <input
                        type="text"
                        value={item.href}
                        onChange={(e) => {
                          const next = [...footerQuickLinks];
                          next[idx] = { ...next[idx], href: e.target.value };
                          setFooterQuickLinks(next);
                        }}
                        placeholder="Destination URL / Route (e.g. /products)"
                        className="w-full rounded border border-line px-2.5 py-1.5 text-xs outline-none focus:border-orange font-mono text-[11px]"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setFooterQuickLinks((prev) => prev.filter((_, i) => i !== idx))
                      }
                      title="Delete link"
                      className="p-1.5 text-steel hover:text-red-600 rounded hover:bg-paper shrink-0 transition"
                    >
                      <TrashIcon size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. Our Services Section */}
            <div className="p-4 rounded border border-line bg-paper/30 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line pb-2">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-navy">
                    Footer Our Services List (Column 3)
                  </h4>
                  <p className="text-[10.5px] text-steel">
                    Items displayed under the &ldquo;OUR SERVICES&rdquo; column in the website footer.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setFooterServices(defaultFooterServices)}
                    className="text-[10.5px] font-bold text-steel hover:text-navy hover:underline"
                  >
                    Reset Defaults
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setFooterServices((prev) => [
                        ...prev,
                        { label: "New Service", href: "/services" },
                      ])
                    }
                    className="btn-navy px-2.5 py-1 text-xs font-bold flex items-center gap-1"
                  >
                    <PlusCircleIcon size={14} />
                    <span>Add Service Link</span>
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                {footerServices.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex flex-wrap sm:flex-nowrap items-center gap-2 p-2 rounded bg-white border border-line"
                  >
                    <span className="text-[10px] font-bold text-mist w-5 text-center shrink-0">
                      {idx + 1}
                    </span>
                    <div className="flex-1 min-w-[160px]">
                      <input
                        type="text"
                        value={item.label}
                        onChange={(e) => {
                          const next = [...footerServices];
                          next[idx] = { ...next[idx], label: e.target.value };
                          setFooterServices(next);
                        }}
                        placeholder="Service Name (e.g. Keep the machine running)"
                        className="w-full rounded border border-line px-2.5 py-1.5 text-xs outline-none focus:border-orange font-medium"
                      />
                    </div>
                    <div className="flex-1 min-w-[160px]">
                      <input
                        type="text"
                        value={item.href}
                        onChange={(e) => {
                          const next = [...footerServices];
                          next[idx] = { ...next[idx], href: e.target.value };
                          setFooterServices(next);
                        }}
                        placeholder="Destination URL / Route (e.g. /services#...)"
                        className="w-full rounded border border-line px-2.5 py-1.5 text-xs outline-none focus:border-orange font-mono text-[11px]"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setFooterServices((prev) => prev.filter((_, i) => i !== idx))
                      }
                      title="Delete service link"
                      className="p-1.5 text-steel hover:text-red-600 rounded hover:bg-paper shrink-0 transition"
                    >
                      <TrashIcon size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* 4. WeChat QR Code */}
            <div className="p-4 rounded border border-line bg-paper/30 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-navy flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#07C160]"></span>
                  WeChat QR Code
                </h4>
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-navy">
                  <input
                    type="checkbox"
                    checked={wechatQrEnabled}
                    onChange={(e) => setWechatQrEnabled(e.target.checked)}
                    className="rounded border-line text-orange focus:ring-orange"
                  />
                  <span>Show WeChat QR in Footer</span>
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-navy">WeChat QR Display Label</label>
                  <input
                    type="text"
                    value={wechatQrLabel}
                    onChange={(e) => setWechatQrLabel(e.target.value)}
                    placeholder="WECHAT QR SCAN"
                    className="mt-1 w-full rounded border border-line px-3 py-2 text-xs outline-none focus:border-orange font-bold uppercase"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-navy">WeChat QR Image URL (Optional)</label>
                  <div className="flex gap-2 mt-1">
                    <input
                      type="text"
                      value={wechatQr}
                      onChange={(e) => setWechatQr(e.target.value)}
                      placeholder="Paste image URL or choose from Media Library..."
                      className="flex-1 min-w-0 rounded border border-line px-3 py-2 text-xs outline-none focus:border-orange font-mono text-[11px]"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setPickerField("wechatQr");
                        setPickerOpen(true);
                      }}
                      className="btn-navy px-3 py-2 text-xs font-bold shrink-0 flex items-center gap-1.5"
                    >
                      <ImageIcon size={16} />
                      <span>Media</span>
                    </button>
                  </div>
                  <p className="mt-1 text-[10.5px] text-mist">If empty, a crisp vector WeChat QR code displays cleanly.</p>
                </div>
              </div>

              {wechatQr && (
                <div className="flex items-center gap-3 p-2.5 rounded bg-white border border-line">
                  <div className="h-14 w-14 rounded border border-line bg-paper flex items-center justify-center p-1 overflow-hidden shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={wechatQr} alt="WeChat QR Preview" className="h-full w-full object-contain" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-navy">Active WeChat QR Image</p>
                    <button
                      type="button"
                      onClick={() => setWechatQr("")}
                      className="mt-1 text-[10.5px] font-bold text-red-600 hover:underline"
                    >
                      Reset to Vector QR
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* 5. WhatsApp QR Code */}
            <div className="p-4 rounded border border-line bg-paper/30 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-navy flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#25D366]"></span>
                  WhatsApp QR Code
                </h4>
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-navy">
                  <input
                    type="checkbox"
                    checked={whatsappQrEnabled}
                    onChange={(e) => setWhatsappQrEnabled(e.target.checked)}
                    className="rounded border-line text-orange focus:ring-orange"
                  />
                  <span>Show WhatsApp QR in Footer</span>
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-navy">WhatsApp QR Display Label</label>
                  <input
                    type="text"
                    value={whatsappQrLabel}
                    onChange={(e) => setWhatsappQrLabel(e.target.value)}
                    placeholder="WHATSAPP QR SCAN"
                    className="mt-1 w-full rounded border border-line px-3 py-2 text-xs outline-none focus:border-orange font-bold uppercase"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase text-navy">WhatsApp QR Image URL (Optional)</label>
                  <div className="flex gap-2 mt-1">
                    <input
                      type="text"
                      value={whatsappQr}
                      onChange={(e) => setWhatsappQr(e.target.value)}
                      placeholder="Paste image URL or choose from Media Library..."
                      className="flex-1 min-w-0 rounded border border-line px-3 py-2 text-xs outline-none focus:border-orange font-mono text-[11px]"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setPickerField("whatsappQr");
                        setPickerOpen(true);
                      }}
                      className="btn-navy px-3 py-2 text-xs font-bold shrink-0 flex items-center gap-1.5"
                    >
                      <ImageIcon size={16} />
                      <span>Media</span>
                    </button>
                  </div>
                  <p className="mt-1 text-[10.5px] text-mist">If empty, a crisp vector WhatsApp QR code displays cleanly.</p>
                </div>
              </div>

              {whatsappQr && (
                <div className="flex items-center gap-3 p-2.5 rounded bg-white border border-line">
                  <div className="h-14 w-14 rounded border border-line bg-paper flex items-center justify-center p-1 overflow-hidden shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={whatsappQr} alt="WhatsApp QR Preview" className="h-full w-full object-contain" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-navy">Active WhatsApp QR Image</p>
                    <button
                      type="button"
                      onClick={() => setWhatsappQr("")}
                      className="mt-1 text-[10.5px] font-bold text-red-600 hover:underline"
                    >
                      Reset to Vector QR
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 6: General & SEO */}
        {tab === "general" && (
          <div className="rounded-lg border border-line bg-white p-6 shadow-xs space-y-5">
            <h3 className="font-display text-sm font-bold uppercase tracking-wider text-navy border-b border-line pb-3">
              General Information & Website Meta
            </h3>

            <div>
              <label className="block text-xs font-bold uppercase text-navy">Company Bio & Overview</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Comprehensive overview of company services and offerings..."
                className="mt-1 w-full rounded border border-line px-3 py-2 text-xs outline-none leading-relaxed"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold uppercase text-navy">Default Meta Title</label>
                <input
                  type="text"
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                  className="mt-1 w-full rounded border border-line px-3 py-2 text-xs outline-none focus:border-orange font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-navy">Meta Keywords (Comma separated)</label>
                <input
                  type="text"
                  value={seoKeywords}
                  onChange={(e) => setSeoKeywords(e.target.value)}
                  placeholder="PLC, Motors, VFD, Sensors"
                  className="mt-1 w-full rounded border border-line px-3 py-2 text-xs outline-none focus:border-orange font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-navy">Default Meta Description</label>
              <textarea
                rows={2}
                value={seoDescription}
                onChange={(e) => setSeoDescription(e.target.value)}
                placeholder="Meta description for search engines..."
                className="mt-1 w-full rounded border border-line px-3 py-2 text-xs outline-none leading-relaxed"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2 border-t border-line pt-4">
              <div>
                <label className="block text-xs font-bold uppercase text-navy">Google Analytics 4 Measurement ID</label>
                <input
                  type="text"
                  value={gaMeasurementId}
                  onChange={(e) => setGaMeasurementId(e.target.value)}
                  placeholder="G-XXXXXXXXXX"
                  className="mt-1 w-full rounded border border-line px-3 py-2 text-xs outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-navy">Google Search Console Verification</label>
                <input
                  type="text"
                  value={googleSiteVerification}
                  onChange={(e) => setGoogleSiteVerification(e.target.value)}
                  placeholder="google-site-verification token"
                  className="mt-1 w-full rounded border border-line px-3 py-2 text-xs outline-none font-mono"
                />
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={saving}
            className="btn-orange px-8 py-3 text-xs font-bold uppercase shadow-md disabled:opacity-50"
          >
            {saving ? "Saving All Settings..." : "Save & Update Live Site"}
          </button>
        </div>
      </form>

      <MediaPickerModal
        isOpen={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={handleSelectMedia}
      />
    </div>
  );
}

export default function AdminSettingsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#ff6b00] border-t-transparent" />
        </div>
      }
    >
      <AdminSettingsContent />
    </Suspense>
  );
}

