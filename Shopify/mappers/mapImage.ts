export default function mapImage(image: any) {
  return {
    alt: image.node.altText,
    srcset: [
      { aspectRatio: 1, url: image.node.originalSrc, w: 500 },
      { aspectRatio: 1, url: image.node.transformedSrc, w: 500 }
    ]
  };
}
