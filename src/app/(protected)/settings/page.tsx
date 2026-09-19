import SharingSettings from "./sharing-settings";

export const metadata = {
  title: "Settings · GitVizor",
  description: "Manage project sharing and other settings",
};

export default function SettingsPage() {
  return (
    <div className="max-w-2xl mx-auto py-8 px-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight">Project Settings</h1>
        <p className="text-sm text-muted-foreground/60 mt-1">
          Manage sharing and other project preferences
        </p>
      </div>
      <SharingSettings />
    </div>
  );
}
