'use client'
import { Bar, Stage, Window, type Act } from '@/stageshow/kit'
import './art.css'

// A lead from the site lands in the CRM, the manager takes it into work.
type S = { toast: boolean; fresh: boolean; moved: boolean }
const initial: S = { toast: false, fresh: false, moved: false }
const poster: S = { toast: false, fresh: false, moved: true }

async function script(a: Act<S>) {
  await a.wait(900)
  await a.set({ toast: true })
  await a.wait(500)
  await a.set({ fresh: true })
  await a.wait(1100)
  await a.set({ toast: false })
  await a.move('fresh')
  await a.wait(350)
  await a.click()
  await a.set({ fresh: false, moved: true })
  await a.wait(2600)
  await a.set({ moved: false })
  await a.wait(500)
}

export function HeroDemo() {
  return (
    <div className="art art-hero-stage">
      <Stage width={440} height={300} initial={initial} poster={poster} script={script} accent="#ff5a4e" cursor={{ at: { x: 330, y: 250 }, ripple: true }}>
        {(s) => (
          <>
            <div className="art-toast" data-hide={!s.toast || undefined}><i />Новая заявка с сайта</div>
            <Window title="Сделки" className="art-win" style={{ top: 12, left: 12, width: 520, height: 340 }}>
              <div className="art-cols" style={{ gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' }}>
                <div className="art-col">
                  <div className="art-colhead"><span>Новые</span><span>{s.fresh ? 3 : 2}</span></div>
                  <div className="art-deal" data-target="fresh" data-hot={s.fresh || undefined} style={{ opacity: s.fresh ? 1 : 0, transform: s.fresh ? 'none' : 'translateY(-10px)', position: s.fresh || s.moved ? undefined : 'absolute' }}>
                    <b>Кофейня «Миндаль»</b><span>150 000 ₽</span>
                  </div>
                  <div className="art-deal"><b>ИП Орлов</b><span>45 000 ₽</span></div>
                  <Bar w={70} h={40} r={8} tone={1} />
                </div>
                <div className="art-col">
                  <div className="art-colhead"><span>В работе</span><span>{s.moved ? 3 : 2}</span></div>
                  <div className="art-deal" data-hot={s.moved || undefined} style={{ opacity: s.moved ? 1 : 0, transform: s.moved ? 'none' : 'translateY(-10px)', display: s.moved ? undefined : 'none' }}>
                    <b>Кофейня «Миндаль»</b><span>150 000 ₽</span>
                  </div>
                  <div className="art-deal"><b>Студия «Лён»</b><span>86 000 ₽</span></div>
                  <div className="art-deal"><b>ООО «Альфа»</b><span>120 000 ₽</span></div>
                </div>
                <div className="art-col">
                  <div className="art-colhead"><span>Оплачено</span><span>6</span></div>
                  <div className="art-deal"><b>ООО «Вектор»</b><span>210 000 ₽</span></div>
                  <Bar w={80} h={40} r={8} tone={1} />
                </div>
              </div>
            </Window>
          </>
        )}
      </Stage>
    </div>
  )
}
