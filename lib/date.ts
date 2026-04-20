export function formatDate(date: Date | string) {
    const d = new Date(date);
    const now = new Date();
  
    const diff = (now.getTime() - d.getTime()) / 1000;
  
    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
    if (diff < 7 * 86400) return `${Math.floor(diff / 86400)} days ago`;
  
    return d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }