'use client'
import { Bar, Button, Chip, Phone, Row, Stage, Text, Window } from '@/stageshow/kit'
import './art.css'

const ACCENT = '#ff5a4e'
const W = 400
const H = 300

function Frame({ children }: { children: () => React.ReactNode }) {
  return (
    <div className="art">
      <Stage width={W} height={H} accent={ACCENT}>{children}</Stage>
    </div>
  )
}

function Site() {
  return (
    <Frame>
      {() => (
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
                <div style={{ marginTop: 6 }}><Button variant="primary">Рассчитать смету</Button></div>
              </div>
              <div className="art-img" />
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

function App() {
  return (
    <Frame>
      {() => (
        <Phone width={230} className="art-phone">
          <div className="art-list">
            <Text style={{ fontWeight: 800, fontSize: 20, margin: '8px 0 4px' }}>Мои заказы</Text>
            <Row pad={0} lead={<Bar w={30} h={30} r={8} tone={3} />} title={<Text>Заказ №2041</Text>} subtitle={<Text>В пути, 25 минут</Text>} />
            <Row pad={0} selected lead={<Bar w={30} h={30} r={8} tone={4} />} title={<Text>Заказ №2038</Text>} subtitle={<Text>Доставлен</Text>} />
            <Row pad={0} lead={<Bar w={30} h={30} r={8} tone={2} />} title={<Bar w={90} tone={3} />} subtitle={<Bar w={60} tone={2} />} />
            <Button variant="primary" size="large" style={{ marginTop: 6 }}>Повторить заказ</Button>
          </div>
        </Phone>
      )}
    </Frame>
  )
}

function Col({ title, n, deals, hot }: { title: string; n: number; deals: [string, string][]; hot?: boolean }) {
  return (
    <div className="art-col">
      <div className="art-colhead"><span>{title}</span><span>{n}</span></div>
      {deals.map(([a, b], i) => (
        <div key={i} className="art-deal" data-hot={hot && i === 0 ? '' : undefined}><b>{a}</b><span>{b}</span></div>
      ))}
      <Bar w={70} h={40} r={8} tone={1} />
    </div>
  )
}

function Crm() {
  return (
    <Frame>
      {() => (
        <Window title="Сделки" className="art-win">
          <div className="art-cols">
            <Col title="Новые" n={4} deals={[['ООО «Альфа»', '120 000 ₽'], ['ИП Орлов', '45 000 ₽']]} />
            <Col title="В работе" n={3} hot deals={[['Студия «Лён»', '86 000 ₽'], ['Кафе «Миндаль»', '60 000 ₽']]} />
            <Col title="Оплачено" n={6} deals={[['ООО «Вектор»', '210 000 ₽']]} />
          </div>
        </Window>
      )}
    </Frame>
  )
}

function Ai() {
  return (
    <Frame>
      {() => (
        <Window title="Новая заявка" className="art-win">
          <div className="art-pad">
            <div className="art-quote">«Здравствуйте, нужен сайт для кофейни, бюджет около 150 тысяч, хотим до середины июня»</div>
            <div className="art-nav"><Chip>Разобрано ИИ</Chip><Bar w={60} h={6} tone={2} /></div>
            <div className="art-fields">
              <div className="art-field"><span>Задача</span><b>Сайт для кофейни</b></div>
              <div className="art-field"><span>Бюджет</span><b>150 000 ₽</b></div>
              <div className="art-field"><span>Срок</span><b>до 15 июня</b></div>
            </div>
            <div><Button variant="primary">Передать менеджеру</Button></div>
          </div>
        </Window>
      )}
    </Frame>
  )
}

function Bitrix() {
  const rows: [string, number, string][] = [['Заявка', 100, '48'], ['Звонок', 72, '35'], ['КП', 46, '22'], ['Оплата', 24, '11']]
  return (
    <Frame>
      {() => (
        <Window title="Воронка продаж" className="art-win">
          <div className="art-pad" style={{ gap: 14 }}>
            <div className="art-nav"><Text style={{ fontWeight: 800, fontSize: 16 }}>Июнь</Text><Chip>Битрикс24</Chip></div>
            <div className="art-funnel">
              {rows.map(([name, w, n], i) => (
                <div key={name} className="art-step" data-dim={i === 3 ? undefined : undefined}>
                  <em>{name}</em><i style={{ width: `${w * 2.1}px` }} /><span>{n}</span>
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

function Auto() {
  return (
    <Frame>
      {() => (
        <Window title="Робот" className="art-win">
          <div className="art-flow">
            <div className="art-node"><Bar w={26} h={26} r={7} tone={3} /><div>Заявка с сайта<small>Форма на лендинге</small></div></div>
            <div className="art-link" />
            <div className="art-node" data-on><Bar w={26} h={26} r={7} tone={4} /><div>Сделка в Битрикс24<small>Создаётся сама</small></div></div>
            <div className="art-link" />
            <div className="art-node"><Bar w={26} h={26} r={7} tone={3} /><div>Задача менеджеру<small>Позвонить в течение часа</small></div></div>
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
