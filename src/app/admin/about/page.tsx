"use client";

import { useEffect, useState } from "react";
import { MediaPickerModal } from "@/components/admin/MediaPickerModal";
import { ImageIcon } from "@/components/admin/AdminIcons";
import { Img } from "@/components/Img";

interface HighlightItem {
  label: string;
  value: string;
}

export default function AdminAboutPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [pickerOpen, setPickerOpen] = useState(false);

  // Form states
  const [aboutLabel, setAboutLabel] = useState("About");
  const [name, setName] = useState("Nur Engineering Solution");
  const [tagline, setTagline] = useState("Machine, spare parts and Technical service provider");
  const [about, setAbout] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [mission, setMission] = useState("");
  const [vision, setVision] = useState("");
  const [highlights, setHighlights] = useState<HighlightItem[]>([
    { label: "Founded", value: "2024" },
    { label: "Focus", value: "EEE machine parts & service" },
    { label: "Based in", value: "Dhaka, Bangladesh" },
    { label: "Catalog", value: "PLC to bearings" },
  ]);

  useEffect(() => {
    fetch("/api/admin/about")
      .then((res) => res.json())
      .then((data) => {
        if (data.profile) {
          const p = data.profile;
          if (p.aboutLabel !== undefined) setAboutLabel(p.aboutLabel);
          if (p.name) setName(p.name);
          if (p.tagline) setTagline(p.tagline);
          if (p.about) setAbout(p.about);
          if (p.coverImage) setCoverImage(p.coverImage);
          if (p.mission !== undefined) setMission(p.mission);
          if (p.vision !== undefined) setVision(p.vision);
          if (Array.isArray(p.highlights) && p.highlights.length > 0) {
            setHighlights(p.highlights);
          }
        }
      })
      .catch((err) => {
        console.error("Failed to load about data:", err);
        setErrorMessage("Failed to load About data from server.");
      })
      .finally(() => setLoading(false));
  }, []);

  function handleHighlightChange(index: number, field: "label" | "value", val: string) {
    setHighlights((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: val };
      return next;
    });
  }

  function handleAddHighlight() {
    if (highlights.length >= 8) return;
    setHighlights((prev) => [...prev, { label: "", value: "" }]);
  }

  function handleRemoveHighlight(index: number) {
    if (highlights.length <= 1) return;
    setHighlights((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSave(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setSaving(true);
    setErrorMessage("");
    setSavedSuccess(false);

    if (!name.trim()) {
      setErrorMessage("Please provide a Title / Company Name.");
      setSaving(false);
      return;
    }
    if (!tagline.trim()) {
      setErrorMessage("Please provide a Subtitle / Tagline.");
      setSaving(false);
      return;
    }
    if (!about.trim()) {
      setErrorMessage("Please provide Main About Description content.");
      setSaving(false);
      return;
    }

    try {
      const res = await fetch("/api/admin/about", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          aboutLabel: aboutLabel.trim() || "About",
          name: name.trim(),
          tagline: tagline.trim(),
          about: about.trim(),
          coverImage: coverImage.trim(),
          mission: mission.trim(),
          vision: vision.trim(),
          highlights: highlights.filter((h) => h.label.trim() || h.value.trim()),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save changes.");
      }

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 4000);
    } catch (err: unknown) {
      console.error("Save error:", err);
      setErrorMessage(err instanceof Error ? err.message : "Failed to update About content");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <p className="text-xs text-mist">Loading About Section details...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-bold uppercase tracking-wide text-navy">
            About Section Management
          </h2>
          <p className="text-xs text-steel">
            Edit and manage public About page content, banner header, tagline, mission, vision, and key metrics.
          </p>
        </div>

        <button
          type="button"
          onClick={() => handleSave()}
          disabled={saving}
          className="btn-orange px-5 py-2 text-xs font-bold uppercase shadow-sm disabled:opacity-50 flex items-center gap-1.5"
        >
          {saving ? (
            <>
              <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              <span>Saving...</span>
            </>
          ) : (
            <span>Save Changes</span>
          )}
        </button>
      </div>

      {/* Success / Error Feedback */}
      {savedSuccess && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-xs font-semibold text-emerald-800 flex items-center gap-2 shadow-xs animate-in fade-in duration-200">
          <span className="text-base">✓</span>
          <span>About section content updated successfully! Live website reflects the latest changes.</span>
        </div>
      )}

      {errorMessage && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-xs font-semibold text-red-700 flex items-center gap-2 shadow-xs">
          <span className="text-base">✕</span>
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Card 1: Banner & Title */}
        <div className="rounded-lg border border-line bg-white p-5 sm:p-6 shadow-xs space-y-4">
          <h3 className="font-display text-sm font-bold uppercase tracking-wide text-navy border-b border-line pb-2.5">
            Banner & Header
          </h3>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold uppercase text-navy">
                Small Heading / Label *
              </label>
              <input
                type="text"
                required
                value={aboutLabel}
                onChange={(e) => setAboutLabel(e.target.value)}
                placeholder="e.g. ABOUT"
                className="mt-1 w-full rounded border border-line px-3 py-2 text-xs outline-none focus:border-orange font-medium"
              />
              <p className="mt-1 text-[11px] text-mist">
                Displayed as small orange badge/label above the main heading.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-navy">
                Main Heading / Title *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. NUR ENGINEERING SOLUTION"
                className="mt-1 w-full rounded border border-line px-3 py-2 text-xs outline-none focus:border-orange font-medium"
              />
              <p className="mt-1 text-[11px] text-mist">
                Displayed as the large prominent title on the about banner.
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-navy">
              Banner Cover Image
            </label>
            <div className="mt-1.5 flex flex-wrap sm:flex-nowrap gap-3 items-center">
              <input
                type="url"
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                placeholder="https://... or choose from media library"
                className="flex-1 min-w-0 rounded border border-line px-3 py-2 text-xs outline-none focus:border-orange font-mono"
              />
              <button
                type="button"
                onClick={() => setPickerOpen(true)}
                className="btn-navy px-3.5 py-2 text-xs font-bold shrink-0 flex items-center gap-1.5"
              >
                <ImageIcon size={14} />
                <span>Choose / Upload</span>
              </button>
            </div>

            {coverImage && (
              <div className="mt-3 relative h-32 w-full max-w-md overflow-hidden rounded border border-line bg-paper/50">
                <Img
                  src={coverImage}
                  alt="Banner preview"
                  fill
                  className="object-cover"
                />
              </div>
            )}
          </div>
        </div>

        {/* Card 2: Main Description & Tagline */}
        <div className="rounded-lg border border-line bg-white p-5 sm:p-6 shadow-xs space-y-4">
          <h3 className="font-display text-sm font-bold uppercase tracking-wide text-navy border-b border-line pb-2.5">
            Main Content
          </h3>

          <div>
            <label className="block text-xs font-bold uppercase text-navy">
              Subtitle / Tagline *
            </label>
            <input
              type="text"
              required
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="e.g. Machine, Spare Parts And Technical Service Provider"
              className="mt-1 w-full rounded border border-line px-3 py-2 text-xs outline-none focus:border-orange font-medium"
            />
            <p className="mt-1 text-[11px] text-mist">
              Displayed in orange font directly above the main description.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-navy">
              Main Description / Content *
            </label>
            <textarea
              required
              rows={6}
              value={about}
              onChange={(e) => setAbout(e.target.value)}
              placeholder="Enter comprehensive description about Nur Engineering Solution..."
              className="mt-1 w-full rounded border border-line px-3 py-2 text-xs outline-none focus:border-orange leading-relaxed"
            />
            <p className="mt-1 text-[11px] text-mist">
              The primary overview text displayed in the body of the About page.
            </p>
          </div>
        </div>

        {/* Card 3: Mission & Vision */}
        <div className="rounded-lg border border-line bg-white p-5 sm:p-6 shadow-xs space-y-4">
          <h3 className="font-display text-sm font-bold uppercase tracking-wide text-navy border-b border-line pb-2.5">
            Mission & Vision
          </h3>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold uppercase text-navy">
                Mission Statement
              </label>
              <textarea
                rows={4}
                value={mission}
                onChange={(e) => setMission(e.target.value)}
                placeholder="Supply accurate industrial parts with honest specs, clear prices, and EEE-backed selection help."
                className="mt-1 w-full rounded border border-line px-3 py-2 text-xs outline-none focus:border-orange leading-relaxed"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-navy">
                Vision Statement
              </label>
              <textarea
                rows={4}
                value={vision}
                onChange={(e) => setVision(e.target.value)}
                placeholder="Be the parts partner workshops and small factories in Bangladesh actually call first."
                className="mt-1 w-full rounded border border-line px-3 py-2 text-xs outline-none focus:border-orange leading-relaxed"
              />
            </div>
          </div>
        </div>

        {/* Card 4: Key Highlights */}
        <div className="rounded-lg border border-line bg-white p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-line pb-2.5">
            <h3 className="font-display text-sm font-bold uppercase tracking-wide text-navy">
              Key Highlights & Stats
            </h3>
            {highlights.length < 8 && (
              <button
                type="button"
                onClick={handleAddHighlight}
                className="text-[11px] font-bold text-orange hover:underline"
              >
                + Add Metric
              </button>
            )}
          </div>

          <p className="text-[11px] text-steel">
            These cards appear at the bottom of the About section (e.g., Founded Year, Focus Area, Location, Catalog range).
          </p>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {highlights.map((item, idx) => (
              <div
                key={idx}
                className="rounded border border-line bg-paper/40 p-3 space-y-2 relative group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-mist">
                    Card #{idx + 1}
                  </span>
                  {highlights.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveHighlight(idx)}
                      className="text-mist hover:text-red-600 text-xs font-bold"
                      title="Remove highlight card"
                    >
                      ✕
                    </button>
                  )}
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-steel">Label</label>
                  <input
                    type="text"
                    value={item.label}
                    onChange={(e) => handleHighlightChange(idx, "label", e.target.value)}
                    placeholder="e.g. Founded"
                    className="mt-0.5 w-full rounded border border-line bg-white px-2.5 py-1.5 text-xs outline-none focus:border-orange"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-steel">Value</label>
                  <input
                    type="text"
                    value={item.value}
                    onChange={(e) => handleHighlightChange(idx, "value", e.target.value)}
                    placeholder="e.g. 2024"
                    className="mt-0.5 w-full rounded border border-line bg-white px-2.5 py-1.5 text-xs font-bold text-navy outline-none focus:border-orange"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="btn-orange px-8 py-2.5 text-xs font-bold uppercase shadow-sm disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? (
              <>
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>Saving Changes...</span>
              </>
            ) : (
              <span>Update About Content</span>
            )}
          </button>
        </div>
      </form>

      {/* Media Picker Modal for Banner Image */}
      <MediaPickerModal
        isOpen={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={(url) => setCoverImage(url)}
      />
    </div>
  );
}
