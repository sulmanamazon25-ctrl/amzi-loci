import type { GeneratedImage } from "../lib/images";
import type { ImageSlot } from "@amzi-loci/shared";

type ImageGalleryProps = {
  images: GeneratedImage[];
  loading: boolean;
  progress?: string | null;
  onRegenerate: (slot: ImageSlot) => void;
  regeneratingId?: string | null;
};

export function ImageGallery({
  images,
  loading,
  progress,
  onRegenerate,
  regeneratingId,
}: ImageGalleryProps) {
  const mainImages = images.filter((img) => img.slotType === "main");
  const galleryImages = images.filter((img) => img.slotType === "gallery");

  return (
    <div className="image-gallery">
      {loading && (
        <p className="muted gallery-progress">
          {progress ?? "Generating images… this can take several minutes."}
        </p>
      )}

      {mainImages.length > 0 && (
        <section className="gallery-section">
          <h3>Main images ({mainImages.length}/3)</h3>
          <div className="gallery-grid main-grid">
            {mainImages.map((image) => (
              <ImageCard
                key={image.id}
                image={image}
                onRegenerate={onRegenerate}
                busy={regeneratingId === image.id}
                disabled={loading}
              />
            ))}
          </div>
        </section>
      )}

      {galleryImages.length > 0 && (
        <section className="gallery-section">
          <h3>Gallery images ({galleryImages.length}/5)</h3>
          <div className="gallery-grid">
            {galleryImages.map((image) => (
              <ImageCard
                key={image.id}
                image={image}
                onRegenerate={onRegenerate}
                busy={regeneratingId === image.id}
                disabled={loading}
              />
            ))}
          </div>
        </section>
      )}

      {!loading && images.length === 0 && (
        <p className="muted">No images yet. Choose a tier and click Generate.</p>
      )}
    </div>
  );
}

function ImageCard({
  image,
  onRegenerate,
  busy,
  disabled,
}: {
  image: GeneratedImage;
  onRegenerate: (slot: ImageSlot) => void;
  busy: boolean;
  disabled: boolean;
}) {
  return (
    <article className="gallery-card">
      <img src={image.dataUrl} alt={image.label} />
      <div className="gallery-card-body">
        <strong>{image.label}</strong>
        <button
          type="button"
          className="secondary-btn"
          disabled={disabled || busy}
          onClick={() =>
            onRegenerate({
              slotType: image.slotType as ImageSlot["slotType"],
              slotIndex: image.slotIndex,
            })
          }
        >
          {busy ? "Regenerating…" : "Regenerate"}
        </button>
      </div>
    </article>
  );
}
