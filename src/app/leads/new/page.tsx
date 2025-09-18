/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState, useEffect } from "react";

interface Campaign {
  campaignId: string;
  name: string;
  adsetId: string;
  params: string[];
  creativeLink: string[];
}

export default function NewLeadPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [campaignLoading, setCampaignLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Hardcoded values
  const COMPANY_ID = "COMP00000001";
  const CAMPAIGN_ID = "CAMP00001";

  // Set mounted state to prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch campaign details on component mount
  useEffect(() => {
    if (!mounted) return;

    async function fetchCampaign() {
      try {
        const res = await fetch(
          `/api/campaign?campaignId=${CAMPAIGN_ID}&companyId=${COMPANY_ID}`
        );
        const data = await res.json();

        if (res.ok) {
          setCampaign(data.campaign);
          console.log("Campaign loaded:", data.campaign);
        } else {
          console.error("Failed to fetch campaign:", data.error);
          setMessage("Failed to load campaign details");
        }
      } catch (err) {
        console.error("Error fetching campaign:", err);
        setMessage("Error loading campaign details");
      } finally {
        setCampaignLoading(false);
      }
    }

    fetchCampaign();
  }, [mounted]);

  // Function to get field properties based on parameter name
  function getFieldProperties(param: string) {
    const fieldMap: Record<
      string,
      { label: string; placeholder: string; type: string; required: boolean }
    > = {
      "first-name": {
        label: "First Name",
        placeholder: "John",
        type: "text",
        required: true,
      },
      "last-name": {
        label: "Last Name",
        placeholder: "Doe",
        type: "text",
        required: true,
      },
      email: {
        label: "Email",
        placeholder: "john@example.com",
        type: "email",
        required: true,
      },
      phone: {
        label: "Phone",
        placeholder: "+1 555 000 0000",
        type: "tel",
        required: false,
      },
      location: {
        label: "Location",
        placeholder: "City, Area or Address",
        type: "text",
        required: false,
      },
      "full-name": {
        label: "Full Name",
        placeholder: "John Doe",
        type: "text",
        required: true,
      },
      name: {
        label: "Name",
        placeholder: "John Doe",
        type: "text",
        required: true,
      },
      phoneNumber: {
        label: "Phone Number",
        placeholder: "+1 555 000 0000",
        type: "tel",
        required: false,
      },
      whatsapp: {
        label: "WhatsApp",
        placeholder: "+1 555 000 0000",
        type: "tel",
        required: false,
      },
    };

    return (
      fieldMap[param] || {
        label: param,
        placeholder: `Enter ${param}`,
        type: "text",
        required: false,
      }
    );
  }

  // Function to render form fields based on campaign parameters
  function renderFormFields() {
    if (!campaign?.params) return null;

    return campaign.params.map((param, index) => {
      const fieldProps = getFieldProperties(param);
      const isEven = index % 2 === 0;

      return (
        <div
          key={param}
          className={`sm:col-span-1 ${
            !isEven &&
            campaign.params.length % 2 === 1 &&
            index === campaign.params.length - 1
              ? "sm:col-span-2"
              : ""
          }`}
        >
          <label className="text-sm text-foreground/80">
            {fieldProps.label}
            {fieldProps.required ? "*" : ""}
          </label>
          <input
            name={param}
            type={fieldProps.type}
            required={fieldProps.required}
            placeholder={fieldProps.placeholder}
            className="mt-2 w-full rounded-lg border border-foreground/15 bg-background px-3 py-2 sm:px-4 sm:py-3 text-foreground placeholder:text-foreground/40 outline-none focus:border-azure focus:ring-2 focus:ring-azure/60 transition-colors"
          />
        </div>
      );
    });
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage(null);
    setLoading(true);

    const form = e.currentTarget;
    const formData = new FormData(form);

    // Build content payload dynamically based on campaign parameters
    const content: Record<string, string> = {};

    if (campaign?.params) {
      campaign.params.forEach((param) => {
        const value = String(formData.get(param) || "");
        if (value) {
          content[param] = value;
        }
      });
    }

    // Create payload object with only the fields we need
    const payload: any = {
      content,
      companyId: COMPANY_ID,
      campaignId: CAMPAIGN_ID,
    };

    // Coerce specific fields
    if (payload.priority) payload.priority = String(Number(payload.priority));
    if (payload.contactAttempts)
      payload.contactAttempts = String(Number(payload.contactAttempts));

    console.log("Sending payload:", payload);

    try {
      const res = await fetch("/api/leed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      console.log("Response status:", res.status);
      console.log("Response headers:", res.headers);

      if (!res.ok) {
        const errorText = await res.text();
        console.error("Error response:", errorText);
        throw new Error(`HTTP ${res.status}: ${errorText}`);
      }

      const json = await res.json();
      console.log("Success response:", json);

      setMessage("Lead created ✔");
      form.reset();
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "An unknown error occurred";
      setMessage(`Error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(ellipse_at_top_right,var(--color-azure)_0%,transparent_40%),radial-gradient(ellipse_at_bottom_left,var(--color-easter-purple)_0%,transparent_45%)] animate-fade-in">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:py-16">
        <div className="rounded-2xl border border-foreground/10 bg-background/80 shadow-xl backdrop-blur-md animate-slide-up">
          <div className="border-b border-foreground/10 p-6 sm:p-8">
            <h1 className="text-2xl sm:text-3xl font-semibold bg-gradient-to-r from-azure via-science-blue to-artyclick-purple bg-clip-text text-transparent">
              Create Lead
            </h1>
            <p className="mt-2 text-sm text-foreground/70">
              {!mounted || campaignLoading
                ? "Loading campaign..."
                : campaign
                ? `Add a new lead to ${campaign.name}`
                : "Add a new lead to campaign CAMP00001"}
            </p>
          </div>
          <form
            onSubmit={onSubmit}
            className="p-6 sm:p-8 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6"
          >
            {!mounted || campaignLoading ? (
              <div className="sm:col-span-2 flex items-center justify-center py-8">
                <div className="text-sm text-foreground/70">
                  Loading form fields...
                </div>
              </div>
            ) : (
              renderFormFields()
            )}
            <div className="sm:col-span-2 mt-2">
              <button
                type="submit"
                disabled={loading}
                className={`w-full rounded-lg bg-gradient-to-r from-azure via-science-blue to-artyclick-purple px-4 py-3 text-white font-medium shadow-md transition-transform duration-200 hover:translate-y-[-1px] hover:shadow-lg active:translate-y-[0px] ${
                  loading ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                {loading ? "Submitting..." : "Create Lead"}
              </button>
            </div>
          </form>
          {message && (
            <div
              className={`mx-6 mb-6 sm:mx-8 rounded-lg border px-4 py-3 text-sm ${
                message.startsWith("Error:")
                  ? "border-red-500/30 text-red-600 bg-red-500/5"
                  : "border-azure/30 text-foreground bg-azure/5"
              }`}
            >
              {message}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
