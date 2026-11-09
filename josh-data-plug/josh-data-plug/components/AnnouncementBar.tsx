export default function AnnouncementBar({ message }: { message: string }) {
  return (
    <div className="bg-accent-600 px-4 py-1.5 text-center text-xs font-semibold text-white sm:text-sm">
      ⚡ {message}
    </div>
  );
}
