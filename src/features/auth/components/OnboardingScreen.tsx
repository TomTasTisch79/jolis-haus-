"use client";

import { useState } from "react";
import { useProfiles } from "../hooks/useProfiles";
import { createProfile } from "../services/profiles";
import { MAX_PROFILES, PROFILE_COLORS } from "../types";
import styles from "./OnboardingScreen.module.css";

type OnboardingScreenProps = {
  onProfileSelected: (profileId: string) => void;
};

export function OnboardingScreen({ onProfileSelected }: OnboardingScreenProps) {
  const { profiles, isLoading, reload } = useProfiles();
  const [username, setUsername] = useState("");
  const [color, setColor] = useState<string>(PROFILE_COLORS[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isLoading || profiles === null) {
    return <main className={styles.screen} />;
  }

  const canCreateProfile = profiles.length < MAX_PROFILES;

  async function handleCreateProfile() {
    const trimmedUsername = username.trim();
    if (!trimmedUsername) return;

    setIsSubmitting(true);
    const profile = await createProfile(trimmedUsername, color);
    await reload();
    setIsSubmitting(false);
    onProfileSelected(profile.id);
  }

  return (
    <main className={styles.screen}>
      <h1 className={styles.title}>Jolis Haus</h1>

      {profiles.length > 0 && (
        <div className={styles.profileList}>
          <p className={styles.subtitle}>Wer bist du?</p>
          {profiles.map((profile) => (
            <button
              key={profile.id}
              className={styles.profileButton}
              onClick={() => onProfileSelected(profile.id)}
            >
              <span
                className={styles.avatar}
                style={{ background: profile.color ?? "var(--color-accent)" }}
              />
              {profile.username}
            </button>
          ))}
        </div>
      )}

      {canCreateProfile && (
        <div className={styles.form}>
          {profiles.length > 0 && (
            <p className={styles.subtitle}>Oder leg dein Profil an</p>
          )}
          <input
            className={styles.input}
            placeholder="Dein Name"
            aria-label="Dein Name"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
          />
          <div className={styles.colorRow} role="group" aria-label="Farbe auswählen">
            {PROFILE_COLORS.map((swatch) => (
              <button
                key={swatch}
                type="button"
                aria-pressed={swatch === color}
                className={`${styles.colorSwatch} ${
                  swatch === color ? styles.colorSwatchSelected : ""
                }`}
                style={{ background: swatch }}
                onClick={() => setColor(swatch)}
                aria-label={`Farbe ${swatch}`}
              />
            ))}
          </div>
          <button
            className={styles.primaryButton}
            disabled={!username.trim() || isSubmitting}
            onClick={handleCreateProfile}
          >
            Profil erstellen
          </button>
        </div>
      )}
    </main>
  );
}
