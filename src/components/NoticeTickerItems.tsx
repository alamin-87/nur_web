const DEFAULT_NOTICE_BN =
  "★ কোন পার্টস স্টকে না থাকলে জরুরী প্রয়োজনে অর্ডার দেওয়ার ০৩ কার্যদিবসের মধ্যে চায়না থেকে আমদানি করে সরবরাহ করা হয় ★";
const DEFAULT_NOTICE_EN = "Out of stock products will be delivered within 3–5 days.";

type NoticeTickerItemsProps = {
  noticeBn?: string;
  noticeEn?: string;
  itemClassName?: string;
  labelClassName?: string;
  textClassName?: string;
};

export function NoticeTickerItems({
  noticeBn,
  noticeEn,
  itemClassName = "notice-ticker-item",
  labelClassName = "notice-label",
  textClassName = "notice-text",
}: NoticeTickerItemsProps) {
  const bangla = noticeBn?.trim() || DEFAULT_NOTICE_BN;
  const english = noticeEn?.trim() || DEFAULT_NOTICE_EN;

  return (
    <>
      <span className={itemClassName}>
        <span className={labelClassName}>NOTICE:</span>
        <span className={textClassName} lang="bn">
          {bangla}
        </span>
      </span>
      <span className={itemClassName}>
        <span className={labelClassName}>NOTICE:</span>
        <span className={textClassName}>{english}</span>
      </span>
    </>
  );
}
