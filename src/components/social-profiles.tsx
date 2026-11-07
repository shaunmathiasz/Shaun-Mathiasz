import { PlatformArtwork, type SocialPlatform } from "./platform-artwork";
import { site } from "@/config/site";
const handles: Record<string, string> = {
  Instagram: "@shaun.mathiasz",
  TikTok: "@shaunmathiasz",
  Facebook: "ShaunMathiasz",
  LinkedIn: "shaun-denver",
};
export function SocialProfiles() {
  return (
    <section className="section social-profiles" id="social">
      <div className="section-title">
        <div>
          <p className="eyebrow">BEYOND THE WORK</p>
          <h2>Different windows. The same perspective.</h2>
        </div>
      </div>
      <p>
        A place for professional connections, personal interests and the
        curiosity behind the journey.
      </p>
      <div className="social-grid">
        {site.socialLinks.map((link) => (
          <details key={link.label} className="social-profile">
            <summary>
              <span className="eyebrow">{link.label}</span>
              <strong>{handles[link.label]}</strong>
              <span className="social-preview-label">
                Explore profile <span aria-hidden="true">↗</span>
              </span>
            </summary>
            <div className="social-profile-preview">
              <PlatformArtwork
                platform={link.label as SocialPlatform}
                compact
              />
              <p>Shaun Denver Mathiasz</p>
              <span>Travel · Commerce · A wider perspective</span>
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-link"
              >
                Open on {link.label} ↗
              </a>
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}
