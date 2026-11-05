import Image from "next/image";

const cardSizes = "(max-width: 650px) calc(100vw - 48px), (max-width: 900px) calc(50vw - 49px), (max-width: 1272px) calc(33.33vw - 47px), 378px";
const detailSizes = "(max-width: 650px) calc(100vw - 50px), (max-width: 852px) calc(100vw - 70px), (max-width: 900px) 782px, (max-width: 1272px) calc(60vw - 86px), 675px";

export function ProductPhoto({ src, alt, detail = false }: { src: string; alt: string; detail?: boolean }) {
  return <Image
    src={src}
    alt={alt}
    fill
    sizes={detail ? detailSizes : cardSizes}
    quality={detail ? 85 : 75}
    loading={detail ? "eager" : "lazy"}
    fetchPriority={detail ? "high" : undefined}
  />;
}
