import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { MissingPath } from "@/components/MissingPath";
import "./not-found.css";

export const metadata = { title: "Страница не найдена", robots: { index: false } };

const LINKS = [
  ["/#services", "Услуги", "Сайты, приложения, CRM, ИИ и Битрикс24"],
  ["/projects", "Проекты", "Что уже сделали и для кого"],
  ["/configurator", "Конфигуратор", "Соберите систему под свой бизнес"],
  ["/contacts", "Контакты", "Расскажите о задаче, ответим за день"],
];

export default function NotFound() {
  return (
    <>
      <header className="border-b-2 border-ink">
        <div className="container-x flex h-16 items-center justify-between">
          <Link href="/" className="font-display text-lg font-extrabold tracking-tight">Think<span className="text-accent">-</span>asta</Link>
          <Link href="/contacts" className="btn btn-dark btn-sm">Обсудить задачу</Link>
        </div>
      </header>
      <main className="pb-16 pt-6 sm:pt-10">
        <div className="container-x">
          <section className="nf-plate">
            <div className="nf-copy">
              <span className="chip">Ошибка 404</span>
              <h1 className="t-display mt-5">Такой страницы нет</h1>
              <p className="mt-4 max-w-md text-lg font-semibold">Ссылка устарела или в адресе опечатка. Мы бы завели на это задачу, но проще вернуться на главную.</p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link href="/" className="btn btn-dark">На главную<ArrowRight size={18} /></Link>
                <Link href="/configurator" className="btn btn-ghost">Собрать систему</Link>
              </div>
            </div>

            <div className="nf-card" aria-hidden>
              <div className="nf-card-top"><span className="nf-ava">?</span><div><b>Страница</b><span><MissingPath /></span></div></div>
              <div className="nf-card-tags"><span>Запрос с сайта</span><span className="nf-lost">Отказ</span></div>
              <div className="nf-card-foot"><span>только что</span><i>→</i></div>
            </div>

            <div className="nf-big" aria-hidden>4<span className="nf-zero">0</span>4</div>
          </section>

          <nav aria-label="Куда можно пойти" className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {LINKS.map(([h, t, d]) => (
              <Link key={h} href={h} className="nf-link">
                <span className="flex items-center justify-between font-display text-lg font-bold tracking-tight">{t}<ArrowUpRight size={20} /></span>
                <span className="mt-1 text-sm font-semibold text-ink-2">{d}</span>
              </Link>
            ))}
          </nav>
        </div>
      </main>
    </>
  );
}
