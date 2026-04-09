"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CarBootSale } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

type ListingEditorProps = {
  mode: "create" | "edit";
  listing?: CarBootSale;
};

export function ListingEditor({ mode, listing }: ListingEditorProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState({
    name: listing?.name || "",
    location: listing?.location || "",
    address: listing?.address || "",
    description: listing?.description || "",
    teaser: listing?.teaser || "",
    daysOfWeek: listing?.daysOfWeek?.join(", ") || "Saturday",
    startTime: listing?.startTime || "07:00",
    endTime: listing?.endTime || "13:00",
    carPrice: String(listing?.carPrice ?? 10),
    vanPrice: String(listing?.vanPrice ?? 16),
    organiserEmail: listing?.organiserEmail || "",
    organiserPhone: listing?.organiserPhone || "",
    eventAnnouncement: listing?.eventAnnouncement || "",
    what3words: listing?.what3words || "",
    image: listing?.images?.[0] || "",
    freeParking: listing?.freeParking ?? true,
    hasToilets: listing?.hasToilets ?? true,
    hasHotFood: listing?.hasHotFood ?? true,
    hasDisabledAccess: listing?.hasDisabledAccess ?? false,
    showEmail: listing?.showEmail ?? true,
    showPhone: listing?.showPhone ?? true,
  });

  const heading = useMemo(
    () => (mode === "create" ? "Create organiser listing" : "Update organiser listing"),
    [mode],
  );

  const updateField = (field: keyof typeof form, value: string | boolean) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSaving(true);

    try {
      const payload = {
        name: form.name,
        location: form.location,
        address: form.address,
        description: form.description,
        teaser: form.teaser,
        daysOfWeek: form.daysOfWeek
          .split(",")
          .map((value) => value.trim().toLowerCase())
          .filter(Boolean),
        startTime: form.startTime,
        endTime: form.endTime,
        carPrice: Number(form.carPrice),
        vanPrice: Number(form.vanPrice),
        organiserEmail: form.organiserEmail,
        organiserPhone: form.organiserPhone,
        eventAnnouncement: form.eventAnnouncement || null,
        what3words: form.what3words || null,
        images: form.image ? [form.image] : ["/car-boot-sale.jpg"],
        freeParking: form.freeParking,
        hasToilets: form.hasToilets,
        hasHotFood: form.hasHotFood,
        hasDisabledAccess: form.hasDisabledAccess,
        showEmail: form.showEmail,
        showPhone: form.showPhone,
      };

      const response = await fetch(
        mode === "create" ? "/api/car-boot-sales" : `/api/car-boot-sales/${listing?.id}`,
        {
          method: mode === "create" ? "POST" : "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Unable to save listing.");
      }

      toast({
        title: mode === "create" ? "Listing created" : "Listing updated",
        description:
          mode === "create"
            ? "Your listing is ready for organiser review."
            : "Your changes are now reflected in the profile.",
      });
      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      toast({
        title: "Save failed",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div>
        <div className="text-xs uppercase tracking-[0.18em] text-brand-brown/60">
          Organiser workspace
        </div>
        <h2 className="font-heading mt-2 text-4xl font-semibold text-brand-ink">
          {heading}
        </h2>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="name">Listing name</Label>
          <Input
            id="name"
            value={form.name}
            onChange={(event) => updateField("name", event.target.value)}
            className="h-12 rounded-2xl"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="location">Town or city</Label>
          <Input
            id="location"
            value={form.location}
            onChange={(event) => updateField("location", event.target.value)}
            className="h-12 rounded-2xl"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="address">Address</Label>
          <Input
            id="address"
            value={form.address}
            onChange={(event) => updateField("address", event.target.value)}
            className="h-12 rounded-2xl"
            required
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="teaser">Short teaser</Label>
          <Input
            id="teaser"
            value={form.teaser}
            onChange={(event) => updateField("teaser", event.target.value)}
            className="h-12 rounded-2xl"
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="description">Full description</Label>
          <Textarea
            id="description"
            value={form.description}
            onChange={(event) => updateField("description", event.target.value)}
            rows={6}
            className="rounded-[1.5rem]"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="daysOfWeek">Days of week</Label>
          <Input
            id="daysOfWeek"
            value={form.daysOfWeek}
            onChange={(event) => updateField("daysOfWeek", event.target.value)}
            className="h-12 rounded-2xl"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="image">Hero image URL</Label>
          <Input
            id="image"
            value={form.image}
            onChange={(event) => updateField("image", event.target.value)}
            className="h-12 rounded-2xl"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="startTime">Start time</Label>
          <Input
            id="startTime"
            type="time"
            value={form.startTime}
            onChange={(event) => updateField("startTime", event.target.value)}
            className="h-12 rounded-2xl"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="endTime">End time</Label>
          <Input
            id="endTime"
            type="time"
            value={form.endTime}
            onChange={(event) => updateField("endTime", event.target.value)}
            className="h-12 rounded-2xl"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="carPrice">Car price</Label>
          <Input
            id="carPrice"
            type="number"
            value={form.carPrice}
            onChange={(event) => updateField("carPrice", event.target.value)}
            className="h-12 rounded-2xl"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="vanPrice">Van price</Label>
          <Input
            id="vanPrice"
            type="number"
            value={form.vanPrice}
            onChange={(event) => updateField("vanPrice", event.target.value)}
            className="h-12 rounded-2xl"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="organiserEmail">Contact email</Label>
          <Input
            id="organiserEmail"
            type="email"
            value={form.organiserEmail}
            onChange={(event) => updateField("organiserEmail", event.target.value)}
            className="h-12 rounded-2xl"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="organiserPhone">Contact phone</Label>
          <Input
            id="organiserPhone"
            value={form.organiserPhone}
            onChange={(event) => updateField("organiserPhone", event.target.value)}
            className="h-12 rounded-2xl"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="what3words">What3Words</Label>
          <Input
            id="what3words"
            value={form.what3words}
            onChange={(event) => updateField("what3words", event.target.value)}
            className="h-12 rounded-2xl"
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="eventAnnouncement">Event announcement</Label>
          <Textarea
            id="eventAnnouncement"
            value={form.eventAnnouncement}
            onChange={(event) => updateField("eventAnnouncement", event.target.value)}
            rows={4}
            className="rounded-[1.5rem]"
          />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
        {[
          ["freeParking", "Free parking"],
          ["hasToilets", "Toilets on site"],
          ["hasHotFood", "Hot food available"],
          ["hasDisabledAccess", "Disabled access"],
          ["showEmail", "Show email publicly"],
          ["showPhone", "Show phone publicly"],
        ].map(([field, label]) => (
          <label
            key={field}
            className="flex items-center gap-3 rounded-[1.25rem] border border-brand-brown/10 bg-brand-cream px-4 py-3 text-sm text-brand-brown/85"
          >
            <input
              type="checkbox"
              checked={Boolean(form[field as keyof typeof form])}
              onChange={(event) =>
                updateField(field as keyof typeof form, event.target.checked)
              }
            />
            <span>{label}</span>
          </label>
        ))}
      </div>

      <div className="flex flex-wrap gap-4">
        <Button
          type="submit"
          disabled={isSaving}
          className="rounded-full bg-brand-ink px-6 text-white hover:bg-brand-brown"
        >
          {isSaving ? "Saving..." : mode === "create" ? "Create listing" : "Save changes"}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="rounded-full border-brand-brown/20 bg-white"
          onClick={() => router.push("/dashboard")}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
