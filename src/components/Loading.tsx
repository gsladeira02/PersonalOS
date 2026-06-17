export function Loading({ text = 'Carregando...' }: { text?: string }) {
  return <div className="empty">{text}</div>;
}
