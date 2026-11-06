"use client";
export function ConfirmButton({ children, message = "Удалить? Это нельзя отменить.", className = "btn btn-danger btn-sm" }: { children: React.ReactNode; message?: string; className?: string }) {
  return <button className={className} onClick={(e) => { if (!confirm(message)) e.preventDefault(); }}>{children}</button>;
}
