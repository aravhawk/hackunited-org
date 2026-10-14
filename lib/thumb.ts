/** Maps a full-size team photo to its optimised 480px WebP copy in /images/team-images/sm. */
export function thumb(src: string | undefined) {
  if (!src) return "/placeholder.svg";
  const m = src.match(/^\/images\/team-images\/([^/]+)\.[a-z]+$/i);
  return m ? `/images/team-images/sm/${m[1]}.webp` : src;
}
