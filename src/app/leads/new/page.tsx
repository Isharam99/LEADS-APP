
"use client";
import { useState } from "react";


export default function NewLeadPage() {
const [loading, setLoading] = useState(false);
const [message, setMessage] = useState<string | null>(null);


async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
e.preventDefault();
setMessage(null);
setLoading(true);


const form = e.currentTarget;
const formData = new FormData(form);


const payload = Object.fromEntries(formData.entries());

// Build content payload from user-visible fields
const content = {
firstName: String(formData.get("firstName") || ""),
lastName: String(formData.get("lastName") || ""),
email: String(formData.get("email") || ""),
phone: String(formData.get("phone") || ""),
location: String(formData.get("location") || ""),
};
payload.content = JSON.stringify(content);


// Coerce specific fields
if (payload.priority) payload.priority = String(Number(payload.priority));
if (payload.contactAttempts) payload.contactAttempts = String(Number(payload.contactAttempts));


try {
const res = await fetch("/api/leads", {
method: "POST",
headers: { "Content-Type": "application/json" },
body: JSON.stringify(payload),
});
const json = await res.json();
if (!res.ok) throw new Error(JSON.stringify(json.error ?? json));


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
<h1 className="text-2xl sm:text-3xl font-semibold bg-gradient-to-r from-azure via-science-blue to-artyclick-purple bg-clip-text text-transparent">Create Lead</h1>
<p className="mt-2 text-sm text-foreground/70">Add a new lead to your campaign.</p>
</div>
<form onSubmit={onSubmit} className="p-6 sm:p-8 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
<div className="sm:col-span-1">
<label className="text-sm text-foreground/80">Campaign*</label>
<select name="campaignId" required defaultValue="" className="mt-2 w-full rounded-lg border border-foreground/15 bg-background px-3 py-2 sm:px-4 sm:py-3 text-foreground outline-none focus:border-azure focus:ring-2 focus:ring-azure/60 transition-colors">
<option value="" disabled>Select a campaign</option>
<option value="spring-2025">Spring 2025</option>
<option value="summer-2025">Summer 2025</option>
<option value="fall-2025">Fall 2025</option>
</select>
</div>
<div className="sm:col-span-1">
<label className="text-sm text-foreground/80">First Name*</label>
<input name="firstName" required placeholder="John" className="mt-2 w-full rounded-lg border border-foreground/15 bg-background px-3 py-2 sm:px-4 sm:py-3 text-foreground placeholder:text-foreground/40 outline-none focus:border-azure focus:ring-2 focus:ring-azure/60 transition-colors" />
</div>
<div className="sm:col-span-1">
<label className="text-sm text-foreground/80">Last Name*</label>
<input name="lastName" required placeholder="Doe" className="mt-2 w-full rounded-lg border border-foreground/15 bg-background px-3 py-2 sm:px-4 sm:py-3 text-foreground placeholder:text-foreground/40 outline-none focus:border-azure focus:ring-2 focus:ring-azure/60 transition-colors" />
</div>
<div className="sm:col-span-1">
<label className="text-sm text-foreground/80">Email*</label>
<input name="email" type="email" required placeholder="john@example.com" className="mt-2 w-full rounded-lg border border-foreground/15 bg-background px-3 py-2 sm:px-4 sm:py-3 text-foreground placeholder:text-foreground/40 outline-none focus:border-azure focus:ring-2 focus:ring-azure/60 transition-colors" />
</div>
<div className="sm:col-span-1">
<label className="text-sm text-foreground/80">Phone</label>
<input name="phone" inputMode="tel" placeholder="+1 555 000 0000" className="mt-2 w-full rounded-lg border border-foreground/15 bg-background px-3 py-2 sm:px-4 sm:py-3 text-foreground placeholder:text-foreground/40 outline-none focus:border-azure focus:ring-2 focus:ring-azure/60 transition-colors" />
</div>
<div className="sm:col-span-2">
<label className="text-sm text-foreground/80">Location</label>
<input name="location" placeholder="City, Area or Address" className="mt-2 w-full rounded-lg border border-foreground/15 bg-background px-3 py-2 sm:px-4 sm:py-3 text-foreground placeholder:text-foreground/40 outline-none focus:border-azure focus:ring-2 focus:ring-azure/60 transition-colors" />
</div>
<div className="sm:col-span-2 mt-2">
<button type="submit" disabled={loading} className={`w-full rounded-lg bg-gradient-to-r from-azure via-science-blue to-artyclick-purple px-4 py-3 text-white font-medium shadow-md transition-transform duration-200 hover:translate-y-[-1px] hover:shadow-lg active:translate-y-[0px] ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}>
{loading ? "Submitting..." : "Create Lead"}
</button>
</div>
</form>
{message && (
<div className={`mx-6 mb-6 sm:mx-8 rounded-lg border px-4 py-3 text-sm ${message.startsWith('Error:') ? 'border-red-500/30 text-red-600 bg-red-500/5' : 'border-azure/30 text-foreground bg-azure/5'}`}>
{message}
</div>
)}
</div>
</div>
</main>
);
}