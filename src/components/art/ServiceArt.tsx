'use client'
import { useEffect, useRef, useState } from 'react'
import { Bar, Button, Chip, Phone, Row, Stage, Text, Window, type Act } from '@/stageshow/kit'
import './art.css'

const ACCENT = '#ff5a4e'
const W = 400
const H = 300

type FrameProps<S> = { initial: S; poster: S; script: (a: Act<S>) => Promise<void>; cursor?: boolean; children: (s: S) => React.ReactNode }

// Plays only when the card is hovered (mouse) or sits in the middle of the screen (touch); otherwise shows its finished frame.
function useRun() {
  const ref = useRef<HTMLDivElement>(null)
  const [run, setRun] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches
    if (fine) {
      const card = el.closest<HTMLElement>('article, a') ?? el
      const at = (e: PointerEvent) => {
        const r = card.getBoundingClientRect()
        card.style.setProperty('--x', `${e.clientX - r.left}px`)
        card.style.setProperty('--y', `${e.clientY - r.top}px`)
      }
      const on = (e: PointerEvent) => { at(e); setRun(true) }, off = (e: PointerEvent) => { at(e); setRun(false) }
      card.addEventListener('pointerenter', on)
      card.addEventListener('pointerleave', off)
      return () => { card.removeEventListener('pointerenter', on); card.removeEventListener('pointerleave', off) }
    }
    const io = new IntersectionObserver(([e]) => setRun(e.isIntersecting), { rootMargin: '-38% 0px -38% 0px' })
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return { ref, run }
}

function Frame<S extends object>({ initial, poster, script, cursor, children }: FrameProps<S>) {
  const { ref, run } = useRun()
  return (
    <div className="art" ref={ref}>
      <Stage width={W} height={H} accent={ACCENT} initial={initial} poster={poster} script={run ? script : undefined} cursor={cursor ? { at: { x: 330, y: 270 }, ripple: true, still: false } : undefined}>
        {children}
      </Stage>
    </div>
  )
}

// Site: the visitor asks for an estimate, the button confirms on itself.
function Site() {
  type S = { sent: boolean }
  const script = async (a: Act<S>) => {
    await a.wait(60)
    await a.move('go')
    await a.wait(200)
    await a.click()
    await a.set({ sent: true })
    await a.wait(2800)
    await a.set({ sent: false })
    await a.wait(600)
  }
  return (
    <Frame<S> initial={{ sent: false }} poster={{ sent: false }} script={script} cursor>
      {(s) => (
        <Window url="remont-pro.ru" className="art-win">
          <div className="art-pad">
            <div className="art-nav">
              <Text style={{ fontWeight: 800, fontSize: 14 }}>РемонтПро</Text>
              <div className="art-nav-links"><Bar w={34} h={6} tone={3} /><Bar w={40} h={6} tone={3} /><Bar w={30} h={6} tone={3} /></div>
              <Button size="small" variant="primary">Заказать</Button>
            </div>
            <div className="art-hero" style={{ marginTop: 10 }}>
              <div>
                <Text className="art-h" wrap>Ремонт квартир под ключ</Text>
                <Bar w={150} h={6} tone={2} />
                <Bar w={120} h={6} tone={2} />
                <div style={{ marginTop: 6 }} data-target="go"><Button variant="primary">{s.sent ? 'Смета придёт на почту' : 'Рассчитать смету'}</Button></div>
              </div>
              <div className="art-img" data-pulse={s.sent || undefined} />
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
              {[0, 1, 2].map((i) => <Bar key={i} w={110} h={46} r={8} tone={1} />)}
            </div>
          </div>
        </Window>
      )}
    </Frame>
  )
}

// App: repeat the order, a new row slides in at the top.
function App() {
  type S = { again: boolean }
  const script = async (a: Act<S>) => {
    await a.wait(60)
    await a.move('again')
    await a.wait(200)
    await a.click()
    await a.set({ again: true })
    await a.wait(2800)
    await a.set({ again: false })
    await a.wait(600)
  }
  return (
    <Frame<S> initial={{ again: false }} poster={{ again: false }} script={script} cursor>
      {(s) => (
        <Phone width={230} className="art-phone">
          <div className="art-list">
            <Text style={{ fontWeight: 800, fontSize: 20, margin: '8px 0 4px' }}>Мои заказы</Text>
            <div className="art-new" data-show={s.again || undefined}>
              <Row pad={0} selected lead={<Bar w={30} h={30} r={8} tone={4} />} title={<Text>Заказ №2042</Text>} subtitle={<Text>Принят, готовим</Text>} />
            </div>
            <Row pad={0} lead={<Bar w={30} h={30} r={8} tone={3} />} title={<Text>Заказ №2041</Text>} subtitle={<Text>В пути, 25 минут</Text>} />
            <Row pad={0} lead={<Bar w={30} h={30} r={8} tone={2} />} title={<Text>Заказ №2038</Text>} subtitle={<Text>Доставлен</Text>} />
            <div data-target="again"><Button variant="primary" size="large" style={{ marginTop: 6 }}>Повторить заказ</Button></div>
          </div>
        </Phone>
      )}
    </Frame>
  )
}

function Deal({ a, b, hot, hide }: { a: string; b: string; hot?: boolean; hide?: boolean }) {
  return <div className="art-deal" data-hot={hot || undefined} data-gone={hide || undefined}><b>{a}</b><span>{b}</span></div>
}

// CRM: a deal is paid and moves to the last column; counters follow.
function Crm() {
  type S = { paid: boolean }
  const script = async (a: Act<S>) => {
    await a.wait(60)
    await a.move('deal')
    await a.wait(200)
    await a.click()
    await a.set({ paid: true })
    await a.wait(2800)
    await a.set({ paid: false })
    await a.wait(600)
  }
  return (
    <Frame<S> initial={{ paid: false }} poster={{ paid: false }} script={script} cursor>
      {(s) => (
        <Window title="Сделки" className="art-win">
          <div className="art-cols">
            <div className="art-col">
              <div className="art-colhead"><span>Новые</span><span>4</span></div>
              <Deal a="ООО «Альфа»" b="120 000 ₽" />
              <Deal a="ИП Орлов" b="45 000 ₽" />
              <Bar w={70} h={40} r={8} tone={1} />
            </div>
            <div className="art-col">
              <div className="art-colhead"><span>В работе</span><span>{s.paid ? 2 : 3}</span></div>
              <div data-target="deal"><Deal a="Студия «Лён»" b="86 000 ₽" hot={!s.paid} hide={s.paid} /></div>
              <Deal a="Кафе «Миндаль»" b="60 000 ₽" />
            </div>
            <div className="art-col">
              <div className="art-colhead"><span>Оплачено</span><span>{s.paid ? 7 : 6}</span></div>
              <Deal a="Студия «Лён»" b="86 000 ₽" hot hide={!s.paid} />
              <Deal a="ООО «Вектор»" b="210 000 ₽" />
            </div>
          </div>
        </Window>
      )}
    </Frame>
  )
}

// AI: incoming mail and calls are read one by one, tagged and sent where they belong.
function Ai() {
  type S = { n: number }
  const items: { kind: string; who: string; text: string; tag: string; to: string }[] = [
    { kind: 'Письмо', who: 'Анна, кофейня «Миндаль»', text: 'Нужен сайт, бюджет около 150 тысяч', tag: 'Заявка', to: 'в CRM' },
    { kind: 'Звонок', who: '+7 912 ··· 41 08 · 2:14', text: 'Спросили, делаете ли приложения', tag: 'Вопрос', to: 'менеджеру' },
    { kind: 'Письмо', who: 'Рассылка «Дешёвые лиды»', text: 'Выгодное предложение только сегодня', tag: 'Спам', to: 'в архив' },
  ]
  const script = async (a: Act<S>) => {
    await a.wait(250)
    for (const n of [2, 3]) { await a.set({ n }); await a.wait(950) }
    await a.wait(2400)
    await a.set({ n: 1 })
    await a.wait(700)
  }
  return (
    <Frame<S> initial={{ n: 1 }} poster={{ n: 1 }} script={script}>
      {(s) => (
        <Window title="Входящие" className="art-win">
          <div className="art-pad" style={{ gap: 8 }}>
            {items.map((it, i) => (
              <div key={it.who} className="art-mail" data-done={s.n > i || undefined} data-spam={it.tag === 'Спам' || undefined}>
                <div className="art-mail-l"><small>{it.kind}</small><b>{it.who}</b><span>{it.text}</span></div>
                <div className="art-mail-r art-fade" data-on={s.n > i || undefined}><Chip>{it.tag}</Chip><small>{it.to}</small></div>
              </div>
            ))}
            <div className="art-nav" style={{ marginTop: 2 }}><Text style={{ fontSize: 12 }}>{`Разобрано: ${s.n} из 3`}</Text><Bar w={80} h={6} tone={2} /></div>
          </div>
        </Window>
      )}
    </Frame>
  )
}

// Bitrix24: the funnel bars grow stage by stage.
function Bitrix() {
  type S = { n: number }
  const rows: [string, number, string][] = [['Заявка', 100, '48'], ['Звонок', 72, '35'], ['КП', 46, '22'], ['Оплата', 24, '11']]
  const script = async (a: Act<S>) => {
    await a.wait(250)
    for (const n of [2, 3, 4]) { await a.set({ n }); await a.wait(550) }
    await a.wait(2600)
    await a.set({ n: 1 })
    await a.wait(700)
  }
  return (
    <Frame<S> initial={{ n: 1 }} poster={{ n: 1 }} script={script}>
      {(s) => (
        <Window title="Воронка продаж" className="art-win">
          <div className="art-pad" style={{ gap: 14 }}>
            <div className="art-nav"><Text style={{ fontWeight: 800, fontSize: 16 }}>Июнь</Text><Chip>Битрикс24</Chip></div>
            <div className="art-funnel">
              {rows.map(([name, w, n], i) => (
                <div key={name} className="art-step">
                  <em>{name}</em><i style={{ width: s.n > i ? `${w * 2.1}px` : 0 }} /><span className="art-fade" data-on={s.n > i || undefined}>{n}</span>
                </div>
              ))}
            </div>
            <Bar w={200} h={6} tone={2} />
          </div>
        </Window>
      )}
    </Frame>
  )
}

// Automation: the trigger fires, the deal appears, the task is set.
function Auto() {
  type S = { step: number }
  const script = async (a: Act<S>) => {
    await a.wait(250)
    for (const step of [2, 3]) { await a.set({ step }); await a.wait(900) }
    await a.wait(1800)
    await a.set({ step: 1 })
    await a.wait(700)
  }
  const nodes: [string, string][] = [['Заявка с сайта', 'Форма на лендинге'], ['Сделка в Битрикс24', 'Создаётся сама'], ['Задача менеджеру', 'Позвонить в течение часа']]
  return (
    <Frame<S> initial={{ step: 1 }} poster={{ step: 1 }} script={script}>
      {(s) => (
        <Window title="Робот" className="art-win">
          <div className="art-flow">
            {nodes.map(([a, b], i) => (
              <div key={a} style={{ display: 'contents' }}>
                {i > 0 && <div className="art-link" data-on={s.step >= i + 1 || undefined} />}
                <div className="art-node" data-on={s.step >= i + 1 || undefined}><Bar w={26} h={26} r={7} tone={s.step >= i + 1 ? 4 : 3} /><div>{a}<small>{b}</small></div></div>
              </div>
            ))}
          </div>
        </Window>
      )}
    </Frame>
  )
}

const MAP: Record<string, () => React.ReactNode> = { site: Site, app: App, crm: Crm, ai: Ai, bitrix: Bitrix, auto: Auto }
const BY_SERVICE: Record<string, ArtKind> = { web: 'site', mobile: 'app', crm: 'crm', ai: 'ai', bitrix: 'auto' }
const BY_CATEGORY: [RegExp, ArtKind][] = [[/моб|прилож/i, 'app'], [/битрикс|bitrix/i, 'bitrix'], [/crm|срм/i, 'crm'], [/ии|ai|нейро/i, 'ai'], [/автомат/i, 'auto']]
export type ArtKind = keyof typeof MAP
const artForService = (key: string): ArtKind => BY_SERVICE[key] ?? 'site'
const artForCategory = (c: string): ArtKind => BY_CATEGORY.find(([r]) => r.test(c))?.[1] ?? 'site'

export function ServiceArt({ service, category }: { service?: string; category?: string }) {
  const C = MAP[service ? artForService(service) : artForCategory(category ?? '')]
  return <C />
}
