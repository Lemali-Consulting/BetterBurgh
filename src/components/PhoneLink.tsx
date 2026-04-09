export default function PhoneLink({
  phone,
  phoneRaw,
  className = "",
}: {
  phone: string;
  phoneRaw: string | null;
  className?: string;
}) {
  const href = phoneRaw ? `tel:+1${phoneRaw}` : `tel:${phone}`;

  return (
    <a
      href={href}
      className={`text-blue-700 hover:text-blue-900 hover:underline font-medium ${className}`}
      aria-label={`Call ${phone}`}
    >
      {phone}
    </a>
  );
}
