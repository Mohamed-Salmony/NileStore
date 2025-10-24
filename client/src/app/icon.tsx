export const contentType = 'image/png';
export const size = { width: 512, height: 512 };

// Return No Content so /icon route doesn't error and favicon.ico (from metadata) is used instead.
export default function Icon() {
  return new Response(null, { status: 204 });
}
