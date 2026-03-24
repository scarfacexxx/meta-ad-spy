/**
 * Parse user input that can be:
 * - A Facebook page URL (facebook.com/pagename or facebook.com/profile.php?id=123)
 * - An Ad Library URL (facebook.com/ads/library/?active_status=all&ad_type=all&country=BR&view_all_page_id=123)
 * - A page ID (numeric)
 * - A keyword/name
 */
export function parseSearchInput(input: string): {
  type: "page_id" | "keyword";
  value: string;
} {
  const trimmed = input.trim();

  // Ad Library URL with view_all_page_id
  const adLibMatch = trimmed.match(/view_all_page_id=(\d+)/);
  if (adLibMatch) {
    return { type: "page_id", value: adLibMatch[1] };
  }

  // Ad Library URL with id param
  const idParamMatch = trimmed.match(/[?&]id=(\d+)/);
  if (idParamMatch) {
    return { type: "page_id", value: idParamMatch[1] };
  }

  // Facebook profile URL with numeric ID
  const profileMatch = trimmed.match(/facebook\.com\/profile\.php\?id=(\d+)/);
  if (profileMatch) {
    return { type: "page_id", value: profileMatch[1] };
  }

  // Facebook page URL (facebook.com/pagename)
  const pageUrlMatch = trimmed.match(
    /(?:facebook|fb)\.com\/(?!ads|search|groups|events|marketplace|watch|gaming|stories)([a-zA-Z0-9._-]+)\/?$/
  );
  if (pageUrlMatch) {
    // This is a page name/slug, use as keyword search
    return { type: "keyword", value: pageUrlMatch[1].replace(/[._-]/g, " ") };
  }

  // Pure numeric = page ID
  if (/^\d+$/.test(trimmed)) {
    return { type: "page_id", value: trimmed };
  }

  // Default: keyword
  return { type: "keyword", value: trimmed };
}
