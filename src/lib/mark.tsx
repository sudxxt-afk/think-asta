// The app icon: the coral tile with the black T, drawn for ImageResponse
export function Mark({ size }: { size: number }) {
  return (
    <div style={{ width: size, height: size, display: "flex", alignItems: "center", justifyContent: "center", background: "#FF5A4E" }}>
      <svg width={size * 0.56} height={size * 0.56} viewBox="16 18 32 32">
        <path d="M18 20h28v7H35v21h-7V27H18z" fill="#0B0B0F" />
      </svg>
    </div>
  );
}
