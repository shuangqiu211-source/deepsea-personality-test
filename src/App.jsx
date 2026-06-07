import React, { useMemo, useState } from "react";
import {
  Anchor,
  ChevronDown,
  Copy,
  RotateCcw,
  Sparkles,
  Waves,
  Compass,
  HeartPulse,
  BriefcaseBusiness,
  Share2
} from "lucide-react";
import {
  questions,
  sections,
  scaleText,
  metrics,
  careerNames,
  personalityNames,
  typeInfo,
  typeCards
} from "./data.js";

function normalize(v, min, max) {
  return Math.max(0, Math.min(100, Math.round(((v - min) / (max - min)) * 100)));
}

function label(k) {
  return metrics[k] || k;
}

function decideType(p, c, d, mood) {
  if (mood >= 20) return "深海复氧者";
  if (c.Investigative >= 70 && p.O >= 60 && d.mastery >= 65) return "鲸歌策展师";
  if (p.C >= 72 && c.Conventional >= 65 && d.stability >= 60) return "深潜执行官";
  if (p.A >= 70 && c.Social >= 65) return "海葵倾听者";
  if (p.E >= 70 && (c.Enterprising >= 65 || d.influence >= 65)) return "浪潮发光体";
  if (c.Art >= 70 && p.O >= 65) return "珊瑚灵感家";
  if (c.Investigative >= 68 && p.E < 55) return "蓝洞研究员";
  if (c.Enterprising >= 70 && d.autonomy >= 65) return "海流破局者";
  if (p.C >= 65 && p.A >= 60 && c.Conventional >= 58) return "潮汐组织者";
  if (d.risk >= 70 && (c.Conventional >= 55 || c.Investigative >= 55)) return "灯塔预警师";
  return "鲸歌策展师";
}

function calculateResult(answers) {
  const raw = {};
  Object.keys(metrics).forEach((k) => (raw[k] = 0));
  let moodSum = 0;
  let crisisScore = 0;

  questions.forEach((q, i) => {
    const val = answers[i];
    if (!val) return;

    if (q.moodItem) {
      moodSum += val - 1;
      if (q.crisis) crisisScore = val;
    }

    Object.entries(q.s).forEach(([k, weight]) => {
      let score = val;
      let w = weight;
      if (w < 0) {
        score = 6 - val;
        w = Math.abs(w);
      }
      raw[k] = (raw[k] || 0) + score * w;
    });
  });

  const personality = {};
  personalityNames.forEach((k) => (personality[k] = normalize(raw[k], 3, 20)));

  const career = {};
  careerNames.forEach((k) => (career[k] = normalize(raw[k], 2, 22)));

  const drivers = {
    mastery: normalize(raw.mastery, 2, 24),
    autonomy: normalize(raw.autonomy, 2, 20),
    influence: normalize(raw.influence, 1, 18),
    stability: normalize(raw.stability, 1, 18),
    meaning: normalize(raw.meaning, 1, 18),
    risk: normalize(raw.risk, 1, 18)
  };

  const topCareer = Object.entries(career)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map((x) => x[0]);

  const topDriver = Object.entries(drivers).sort((a, b) => b[1] - a[1])[0][0];
  const type = decideType(personality, career, drivers, moodSum);

  return { type, personality, career, drivers, topCareer, topDriver, moodSum, crisisScore };
}

function BubbleField() {
  return (
    <div className="bubble-field" aria-hidden="true">
      {Array.from({ length: 26 }).map((_, i) => (
        <i key={i} style={{ "--i": i }} />
      ))}
    </div>
  );
}

function SeaCreatureLayer() {
  return (
    <div className="creature-layer" aria-hidden="true">
      <div className="creature whale">🐋</div>
      <div className="creature octopus">🐙</div>
      <div className="creature jelly">🪼</div>
      <div className="creature shell">🐚</div>
      <div className="creature fish">🐠</div>
      <div className="creature turtle">🐢</div>
    </div>
  );
}

function StatPill({ icon, title, text }) {
  return (
    <div className="stat-pill">
      <div className="stat-icon">{icon}</div>
      <div>
        <b>{title}</b>
        <span>{text}</span>
      </div>
    </div>
  );
}

function ProgressBar({ value }) {
  return (
    <div className="progress-shell">
      <div className="progress-top">
        <span>已完成 {value} / {questions.length} 题</span>
        <span>{Math.round((value / questions.length) * 100)}%</span>
      </div>
      <div className="progress-bar">
        <i style={{ width: `${Math.round((value / questions.length) * 100)}%` }} />
      </div>
    </div>
  );
}

function Meter({ name, value }) {
  return (
    <div className="meter">
      <div className="meter-top">
        <span>{label(name)}</span>
        <span>{value}</span>
      </div>
      <div className="meter-track">
        <i style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function MoodBox({ moodSum, crisisScore }) {
  let tone = "low";
  let title = "海面平稳";
  let msg = "近期情绪压力不算突出，整体状态比较稳。继续保持规律作息、睡眠和一点点运动就很好。";

  if (crisisScore >= 3) {
    tone = "high";
    title = "低氧警报";
    msg = "你在“伤害自己 / 不想活”相关题目上选择了较高频率。请不要一个人扛着，尽快联系可信任的人，并寻求专业心理支持。";
  } else if (moodSum <= 7) {
    tone = "low";
  } else if (moodSum <= 15) {
    tone = "mid";
    title = "海流有点乱";
    msg = "你最近可能有点累，也有点低落。现在最需要的不是硬冲，而是先稳住节奏，看看自己的睡眠、情绪和压力源。";
  } else {
    tone = "high";
    title = "低氧海域";
    msg = "你近期情绪消耗比较明显。这个结果不是诊断，但如果低落、失眠、无望感持续两周以上，建议尽快寻求专业支持。";
  }

  return (
    <div className={`mood-box ${tone}`}>
      <b>{title}</b>
      <p>
        情绪风险分：{moodSum}/32。{msg}
      </p>
    </div>
  );
}

export default function App() {
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);

  const answeredCount = Object.keys(answers).length;
  const completed = answeredCount === questions.length;

  const resultInfo = result ? typeInfo[result.type] : null;

  const shareText = useMemo(() => {
    if (!result || !resultInfo) {
      return `最近测了一个“深海人格测试”🐋

它不只是告诉你像哪种人格，还会一起看适合行业、情绪状态和成长方向。

如果你最近也在想“我到底适合什么”，可以来测一测。`;
    }
    return `最近测了一个“深海人格测试”🐋

我测出来的结果是【${result.type}】。
${resultInfo.oneLine}
${resultInfo.plain}

它不只是讲性格，还会一起看适合行业、情绪状态和成长方向。感觉还挺准的。`;
  }, [result, resultInfo]);

  function updateAnswer(index, value) {
    setAnswers((prev) => ({ ...prev, [index]: value }));
  }

  function submit() {
    if (!completed) {
      alert(`还有 ${questions.length - answeredCount} 道题没有完成，先做完再看结果哦。`);
      return;
    }

    const next = calculateResult(answers);
    setResult(next);
    setTimeout(() => {
      document.getElementById("result")?.scrollIntoView({ behavior: "smooth" });
    }, 80);
  }

  function reset() {
    setAnswers({});
    setResult(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function randomDemo() {
    const demo = {};
    questions.forEach((_, i) => {
      demo[i] = Math.floor(Math.random() * 5) + 1;
    });
    setAnswers(demo);
  }

  async function copyShareText() {
    try {
      await navigator.clipboard.writeText(shareText);
      alert("已复制，可以直接粘贴发布。");
    } catch {
      alert("复制失败，请手动选择文本复制。");
    }
  }

  return (
    <main>
      <BubbleField />

      <nav className="topbar">
        <div className="topbar-inner">
          <a className="brand" href="#home">
            BLUE ABYSS
          </a>
          <div className="navlinks">
            <a href="#types">10种类型</a>
            <a href="#quiz">开始测试</a>
            <a href="#result">结果页</a>
          </div>
        </div>
      </nav>

      <section id="home" className="cover-screen">
        <img className="cover-image" src={`${import.meta.env.BASE_URL}cover.png`} alt="深海人格测试封面" />
        <div className="cover-bottom-actions">
          <a className="btn primary" href="#quiz">
            开始测试 <ChevronDown size={18} />
          </a>
          <a className="btn secondary" href="#types">
            先看 10 种类型
          </a>
        </div>
      </section>

      <section className="section overview">
        <div className="section-head">
          <h2>做完你会看到什么</h2>
          <p>不是空泛贴标签，而是更具体地看见自己。</p>
        </div>
        <div className="overview-grid">
          <StatPill icon={<Waves size={20} />} title="你像哪种深海生物" text="每种性格对应一种海洋意象，直观又好记。" />
          <StatPill icon={<BriefcaseBusiness size={20} />} title="你适合去混的海域" text="判断更适合研究、创作、表达、助人还是管理。" />
          <StatPill icon={<HeartPulse size={20} />} title="你最近的状态" text="看看你现在是海面平稳，还是有点低氧。" />
          <StatPill icon={<Compass size={20} />} title="下一步怎么发力" text="给你一个当下最值得用力的方向。" />
        </div>
      </section>

      <section id="types" className="section">
        <div className="section-head">
          <h2>10 种深海人格类型</h2>
          <p>看名字就有画面感，测完更容易记住自己。</p>
        </div>

        <div className="types-grid">
          {typeCards.map(([name, desc]) => {
            const info = typeInfo[name];
            return (
              <article className="type-card" key={name}>
                <div className="type-icon">{info.emoji}</div>
                <div>
                  <h3>{name}</h3>
                  <p>{desc}</p>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section id="quiz" className="section quiz-shell">
        <div className="section-head">
          <h2>开始测试</h2>
          <p>按第一反应选就行，全程大概 8–10 分钟。</p>
        </div>

        <div className="scale-row">
          {scaleText.map((s, i) => (
            <div key={s}>
              <b>{i + 1}</b>
              <span>{s}</span>
            </div>
          ))}
        </div>

        <ProgressBar value={answeredCount} />

        {Object.entries(sections).map(([sec, section]) => (
          <div className="question-section" key={sec}>
            <div className="question-section-head">
              <h3>{section.title}</h3>
              <p>{section.desc}</p>
            </div>

            {questions.map((q, index) => {
              if (String(q.sec) !== String(sec)) return null;
              return (
                <article className="question-card" key={q.t}>
                  <div className="q-title">
                    <span>{index + 1}</span>
                    {q.t}
                  </div>
                  <div className="options">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <button
                        type="button"
                        key={value}
                        className={answers[index] === value ? "active" : ""}
                        onClick={() => updateAnswer(index, value)}
                      >
                        <b>{value}</b>
                        <small>{scaleText[value - 1]}</small>
                      </button>
                    ))}
                  </div>
                </article>
              );
            })}
          </div>
        ))}

        <div className="floating-actions">
          <button className="btn white" onClick={randomDemo}>
            随机体验
          </button>
          <button className="btn ghost" onClick={reset}>
            <RotateCcw size={16} /> 清空重做
          </button>
          <button className="btn primary" onClick={submit}>
            生成我的结果
          </button>
        </div>
      </section>

      <section id="result" className={`section result ${result ? "show" : ""}`}>
        {result && resultInfo ? (
          <>
            <div className="result-hero">
              <div className="result-main">
                <div className="eyebrow">
                  <Anchor size={16} /> YOUR DEEP SEA PROFILE
                </div>
                <div className="result-name">
                  <span>{resultInfo.emoji}</span>
                  <h2>{result.type}</h2>
                </div>
                <p>{resultInfo.oneLine}</p>
                <p>{resultInfo.desc}</p>
              </div>

              <div className="result-stats">
                <div>
                  <span>主导职业兴趣</span>
                  <b>{result.topCareer.map(label).join(" + ")}</b>
                </div>
                <div>
                  <span>主导驱动力</span>
                  <b>{label(result.topDriver)}</b>
                </div>
                <div>
                  <span>情绪风险分</span>
                  <b>{result.moodSum}/32</b>
                </div>
                <div>
                  <span>建议努力重点</span>
                  <b>{resultInfo.focus}</b>
                </div>
              </div>
            </div>

            <div className="result-grid">
              <article className="result-card featured">
                <h3>你的结果说明</h3>
                <p>
                  <strong>一句话看你：</strong>
                  {resultInfo.oneLine}
                </p>
                <p>
                  <strong>说白了：</strong>
                  {resultInfo.plain}
                </p>
                <p>
                  <strong>你的组合：</strong>
                  主导职业兴趣是「{result.topCareer.map(label).join(" + ")}」，主导驱动力是「{label(result.topDriver)}
                  」。这意味着你更适合去能发挥天赋、又能越做越强的地方发展。
                </p>
                <div className="tag-row">
                  {[result.type, ...result.topCareer.map(label), label(result.topDriver)].map((x) => (
                    <span key={x}>{x}</span>
                  ))}
                </div>
              </article>

              <article className="result-card">
                <h3>你适合去混的海域</h3>
                <p>{resultInfo.ind}</p>
                <p className="note">
                  先别急着一次押满，可以先看岗位、做小作品、聊从业者，试过再决定要不要长期深潜。
                </p>
              </article>

              <article className="result-card">
                <h3>人格五维</h3>
                {personalityNames.map((k) => (
                  <Meter name={k} value={result.personality[k]} key={k} />
                ))}
              </article>

              <article className="result-card">
                <h3>职业兴趣分布</h3>
                {careerNames.map((k) => (
                  <Meter name={k} value={result.career[k]} key={k} />
                ))}
              </article>

              <article className="result-card">
                <h3>你最近的海域状态</h3>
                <MoodBox moodSum={result.moodSum} crisisScore={result.crisisScore} />
              </article>

              <article className="result-card">
                <h3>你现在最该做的事</h3>
                <p>{resultInfo.grow}</p>
              </article>
            </div>

            <div className="share-zone">
              <article className="share-card">
                <div className="share-top">
                  <span>DEEP SEA PERSONALITY</span>
                  <Share2 size={18} />
                </div>
                <h3>
                  {resultInfo.emoji} {result.type}
                </h3>
                <p>{resultInfo.oneLine}</p>
                <div className="tag-row">
                  {[result.type, ...result.topCareer.map(label), label(result.topDriver)].slice(0, 4).map((x) => (
                    <span key={x}>{x}</span>
                  ))}
                </div>
              </article>

              <article className="copy-card">
                <h3>发布文案</h3>
                <p>做完测试后，这里会自动生成一条带上你测试类型的分享文案。</p>
                <button className="btn primary" onClick={copyShareText}>
                  <Copy size={16} /> 复制发布文案
                </button>
                <pre>{shareText}</pre>
              </article>
            </div>
          </>
        ) : (
          <div className="empty-result">
            <h2>结果会在这里出现</h2>
            <p>完成 50 道题后，你会看到自己的深海人格档案。</p>
          </div>
        )}
      </section>
    </main>
  );
}
