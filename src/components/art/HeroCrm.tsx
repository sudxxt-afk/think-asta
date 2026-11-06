'use client'
import { Bar, Chip, Stage, Text, Window, type Act } from '@/stageshow/kit'
import './art.css'

// The full CRM that opens over the hero plate: a lead arrives, goes into work, a deal is paid, revenue follows.
type S = { toast: boolean; fresh: boolean; moved: boolean; paid: boolean }
const initial: S = { toast: false, fresh: false, moved: false, paid: false }
const poster: S = { toast: false, fresh: false, moved: true, paid: true }

async function script(a: Act<S>) {
  await a.wait(700)
  await a.set({ toast: true })
  await a.wait(500)
  await a.set({ fresh: true })
  await a.wait(900)
  await a.set({ toast: false })
  await a.move('fresh')
  await a.wait(300)
  await a.click()
  await a.set({ fresh: false, moved: true })
  await a.wait(1100)
  await a.move('pay')
  await a.wait(300)
  await a.click()
  await a.set({ paid: true })
  await a.wait(3200)
  await a.set({ moved: false, paid: false })
  await a.wait(500)
}

function Deal({ a, b, hot, hide, target }: { a: string; b: string; hot?: boolean; hide?: boolean; target?: string }) {
  return <div className="art-deal" data-target={target} data-hot={hot || undefined} data-gone={hide || undefined}><b>{a}</b><span>{b}</span></div>
}

const W = 1100

export function HeroCrm({ aspect, paused }: { aspect: number; paused?: boolean }) {
  const H = Math.max(520, Math.round(W * aspect))
  return (
    <div className="art art-full">
      <Stage width={W} height={H} fill play={paused ? 'hover' : 'loop'} initial={initial} poster={poster} script={script} accent="#ff5a4e" cursor={{ at: { x: 760, y: 470 }, ripple: true }}>
        {(s) => (
          <>
            <div className="art-toast" data-hide={!s.toast || undefined} style={{ right: 40, top: 28 }}><i />Новая заявка с сайта</div>
            <Window title="Think-asta CRM" className="art-win" style={{ top: 64, left: 40, width: 1040, height: H }}>
              <div className="art-crm">
                <aside className="art-side">
                  {['Сделки', 'Клиенты', 'Задачи', 'Отчёты', 'Почта'].map((t, i) => (
                    <div key={t} className="art-nav-i" data-on={i === 0 || undefined}><Bar w={14} h={14} r={4} tone={i === 0 ? 4 : 2} /><span>{t}</span></div>
                  ))}
                </aside>
                <div className="art-main">
                  <div className="art-top">
                    <Text style={{ fontWeight: 800, fontSize: 20 }}>Воронка продаж</Text>
                    <div style={{ display: 'flex', gap: 8 }}><Chip>Июнь</Chip><Chip>Все менеджеры</Chip></div>
                    <div className="art-rev"><span>Оплачено за месяц</span><b>{s.paid ? '1 330 000 ₽' : '1 240 000 ₽'}</b></div>
                  </div>
                  <div className="art-cols4">
                    <div className="art-col">
                      <div className="art-colhead"><span>Новые</span><span>{s.fresh ? 4 : 3}</span></div>
                      <Deal target="fresh" a="Кофейня «Миндаль»" b="150 000 ₽" hot={s.fresh} hide={!s.fresh} />
                      <Deal a="ИП Орлов" b="45 000 ₽" />
                      <Deal a="ООО «Сфера»" b="320 000 ₽" />
                      <Bar w={90} h={46} r={8} tone={1} />
                    </div>
                    <div className="art-col">
                      <div className="art-colhead"><span>В работе</span><span>{s.moved ? 4 : 3}</span></div>
                      <Deal a="Кофейня «Миндаль»" b="150 000 ₽" hot={s.moved && !s.paid} hide={!s.moved} />
                      <Deal a="Студия «Лён»" b="86 000 ₽" />
                      <Deal a="ООО «Альфа»" b="120 000 ₽" />
                    </div>
                    <div className="art-col">
                      <div className="art-colhead"><span>КП отправлено</span><span>{s.paid ? 1 : 2}</span></div>
                      <div data-target="pay"><Deal a="ООО «Вектор»" b="90 000 ₽" hide={s.paid} hot={!s.paid && s.moved} /></div>
                      <Deal a="Мастерская «Дуб»" b="64 000 ₽" />
                    </div>
                    <div className="art-col">
                      <div className="art-colhead"><span>Оплачено</span><span>{s.paid ? 7 : 6}</span></div>
                      <Deal a="ООО «Вектор»" b="90 000 ₽" hot hide={!s.paid} />
                      <Deal a="Ателье «Нить»" b="210 000 ₽" />
                      <Deal a="Клиника «Лайт»" b="540 000 ₽" />
                    </div>
                  </div>
                </div>
              </div>
            </Window>
          </>
        )}
      </Stage>
    </div>
  )
}
