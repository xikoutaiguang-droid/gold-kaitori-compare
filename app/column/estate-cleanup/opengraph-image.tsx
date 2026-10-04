/** この記事のOGP画像。中身は lib/ogImage.tsx が作る(全記事で同じ作りにするため) */
import { columnOgImage, columnTitle, OG_CONTENT_TYPE, OG_SIZE } from "@/lib/ogImage";

const PATH = "/column/estate-cleanup";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = columnTitle(PATH);

export default function Image() {
  return columnOgImage(PATH);
}
