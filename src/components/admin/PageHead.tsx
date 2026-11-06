export function PageHead({ title, text, children }: { title: string; text?: React.ReactNode; children?: React.ReactNode }) {
  return (
    <header className="adm-head">
      <div className="min-w-0">
        <h1 className="adm-title">{title}</h1>
        {text && <p className="adm-sub">{text}</p>}
      </div>
      {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
    </header>
  );
}
