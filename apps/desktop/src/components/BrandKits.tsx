import { BrandKitEditor } from "./BrandKitEditor";

export function BrandKits() {
  return (
    <section className="brand-kits-page">
      <div className="settings-intro">
        <h2>Brand kits</h2>
        <p className="muted">
          Colors, fonts, tone, and reference images are stored locally on this device.
        </p>
      </div>
      <BrandKitEditor />
    </section>
  );
}
