"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import * as Tabs from "@radix-ui/react-tabs";
import { useAuthContext } from "@/components/providers/AuthProvider";
import { db } from "@/lib/firebase/client";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { uploadAvatar } from "@/lib/firebase/storage";
import { updateEmail, updatePassword, updateProfile, deleteUser } from "firebase/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { FavouritesTab } from "@/components/features/FavouritesTab";

function AccountContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading } = useAuthContext();
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "profile");

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab) setActiveTab(tab);
  }, [searchParams]);

  if (loading || !user) {
    return <div className="flex h-[50vh] items-center justify-center text-[#5f5f5d]">Loading...</div>;
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-12">
      <h1 className="t-h2 text-[#1c1c1c] mb-8">Account Configuration</h1>
      
      <Tabs.Root value={activeTab} onValueChange={setActiveTab} className="flex flex-col gap-8">
        <Tabs.List className="flex border-b border-passive overflow-x-auto">
          {["profile", "favourites", "submissions", "settings"].map((tab) => (
            <Tabs.Trigger 
              key={tab}
              value={tab} 
              className="px-6 py-3 text-[14px] font-medium capitalize text-[#5f5f5d] data-[state=active]:text-[#1c1c1c] data-[state=active]:border-b-2 data-[state=active]:border-[#1c1c1c] transition-colors focus:outline-none"
            >
              {tab === "submissions" ? "My Submissions" : tab}
            </Tabs.Trigger>
          ))}
        </Tabs.List>

        <Tabs.Content value="profile" className="focus:outline-none">
          <ProfileTab user={user} />
        </Tabs.Content>

        <Tabs.Content value="favourites" className="focus:outline-none">
          <FavouritesTab />
        </Tabs.Content>

        <Tabs.Content value="submissions" className="focus:outline-none">
          <div className="py-8 text-center text-[#5f5f5d]">
            <p>You haven't submitted any spots yet.</p>
          </div>
        </Tabs.Content>

        <Tabs.Content value="settings" className="focus:outline-none">
          <SettingsTab user={user} />
        </Tabs.Content>

      </Tabs.Root>
    </div>
  );
}

function ProfileTab({ user }: { user: any }) {
  const [displayName, setDisplayName] = useState(user.displayName || "");
  const [homeBorough, setHomeBorough] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchUserDoc = async () => {
      try {
        const d = await getDoc(doc(db, "users", user.uid));
        if (d.exists() && d.data().homeBorough) {
          setHomeBorough(d.data().homeBorough);
        }
      } catch (e) {}
    };
    fetchUserDoc();
  }, [user.uid]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError("");
    setSuccess("");

    if (file.size > 1024 * 1024) {
      setError("Image must be smaller than 1MB.");
      return;
    }

    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = async () => {
      if (img.width > 1024 || img.height > 1024) {
        setError("Image dimensions must be 1024x1024 or smaller.");
        URL.revokeObjectURL(img.src);
        return;
      }
      
      try {
        setSaving(true);
        const url = await uploadAvatar(file, user.uid);
        
        await updateProfile(user, { photoURL: url });
        await updateDoc(doc(db, "users", user.uid), { photoUrl: url });
        setSuccess("Avatar updated successfully!");
      } catch (err: any) {
        setError(err.message || "Upload failed");
      } finally {
        setSaving(false);
      }
      URL.revokeObjectURL(img.src);
    };
  };

  const handleSave = async () => {
    setError("");
    setSuccess("");
    setSaving(true);
    try {
      if (displayName !== user.displayName) {
        await updateProfile(user, { displayName });
      }
      await updateDoc(doc(db, "users", user.uid), {
        displayName,
        homeBorough
      });
      setSuccess("Profile saved!");
    } catch (err: any) {
      setError("Failed to save profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-md flex flex-col gap-6">
      <div className="flex items-center gap-6">
        <label className="relative cursor-pointer group flex items-center justify-center w-24 h-24 rounded-full bg-passive overflow-hidden border border-passive">
          <img 
            src={user.photoURL || `https://ui-avatars.com/api/?name=${displayName || 'U'}&background=1c1c1c&color=fcfbf8`} 
            alt="Avatar" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40 hidden group-hover:flex items-center justify-center text-white text-[12px] font-medium transition-all">
            Upload
          </div>
          <input type="file" accept="image/*" className="hidden"onChange={handleAvatarUpload} disabled={saving} />
        </label>
        <div className="text-[14px] text-[#5f5f5d]">
          <p>JPG or PNG under 1MB</p>
          <p>Max dimensions 1024x1024</p>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-[14px] font-medium text-[#1c1c1c]">Display Name</label>
        <Input 
          value={displayName} 
          onChange={(e) => setDisplayName(e.target.value)} 
          placeholder="How you appear to others" 
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-[14px] font-medium text-[#1c1c1c]">Home Borough (Optional)</label>
        <Input 
          value={homeBorough} 
          onChange={(e) => setHomeBorough(e.target.value)} 
          placeholder="e.g. Hackney, Islington" 
        />
      </div>

      {error && <p className="text-[#dc2626] text-[14px]">{error}</p>}
      {success && <p className="text-green-600 text-[14px]">{success}</p>}

      <Button variant="primary" className="w-fit mt-2" onClick={handleSave} disabled={saving}>
        {saving ? "Saving..." : "Save Profile"}
      </Button>
    </div>
  );
}

function SettingsTab({ user }: { user: any }) {
  const router = useRouter();
  const [email, setEmail] = useState(user.email || "");
  const [password, setPassword] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [favouritesPublic, setFavouritesPublic] = useState(false);
  const profileUrl = typeof window !== "undefined" ? `${window.location.origin}/u/${user.uid}` : `/u/${user.uid}`;

  useEffect(() => {
    getDoc(doc(db, "users", user.uid)).then((d) => {
      if (d.exists()) setFavouritesPublic(!!d.data().favouritesPublic);
    });
  }, [user.uid]);

  const toggleFavouritesPublic = async (value: boolean) => {
    setFavouritesPublic(value);
    await updateDoc(doc(db, "users", user.uid), { favouritesPublic: value });
  };

  const handleUpdateAuth = async (type: "email" | "password") => {
    setLoading(true);
    setMsg({ type: "", text: "" });
    try {
      if (type === "email") {
         await updateEmail(user, email);
         setMsg({ type: "success", text: "Email updated!" });
      } else {
         await updatePassword(user, password);
         setMsg({ type: "success", text: "Password updated!" });
         setPassword("");
      }
    } catch (e: any) {
      setMsg({ type: "error", text: e.message || "Sensitive updates might require you to log out and back in." });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (deleteConfirm !== "DELETE") return;
    setLoading(true);
    try {
      await deleteUser(user);
      router.push("/");
    } catch (e: any) {
      setMsg({ type: "error", text: e.message || "You must log in recently to delete your account. Please log out and back in." });
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md flex flex-col gap-10">

      {/* Public profile link */}
      <div className="flex flex-col gap-3">
        <h3 className="font-semibold text-[#1c1c1c]">Your Public Profile</h3>
        <div className="flex items-center gap-2">
          <input
            readOnly
            value={profileUrl}
            className="flex-1 px-3 py-2 text-[13px] border border-passive rounded-lg bg-[#f7f4ed] text-[#5f5f5d] focus:outline-none"
          />
          <button
            onClick={() => navigator.clipboard.writeText(profileUrl)}
            className="px-3 py-2 text-[13px] font-medium border border-passive rounded-lg bg-white hover:bg-[#f7f4ed] transition-colors"
          >
            Copy
          </button>
        </div>
      </div>

      {/* Favourites visibility */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <span className="text-[14px] font-semibold text-[#1c1c1c]">Public favourites</span>
          <span className="text-[13px] text-[#5f5f5d]">Show your saved spots on your public profile</span>
        </div>
        <button
          role="switch"
          aria-checked={favouritesPublic}
          onClick={() => toggleFavouritesPublic(!favouritesPublic)}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none ${
            favouritesPublic ? "bg-[#1c1c1c]" : "bg-passive"
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
              favouritesPublic ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </button>
      </div>

      <hr className="border-passive" />

      {/* Email Update */}
      <div className="flex flex-col gap-3">
        <h3 className="font-semibold text-[#1c1c1c]">Update Email</h3>
        <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="New Email" />
        <Button variant="ghost" className="w-fit" onClick={() => handleUpdateAuth("email")} disabled={loading || email === user.email}>
          Save Email
        </Button>
      </div>

      {/* Password Update */}
      <div className="flex flex-col gap-3">
        <h3 className="font-semibold text-[#1c1c1c]">Update Password</h3>
        <Input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="New Password" />
        <Button variant="ghost" className="w-fit" onClick={() => handleUpdateAuth("password")} disabled={loading || !password}>
          Save Password
        </Button>
      </div>

      {msg.text && (
        <p className={`text-[14px] ${msg.type === "error" ? "text-[#dc2626]" : "text-green-600"}`}>
          {msg.text}
        </p>
      )}

      <hr className="border-passive" />

      {/* Danger Zone */}
      <div className="flex flex-col gap-3 mt-4">
        <h3 className="font-semibold text-[#dc2626]">Danger Zone</h3>
        <p className="text-[14px] text-[#5f5f5d]">Once deleted, your account and all associated data cannot be recovered.</p>
        
        <label className="text-[14px] mt-2 font-medium">Type DELETE to confirm</label>
        <Input 
          value={deleteConfirm} 
          onChange={(e) => setDeleteConfirm(e.target.value)} 
          placeholder="DELETE" 
        />
        
        <Button 
          variant="ghost" 
          className="w-fit mt-2 text-[#dc2626] border-[#dc2626]/20 hover:bg-[#dc2626]/5 disabled:opacity-50" 
          onClick={handleDelete}
          disabled={loading || deleteConfirm !== "DELETE"}
        >
          Delete Account
        </Button>
      </div>

    </div>
  );
}

export default function AccountPage() {
  return (
    <Suspense fallback={<div className="flex h-[50vh] items-center justify-center text-[#5f5f5d]">Loading configuration...</div>}>
      <AccountContent />
    </Suspense>
  );
}
