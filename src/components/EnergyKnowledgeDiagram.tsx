import { useId } from 'react'
import type { EnergyDiagramKind } from '../models/energyKnowledge'

export function EnergyKnowledgeDiagram({
  kind,
  caption,
}: {
  kind: EnergyDiagramKind
  caption: string
}) {
  const uid = useId()
  const arrowUrl = `url(#${uid}-arrow)`
  const warmArrowUrl = `url(#${uid}-arrow-warm)`

  return (
    <svg
      className="energy-diagram-svg"
      viewBox="0 0 640 280"
      role="img"
      aria-label={caption}
    >
      <defs>
        <marker
          id={`${uid}-arrow`}
          viewBox="0 0 10 10"
          refX="8"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M 0 1.5 L 9 5 L 0 8.5 z" fill="#0284c7" />
        </marker>
        <marker
          id={`${uid}-arrow-warm`}
          viewBox="0 0 10 10"
          refX="8"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M 0 1.5 L 9 5 L 0 8.5 z" fill="#ea580c" />
        </marker>
      </defs>
      <rect x="0" y="0" width="640" height="280" rx="10" fill="#f8fbfd" />
      {renderDiagram(kind, arrowUrl, warmArrowUrl)}
    </svg>
  )
}

function renderDiagram(
  kind: EnergyDiagramKind,
  arrowUrl: string,
  warmArrowUrl: string,
) {
  switch (kind) {
    case 'fluid-bernoulli-pipe':
      return (
        <>
          <text x="20" y="26" fontSize="13" fontWeight="700" fill="#0d4658">
            EGL (总水头线) 与 HGL (静压水头线)
          </text>
          <line x1="60" y1="54" x2="580" y2="68" stroke="#ea580c" strokeWidth="2.2" strokeDasharray="6 4" />
          <text x="584" y="64" fontSize="11" fontWeight="700" fill="#ea580c">EGL</text>
          <path d="M 60 106 Q 210 106 310 144 T 580 118" fill="none" stroke="#0284c7" strokeWidth="2.2" />
          <text x="584" y="120" fontSize="11" fontWeight="700" fill="#0284c7">HGL</text>

          <path
            d="M 60 140 L 180 140 C 230 140 250 175 310 175 C 370 175 390 145 450 145 L 580 145 L 580 235 L 450 235 C 390 235 370 212 310 212 C 250 212 230 245 180 245 L 60 245 Z"
            fill="#dbeafe"
            stroke="#145f77"
            strokeWidth="2.4"
          />
          <line x1="120" y1="106" x2="120" y2="192" stroke="#0284c7" strokeWidth="1.5" strokeDasharray="3 3" />
          <line x1="310" y1="144" x2="310" y2="193" stroke="#0284c7" strokeWidth="1.5" strokeDasharray="3 3" />
          <line x1="510" y1="118" x2="510" y2="190" stroke="#0284c7" strokeWidth="1.5" strokeDasharray="3 3" />

          <line x1="80" y1="192" x2="155" y2="192" stroke="#0284c7" strokeWidth="2.4" markerEnd={arrowUrl} />
          <line x1="270" y1="193" x2="352" y2="193" stroke="#ea580c" strokeWidth="2.8" markerEnd={warmArrowUrl} />
          <line x1="470" y1="190" x2="545" y2="190" stroke="#0284c7" strokeWidth="2.4" markerEnd={arrowUrl} />

          <text x="88" y="264" fontSize="12" fill="#1e293b">截面 1: A₁ 大, v₁ 慢, p₁ 高</text>
          <text x="260" y="264" fontSize="12" fontWeight="700" fill="#c2410c">喉部: A₂ 小, v₂↑, p₂↓</text>
          <text x="456" y="264" fontSize="12" fill="#1e293b">截面 3: 扩压静压部分恢复</text>
        </>
      )

    case 'fluid-ns-control-volume':
      return (
        <>
          <text x="20" y="26" fontSize="13" fontWeight="700" fill="#0d4658">
            微元流体控制体受力分析 (dx · dy · dz)
          </text>
          <rect x="230" y="85" width="180" height="110" rx="4" fill="#e0f2fe" stroke="#0369a1" strokeWidth="2.2" />
          <text x="285" y="142" fontSize="13" fontWeight="700" fill="#0f172a">ρ dx dy dz</text>
          <line x1="150" y1="140" x2="225" y2="140" stroke="#0284c7" strokeWidth="2.5" markerEnd={arrowUrl} />
          <text x="115" y="132" fontSize="12" fontWeight="700" fill="#0369a1">p dy dz</text>
          <line x1="490" y1="140" x2="415" y2="140" stroke="#ea580c" strokeWidth="2.5" markerEnd={warmArrowUrl} />
          <text x="422" y="130" fontSize="12" fontWeight="700" fill="#c2410c">(p + ∂p/∂x·dx) dy dz</text>
          <line x1="255" y1="72" x2="385" y2="72" stroke="#16a34a" strokeWidth="2.2" markerEnd={arrowUrl} />
          <text x="242" y="60" fontSize="12" fontWeight="700" fill="#15803d">切应力 τ + (∂τ/∂y)dy (粘性扩散)</text>
          <line x1="385" y1="208" x2="255" y2="208" stroke="#16a34a" strokeWidth="2.2" markerEnd={arrowUrl} />
          <text x="288" y="226" fontSize="12" fill="#15803d">下表面粘性阻力 τ</text>
          <line x1="320" y1="155" x2="320" y2="245" stroke="#7c3aed" strokeWidth="2.2" markerEnd={arrowUrl} />
          <text x="330" y="252" fontSize="12" fontWeight="700" fill="#6d28d9">体积力 ρg (重力/浮力)</text>
        </>
      )

    case 'fluid-boundary-layer':
      return (
        <>
          <text x="20" y="26" fontSize="13" fontWeight="700" fill="#0d4658">
            平板边界层发展转捩与湍流近壁 y+ 分层区
          </text>
          <line x1="25" y1="110" x2="80" y2="110" stroke="#0284c7" strokeWidth="2" markerEnd={arrowUrl} />
          <line x1="25" y1="155" x2="80" y2="155" stroke="#0284c7" strokeWidth="2" markerEnd={arrowUrl} />
          <text x="24" y="95" fontSize="12" fontWeight="700" fill="#0369a1">主流 U∞</text>
          <line x1="95" y1="220" x2="410" y2="220" stroke="#334155" strokeWidth="4" />
          <path d="M 95 220 Q 170 185 225 182 Q 260 155 410 112" fill="none" stroke="#ea580c" strokeWidth="2.4" strokeDasharray="5 3" />
          <path d="M 95 220 Q 170 185 225 182 L 225 220 Z" fill="#dbeafe" opacity="0.65" />
          <path d="M 225 182 Q 260 155 410 112 L 410 220 L 225 220 Z" fill="#fed7aa" opacity="0.55" />
          <text x="125" y="210" fontSize="11" fontWeight="700" fill="#1d4ed8">层流区</text>
          <text x="230" y="210" fontSize="11" fontWeight="700" fill="#9a3412">转捩与湍流边界层 δ(x)</text>
          <line x1="215" y1="220" x2="215" y2="245" stroke="#64748b" strokeWidth="1.5" />
          <text x="195" y="260" fontSize="11" fill="#475569">Re_cr 转捩</text>

          <rect x="440" y="45" width="180" height="205" rx="8" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.5" />
          <text x="454" y="68" fontSize="12" fontWeight="700" fill="#0f172a">近壁对数律分层 (y+)</text>
          <line x1="468" y1="226" x2="600" y2="226" stroke="#475569" strokeWidth="1.5" />
          <line x1="468" y1="84" x2="468" y2="226" stroke="#475569" strokeWidth="1.5" />
          <rect x="468" y="190" width="128" height="36" fill="#dcfce7" opacity="0.7" />
          <rect x="468" y="156" width="128" height="34" fill="#fef3c7" opacity="0.75" />
          <rect x="468" y="96" width="128" height="60" fill="#e0f2fe" opacity="0.7" />
          <path d="M 468 226 C 500 202 528 164 590 106" fill="none" stroke="#0f172a" strokeWidth="2.4" />
          <text x="476" y="212" fontSize="10.5" fontWeight="700" fill="#166534">粘性底层 y+ &lt; 5</text>
          <text x="476" y="177" fontSize="10.5" fontWeight="700" fill="#b45309">缓冲层 5~30 (避开)</text>
          <text x="476" y="128" fontSize="10.5" fontWeight="700" fill="#0369a1">对数律 30~300</text>
        </>
      )

    case 'fluid-external-vortex':
      return (
        <>
          <text x="20" y="24" fontSize="13" fontWeight="700" fill="#0d4658">
            圆柱绕流边界层分离与卡门涡街 (左) 与机翼升力压差机理 (右)
          </text>
          {/* Left: cylinder & Kármán vortex street */}
          <rect x="20" y="42" width="335" height="218" rx="8" fill="#ffffff" stroke="#cbd5e1" />
          <line x1="34" y1="128" x2="72" y2="128" stroke="#0284c7" strokeWidth="2.2" markerEnd={arrowUrl} />
          <line x1="34" y1="176" x2="72" y2="176" stroke="#0284c7" strokeWidth="2.2" markerEnd={arrowUrl} />
          <text x="32" y="110" fontSize="11.5" fontWeight="700" fill="#0369a1">来流 U∞</text>
          <circle cx="122" cy="152" r="24" fill="#cbd5e1" stroke="#334155" strokeWidth="2.2" />
          <text x="111" y="156" fontSize="11" fontWeight="700" fill="#0f172a">D</text>
          {/* Alternating vortices */}
          <path d="M 142 134 C 175 112 200 132 192 146 C 185 156 170 144 180 136" fill="none" stroke="#ea580c" strokeWidth="2" />
          <path d="M 142 170 C 195 196 238 176 228 160 C 220 150 206 164 216 172" fill="none" stroke="#0284c7" strokeWidth="2" />
          <path d="M 210 134 C 245 112 274 132 266 146 C 258 156 244 144 254 136" fill="none" stroke="#ea580c" strokeWidth="2" />
          <path d="M 248 170 C 288 194 316 176 308 160 C 300 150 286 164 296 172" fill="none" stroke="#0284c7" strokeWidth="2" />
          <text x="164" y="220" fontSize="11" fontWeight="700" fill="#c2410c">交替脱落涡街 f = St·U/D</text>
          <text x="164" y="242" fontSize="10.5" fill="#475569">诱导周期横向交变升力 (VIV)</text>

          {/* Right: Airfoil lift */}
          <rect x="370" y="42" width="250" height="218" rx="8" fill="#ffffff" stroke="#cbd5e1" />
          <text x="386" y="64" fontSize="11.5" fontWeight="700" fill="#0369a1">上表面加速低压 (p↓)</text>
          <path d="M 412 162 C 435 118 520 124 585 154 C 520 164 445 174 412 162 Z" fill="#dbeafe" stroke="#1e3a8a" strokeWidth="2" />
          <line x1="490" y1="138" x2="490" y2="78" stroke="#16a34a" strokeWidth="2.8" markerEnd={arrowUrl} />
          <text x="500" y="96" fontSize="12" fontWeight="700" fill="#15803d">升力 F_L</text>
          <line x1="510" y1="160" x2="578" y2="160" stroke="#ea580c" strokeWidth="2.4" markerEnd={warmArrowUrl} />
          <text x="546" y="182" fontSize="11" fontWeight="700" fill="#c2410c">阻力 F_D</text>
          <text x="415" y="218" fontSize="11" fill="#475569">下表面受阻相对高压 (p↑)</text>
          <text x="415" y="240" fontSize="10.5" fill="#9a3412">攻角过大 → 失速分离 (Stall)</text>
        </>
      )

    case 'fluid-pump-curve':
      return (
        <>
          <text x="20" y="24" fontSize="13" fontWeight="700" fill="#0d4658">
            离心泵 H-Q 性能曲线、管网阻力交点与变频降速节能 (n₁ → n₂)
          </text>
          <line x1="90" y1="238" x2="550" y2="238" stroke="#334155" strokeWidth="2" markerEnd={arrowUrl} />
          <line x1="90" y1="238" x2="90" y2="46" stroke="#334155" strokeWidth="2" markerEnd={arrowUrl} />
          <text x="556" y="242" fontSize="12" fontWeight="700" fill="#0f172a">流量 Q</text>
          <text x="56" y="54" fontSize="12" fontWeight="700" fill="#0f172a">扬程 H</text>
          {/* Pump curves */}
          <path d="M 90 76 Q 290 78 460 198" fill="none" stroke="#0284c7" strokeWidth="2.8" />
          <text x="412" y="148" fontSize="11.5" fontWeight="700" fill="#0369a1">额定转速 n₁</text>
          <path d="M 90 124 Q 245 128 380 218" fill="none" stroke="#16a34a" strokeWidth="2.6" />
          <text x="155" y="156" fontSize="11.5" fontWeight="700" fill="#15803d">变频降速 n₂</text>
          {/* System curves */}
          <path d="M 90 238 Q 250 220 420 72" fill="none" stroke="#ea580c" strokeWidth="2.4" />
          <text x="424" y="76" fontSize="11.5" fontWeight="700" fill="#c2410c">管网阻抗 H_sys = S·Q²</text>
          <path d="M 90 238 Q 200 185 305 64" fill="none" stroke="#94a3b8" strokeWidth="1.8" strokeDasharray="5 3" />
          <text x="275" y="58" fontSize="10.5" fill="#64748b">关阀节流虚线 (浪费)</text>
          {/* Operating points */}
          <circle cx="332" cy="134" r="5" fill="#0284c7" />
          <text x="342" y="132" fontSize="12" fontWeight="700" fill="#0369a1">A₁ (全速点)</text>
          <circle cx="255" cy="176" r="5" fill="#16a34a" />
          <text x="266" y="190" fontSize="12" fontWeight="700" fill="#15803d">A₂ (P ∝ n³ 大幅省电)</text>
        </>
      )

    case 'thermo-pv-processes':
      return (
        <>
          <text x="20" y="26" fontSize="13" fontWeight="700" fill="#0d4658">
            p-v 图上四大典型热力过程陡缓对比 (n 越大曲线越陡)
          </text>
          <line x1="90" y1="238" x2="550" y2="238" stroke="#334155" strokeWidth="2" markerEnd={arrowUrl} />
          <line x1="90" y1="238" x2="90" y2="42" stroke="#334155" strokeWidth="2" markerEnd={arrowUrl} />
          <text x="556" y="242" fontSize="13" fontWeight="700" fill="#0f172a">v</text>
          <text x="72" y="50" fontSize="13" fontWeight="700" fill="#0f172a">p</text>
          <line x1="250" y1="54" x2="250" y2="225" stroke="#7c3aed" strokeWidth="2.6" />
          <text x="256" y="66" fontSize="11.5" fontWeight="700" fill="#6d28d9">n = ∞ 定容 (v=c)</text>
          <line x1="115" y1="138" x2="495" y2="138" stroke="#16a34a" strokeWidth="2.6" />
          <text x="448" y="128" fontSize="11.5" fontWeight="700" fill="#15803d">n = 0 定压 (p=c)</text>
          <path d="M 150 76 Q 250 138 490 184" fill="none" stroke="#0284c7" strokeWidth="2.6" />
          <text x="435" y="176" fontSize="11.5" fontWeight="700" fill="#0369a1">n = 1 定温 (T=c)</text>
          <path d="M 188 60 Q 250 138 415 218" fill="none" stroke="#ea580c" strokeWidth="2.6" />
          <text x="390" y="226" fontSize="11.5" fontWeight="700" fill="#c2410c">n = k 定熵 (s=c)</text>
          <circle cx="250" cy="138" r="5" fill="#0f172a" />
          <text x="218" y="130" fontSize="12" fontWeight="700" fill="#0f172a">状态 1</text>
        </>
      )

    case 'thermo-carnot-ts':
      return (
        <>
          <text x="20" y="26" fontSize="13" fontWeight="700" fill="#0d4658">
            可逆卡诺循环 T-s 温熵图 (面积即吸热量、净功与放热量)
          </text>
          <line x1="110" y1="236" x2="540" y2="236" stroke="#334155" strokeWidth="2" markerEnd={arrowUrl} />
          <line x1="110" y1="236" x2="110" y2="46" stroke="#334155" strokeWidth="2" markerEnd={arrowUrl} />
          <text x="548" y="240" fontSize="13" fontWeight="700" fill="#0f172a">s</text>
          <text x="90" y="54" fontSize="13" fontWeight="700" fill="#0f172a">T</text>

          <rect x="200" y="164" width="210" height="72" fill="#e2e8f0" opacity="0.7" />
          <rect x="200" y="76" width="210" height="88" fill="#fed7aa" stroke="#ea580c" strokeWidth="2.4" />
          <line x1="110" y1="76" x2="200" y2="76" stroke="#94a3b8" strokeDasharray="4 3" />
          <line x1="110" y1="164" x2="200" y2="164" stroke="#94a3b8" strokeDasharray="4 3" />
          <text x="72" y="80" fontSize="12" fontWeight="700" fill="#c2410c">T₁ (高)</text>
          <text x="72" y="168" fontSize="12" fontWeight="700" fill="#0369a1">T₂ (低)</text>

          <circle cx="200" cy="76" r="4" fill="#0f172a" />
          <circle cx="410" cy="76" r="4" fill="#0f172a" />
          <circle cx="410" cy="164" r="4" fill="#0f172a" />
          <circle cx="200" cy="164" r="4" fill="#0f172a" />
          <text x="184" y="70" fontSize="12" fontWeight="700" fill="#0f172a">1</text>
          <text x="418" y="70" fontSize="12" fontWeight="700" fill="#0f172a">2</text>
          <text x="418" y="176" fontSize="12" fontWeight="700" fill="#0f172a">3</text>
          <text x="184" y="176" fontSize="12" fontWeight="700" fill="#0f172a">4</text>

          <text x="238" y="124" fontSize="13" fontWeight="700" fill="#9a3412">净出力功 w_net = q₁ - q₂</text>
          <text x="242" y="204" fontSize="12" fontWeight="700" fill="#475569">排入冷源废热 q₂</text>
          <text x="438" y="124" fontSize="12" fill="#0f172a">η_C = 1 - T₂/T₁</text>
        </>
      )

    case 'thermo-rankine-cycle':
      return (
        <>
          <text x="20" y="26" fontSize="13" fontWeight="700" fill="#0d4658">
            朗肯蒸汽动力循环流程简图 (左) 与 T-s 饱和线循环图 (右)
          </text>
          <rect x="46" y="70" width="96" height="44" rx="6" fill="#ffedd5" stroke="#ea580c" strokeWidth="2" />
          <text x="72" y="96" fontSize="12" fontWeight="700" fill="#9a3412">锅炉 Q₁</text>
          <rect x="206" y="70" width="96" height="44" rx="6" fill="#dbeafe" stroke="#0284c7" strokeWidth="2" />
          <text x="224" y="96" fontSize="12" fontWeight="700" fill="#0369a1">汽轮机 W_t</text>
          <rect x="206" y="185" width="96" height="44" rx="6" fill="#e0f2fe" stroke="#0369a1" strokeWidth="2" />
          <text x="224" y="211" fontSize="12" fontWeight="700" fill="#0369a1">凝汽器 Q₂</text>
          <rect x="46" y="185" width="96" height="44" rx="6" fill="#dcfce7" stroke="#16a34a" strokeWidth="2" />
          <text x="64" y="211" fontSize="12" fontWeight="700" fill="#166534">给水泵 W_p</text>

          <line x1="142" y1="92" x2="202" y2="92" stroke="#ea580c" strokeWidth="2.2" markerEnd={warmArrowUrl} />
          <line x1="254" y1="114" x2="254" y2="181" stroke="#0284c7" strokeWidth="2.2" markerEnd={arrowUrl} />
          <line x1="206" y1="207" x2="146" y2="207" stroke="#0284c7" strokeWidth="2.2" markerEnd={arrowUrl} />
          <line x1="94" y1="185" x2="94" y2="118" stroke="#16a34a" strokeWidth="2.2" markerEnd={arrowUrl} />

          <line x1="355" y1="242" x2="615" y2="242" stroke="#334155" strokeWidth="1.8" />
          <line x1="355" y1="242" x2="355" y2="50" stroke="#334155" strokeWidth="1.8" />
          <text x="618" y="246" fontSize="12" fontWeight="700" fill="#0f172a">s</text>
          <text x="342" y="56" fontSize="12" fontWeight="700" fill="#0f172a">T</text>
          <path d="M 380 232 C 415 110 475 94 486 94 C 500 94 558 116 592 232" fill="none" stroke="#64748b" strokeWidth="2" strokeDasharray="4 3" />
          <path d="M 402 195 L 402 184 L 422 126 L 525 126 L 560 80 L 560 195 Z" fill="#dbeafe" fillOpacity="0.45" stroke="#0284c7" strokeWidth="2.4" />
          <text x="386" y="198" fontSize="11" fontWeight="700" fill="#0f172a">1→2</text>
          <text x="456" y="118" fontSize="11" fontWeight="700" fill="#c2410c">定压汽化</text>
          <text x="564" y="78" fontSize="11" fontWeight="700" fill="#c2410c">5(过热)</text>
          <text x="564" y="206" fontSize="11" fontWeight="700" fill="#0369a1">6(排汽)</text>
        </>
      )

    case 'thermo-ic-cycles':
      return (
        <>
          <text x="20" y="24" fontSize="13" fontWeight="700" fill="#0d4658">
            p-v 示功图上的奥托定容循环 (左) 与狄塞尔定压加热循环 (右)
          </text>
          {/* Left: Otto */}
          <rect x="26" y="42" width="280" height="218" rx="8" fill="#ffffff" stroke="#cbd5e1" />
          <text x="44" y="64" fontSize="12" fontWeight="700" fill="#1e3a8a">奥托循环 (Otto, 汽油定容加热)</text>
          <line x1="60" y1="234" x2="286" y2="234" stroke="#475569" strokeWidth="1.5" />
          <line x1="60" y1="234" x2="60" y2="76" stroke="#475569" strokeWidth="1.5" />
          <path d="M 105 154 L 105 90 Q 175 148 255 178 L 255 212 Q 165 186 105 154 Z" fill="#dbeafe" fillOpacity="0.6" stroke="#0284c7" strokeWidth="2.4" />
          <text x="110" y="94" fontSize="11" fontWeight="700" fill="#c2410c">3 (点火定容升压)</text>
          <text x="110" y="150" fontSize="11" fill="#0f172a">2</text>
          <text x="260" y="182" fontSize="11" fill="#0f172a">4</text>
          <text x="260" y="218" fontSize="11" fill="#0f172a">1</text>

          {/* Right: Diesel */}
          <rect x="334" y="42" width="280" height="218" rx="8" fill="#ffffff" stroke="#cbd5e1" />
          <text x="352" y="64" fontSize="12" fontWeight="700" fill="#9a3412">狄塞尔循环 (Diesel, 柴油定压喷燃)</text>
          <line x1="368" y1="234" x2="594" y2="234" stroke="#475569" strokeWidth="1.5" />
          <line x1="368" y1="234" x2="368" y2="76" stroke="#475569" strokeWidth="1.5" />
          <path d="M 412 114 L 478 114 Q 515 152 564 182 L 564 214 Q 478 188 412 114 Z" fill="#ffedd5" fillOpacity="0.65" stroke="#ea580c" strokeWidth="2.4" />
          <text x="415" y="106" fontSize="11" fontWeight="700" fill="#c2410c">2 → 3 (定压喷油燃烧)</text>
          <text x="570" y="186" fontSize="11" fill="#0f172a">4</text>
          <text x="570" y="218" fontSize="11" fill="#0f172a">1</text>
        </>
      )

    case 'thermo-hd-psychrometric':
      return (
        <>
          <text x="20" y="24" fontSize="13" fontWeight="700" fill="#0d4658">
            湿空气焓湿图 (h-d 图) 典型空气处理过程方向方位图
          </text>
          <line x1="90" y1="242" x2="565" y2="242" stroke="#334155" strokeWidth="2" markerEnd={arrowUrl} />
          <line x1="90" y1="242" x2="90" y2="46" stroke="#334155" strokeWidth="2" markerEnd={arrowUrl} />
          <text x="510" y="262" fontSize="11.5" fontWeight="700" fill="#0f172a">含湿量 d (kg/kg)</text>
          <text x="64" y="54" fontSize="11.5" fontWeight="700" fill="#0f172a">t/h</text>
          {/* Saturation curve phi=100% */}
          <path d="M 110 220 Q 250 185 450 56" fill="none" stroke="#0284c7" strokeWidth="2.8" />
          <text x="458" y="64" fontSize="11.5" fontWeight="700" fill="#0369a1">φ = 100% 饱和线</text>
          {/* State point O */}
          <circle cx="290" cy="122" r="5" fill="#0f172a" />
          <text x="298" y="116" fontSize="12" fontWeight="700" fill="#0f172a">初态 O</text>
          {/* Arrows from O */}
          <line x1="290" y1="122" x2="290" y2="62" stroke="#dc2626" strokeWidth="2.4" markerEnd={warmArrowUrl} />
          <text x="298" y="72" fontSize="11" fontWeight="700" fill="#dc2626">纯升温 (d=c)</text>
          <line x1="290" y1="122" x2="290" y2="160" stroke="#0284c7" strokeWidth="2.2" strokeDasharray="4 2" />
          <path d="M 290 160 L 210 198" fill="none" stroke="#0284c7" strokeWidth="2.5" markerEnd={arrowUrl} />
          <text x="148" y="198" fontSize="11" fontWeight="700" fill="#0369a1">降温至露点凝水除湿</text>
          <line x1="290" y1="122" x2="365" y2="152" stroke="#16a34a" strokeWidth="2.4" markerEnd={arrowUrl} />
          <text x="368" y="158" fontSize="11" fontWeight="700" fill="#15803d">绝热喷雾加湿降温 (h≈c)</text>
        </>
      )

    case 'ht-three-modes':
      return (
        <>
          <text x="20" y="24" fontSize="13" fontWeight="700" fill="#0d4658">
            三种基本传热方式与等效串联热阻网络示意图
          </text>
          <rect x="24" y="42" width="184" height="122" rx="8" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.5" />
          <text x="38" y="64" fontSize="12" fontWeight="700" fill="#c2410c">1. 导热 q = -λ dT/dx</text>
          <rect x="44" y="78" width="144" height="58" fill="#fed7aa" stroke="#ea580c" strokeWidth="1.5" />
          <line x1="56" y1="86" x2="176" y2="128" stroke="#9a3412" strokeWidth="2.2" />
          <text x="48" y="154" fontSize="11" fill="#475569">高温 T₁ ────→ 低温 T₂</text>

          <rect x="228" y="42" width="184" height="122" rx="8" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.5" />
          <text x="242" y="64" fontSize="12" fontWeight="700" fill="#0369a1">2. 对流 q = h(Tw - T∞)</text>
          <rect x="246" y="120" width="148" height="20" fill="#94a3b8" />
          <path d="M 250 96 q 14 -12 28 0 t 28 0 t 28 0 t 28 0" fill="none" stroke="#0284c7" strokeWidth="2.2" markerEnd={arrowUrl} />
          <text x="252" y="154" fontSize="11" fill="#475569">壁温 Tw 与流体 T∞ 耦合</text>

          <rect x="432" y="42" width="184" height="122" rx="8" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.5" />
          <text x="446" y="64" fontSize="12" fontWeight="700" fill="#7c3aed">3. 辐射 q = εσT⁴</text>
          <rect x="448" y="84" width="22" height="54" fill="#fdba74" stroke="#ea580c" />
          <rect x="578" y="84" width="22" height="54" fill="#cbd5e1" stroke="#475569" />
          <path d="M 476 110 q 16 -10 32 0 t 32 0 t 30 0" fill="none" stroke="#7c3aed" strokeWidth="2.2" markerEnd={warmArrowUrl} />
          <text x="454" y="154" fontSize="11" fill="#475569">真空电磁波传递 (T⁴)</text>

          <rect x="24" y="184" width="592" height="76" rx="8" fill="#f1f5f9" stroke="#cbd5e1" />
          <text x="38" y="206" fontSize="12" fontWeight="700" fill="#0d4658">平壁稳态热阻串联网络：Q = ΔT_total / R_total</text>
          <line x1="70" y1="234" x2="570" y2="234" stroke="#334155" strokeWidth="2" />
          <rect x="135" y="220" width="90" height="28" rx="4" fill="#dbeafe" stroke="#0284c7" />
          <text x="150" y="238" fontSize="11" fontWeight="700" fill="#0369a1">R_conv1 = 1/h₁A</text>
          <rect x="275" y="220" width="90" height="28" rx="4" fill="#fed7aa" stroke="#ea580c" />
          <text x="292" y="238" fontSize="11" fontWeight="700" fill="#9a3412">R_cond = δ/λA</text>
          <rect x="415" y="220" width="90" height="28" rx="4" fill="#dbeafe" stroke="#0284c7" />
          <text x="430" y="238" fontSize="11" fontWeight="700" fill="#0369a1">R_conv2 = 1/h₂A</text>
        </>
      )

    case 'ht-wall-conduction':
      return (
        <>
          <text x="20" y="26" fontSize="13" fontWeight="700" fill="#0d4658">
            三层串联平壁稳态导热温度降落线 (低 λ 保温层温度梯度最陡)
          </text>
          <rect x="170" y="62" width="76" height="162" fill="#cbd5e1" stroke="#475569" strokeWidth="1.5" />
          <rect x="246" y="62" width="120" height="162" fill="#fef3c7" stroke="#d97706" strokeWidth="1.5" />
          <rect x="366" y="62" width="84" height="162" fill="#e2e8f0" stroke="#475569" strokeWidth="1.5" />

          <text x="186" y="242" fontSize="11.5" fill="#1e293b">层1 (钢)</text>
          <text x="270" y="242" fontSize="11.5" fontWeight="700" fill="#b45309">层2 保温棉(λ₂极小)</text>
          <text x="382" y="242" fontSize="11.5" fill="#1e293b">层3 (护板)</text>

          <path
            d="M 85 82 C 130 82 155 90 170 96 L 246 108 L 366 196 L 450 206 C 475 210 500 214 555 214"
            fill="none"
            stroke="#dc2626"
            strokeWidth="3"
          />
          <text x="72" y="74" fontSize="12" fontWeight="700" fill="#dc2626">T∞,1</text>
          <text x="530" y="204" fontSize="12" fontWeight="700" fill="#0369a1">T∞,2</text>
          <line x1="70" y1="150" x2="155" y2="150" stroke="#ea580c" strokeWidth="2.4" markerEnd={warmArrowUrl} />
          <text x="72" y="142" fontSize="11.5" fontWeight="700" fill="#c2410c">恒定热流 Q</text>
        </>
      )

    case 'ht-conduction-bc':
      return (
        <>
          <text x="20" y="24" fontSize="13" fontWeight="700" fill="#0d4658">
            导热三大典型边界条件 (左) 与均匀内热源发热平壁抛物线分布 (右)
          </text>
          {/* Left: 3 BCs */}
          <rect x="24" y="42" width="265" height="66" rx="6" fill="#ffffff" stroke="#cbd5e1" />
          <text x="38" y="64" fontSize="11.5" fontWeight="700" fill="#dc2626">第一类 (Dirichlet): 已知等壁温 Tw</text>
          <text x="38" y="90" fontSize="11" fill="#475569">Fluent Wall Thermal → Temperature</text>

          <rect x="24" y="118" width="265" height="66" rx="6" fill="#ffffff" stroke="#cbd5e1" />
          <text x="38" y="140" fontSize="11.5" fontWeight="700" fill="#ea580c">第二类 (Neumann): 已知定热流 qw</text>
          <text x="38" y="166" fontSize="11" fill="#475569">特例 qw = 0 即绝热/对称边界</text>

          <rect x="24" y="194" width="265" height="66" rx="6" fill="#ffffff" stroke="#cbd5e1" />
          <text x="38" y="216" fontSize="11.5" fontWeight="700" fill="#0369a1">第三类 (Robin): 已知对流 h 与 T∞</text>
          <text x="38" y="242" fontSize="11" fill="#475569">-λ(∂T/∂n) = h(Tw - T∞)</text>

          {/* Right: internal heat generation */}
          <rect x="312" y="42" width="304" height="218" rx="8" fill="#ffffff" stroke="#cbd5e1" />
          <rect x="394" y="76" width="140" height="148" fill="#fef3c7" stroke="#d97706" strokeWidth="1.8" />
          <line x1="464" y1="68" x2="464" y2="238" stroke="#64748b" strokeWidth="1.2" strokeDasharray="4 3" />
          <path d="M 394 186 Q 464 78 534 186" fill="none" stroke="#dc2626" strokeWidth="2.8" />
          <circle cx="464" cy="132" r="4" fill="#dc2626" />
          <text x="412" y="122" fontSize="11.5" fontWeight="700" fill="#dc2626">T_max = Tw + Φ̇L²/(2λ)</text>
          <text x="328" y="188" fontSize="11" fontWeight="700" fill="#0369a1">Tw (-L)</text>
          <text x="540" y="188" fontSize="11" fontWeight="700" fill="#0369a1">Tw (+L)</text>
          <text x="356" y="248" fontSize="11" fill="#9a3412">均匀发热内热源 Φ̇ 产生对称抛物线温升</text>
        </>
      )

    case 'ht-heat-exchanger':
      return (
        <>
          <text x="20" y="24" fontSize="13" fontWeight="700" fill="#0d4658">
            顺流 (Parallel Flow) vs 逆流 (Counterflow) 沿程温差与交叉对比
          </text>
          <rect x="28" y="42" width="276" height="214" rx="8" fill="#ffffff" stroke="#cbd5e1" />
          <text x="44" y="64" fontSize="12" fontWeight="700" fill="#1e293b">顺流 (同向流入, ΔT_out 始终受限)</text>
          <line x1="60" y1="226" x2="280" y2="226" stroke="#475569" strokeWidth="1.5" />
          <line x1="60" y1="226" x2="60" y2="82" stroke="#475569" strokeWidth="1.5" />
          <path d="M 66 94 Q 155 128 270 144" fill="none" stroke="#dc2626" strokeWidth="2.6" />
          <path d="M 66 212 Q 155 172 270 156" fill="none" stroke="#0284c7" strokeWidth="2.6" />
          <text x="74" y="92" fontSize="11" fontWeight="700" fill="#dc2626">Th,in</text>
          <text x="234" y="138" fontSize="11" fill="#dc2626">Th,out</text>
          <text x="74" y="218" fontSize="11" fontWeight="700" fill="#0284c7">Tc,in</text>
          <text x="234" y="172" fontSize="11" fill="#0284c7">Tc,out &lt; Th,out</text>

          <rect x="336" y="42" width="276" height="214" rx="8" fill="#ffffff" stroke="#86efac" strokeWidth="1.8" />
          <text x="352" y="64" fontSize="12" fontWeight="700" fill="#166534">逆流 (逆向流动, 可实现 Tc,out &gt; Th,out)</text>
          <line x1="368" y1="226" x2="588" y2="226" stroke="#475569" strokeWidth="1.5" />
          <line x1="368" y1="226" x2="368" y2="82" stroke="#475569" strokeWidth="1.5" />
          <path d="M 374 92 L 578 176" fill="none" stroke="#dc2626" strokeWidth="2.6" />
          <path d="M 374 128 L 578 212" fill="none" stroke="#0284c7" strokeWidth="2.6" />
          <text x="380" y="86" fontSize="11" fontWeight="700" fill="#dc2626">Th,in</text>
          <text x="546" y="170" fontSize="11" fill="#dc2626">Th,out</text>
          <text x="380" y="144" fontSize="11" fontWeight="700" fill="#0284c7">Tc,out (可高过 Th,out!)</text>
          <text x="546" y="222" fontSize="11" fill="#0284c7">Tc,in</text>
        </>
      )

    case 'ref-vapor-compression':
      return (
        <>
          <text x="20" y="24" fontSize="13" fontWeight="700" fill="#0d4658">
            单级蒸气压缩制冷四大部件 (左) 与 lg p-h 压焓图状态线 (右)
          </text>
          <rect x="130" y="54" width="110" height="36" rx="6" fill="#ffedd5" stroke="#ea580c" strokeWidth="2" />
          <text x="150" y="76" fontSize="12" fontWeight="700" fill="#9a3412">冷凝器 Qk</text>
          <rect x="130" y="210" width="110" height="36" rx="6" fill="#dbeafe" stroke="#0284c7" strokeWidth="2" />
          <text x="150" y="232" fontSize="12" fontWeight="700" fill="#0369a1">蒸发器 Q₀</text>
          <rect x="26" y="132" width="84" height="36" rx="6" fill="#dcfce7" stroke="#16a34a" strokeWidth="2" />
          <text x="36" y="154" fontSize="11.5" fontWeight="700" fill="#166534">节流阀 3→4</text>
          <rect x="256" y="132" width="84" height="36" rx="6" fill="#ede9fe" stroke="#7c3aed" strokeWidth="2" />
          <text x="266" y="154" fontSize="11.5" fontWeight="700" fill="#6d28d9">压缩机 W</text>

          <path d="M 298 132 L 298 72 L 244 72" fill="none" stroke="#ea580c" strokeWidth="2" markerEnd={warmArrowUrl} />
          <path d="M 130 72 L 68 72 L 68 128" fill="none" stroke="#0284c7" strokeWidth="2" markerEnd={arrowUrl} />
          <path d="M 68 168 L 68 228 L 126 228" fill="none" stroke="#16a34a" strokeWidth="2" markerEnd={arrowUrl} />
          <path d="M 240 228 L 298 228 L 298 172" fill="none" stroke="#7c3aed" strokeWidth="2" markerEnd={arrowUrl} />

          <line x1="376" y1="248" x2="620" y2="248" stroke="#334155" strokeWidth="1.8" />
          <line x1="376" y1="248" x2="376" y2="44" stroke="#334155" strokeWidth="1.8" />
          <text x="622" y="252" fontSize="12" fontWeight="700" fill="#0f172a">h</text>
          <text x="362" y="54" fontSize="12" fontWeight="700" fill="#0f172a">lg p</text>
          <path d="M 412 238 C 430 112 480 86 496 86 C 512 86 544 114 558 238" fill="none" stroke="#64748b" strokeWidth="2" strokeDasharray="4 3" />
          <path d="M 442 122 L 575 122 L 542 198 L 442 198 Z" fill="#dbeafe" fillOpacity="0.4" stroke="#0284c7" strokeWidth="2.4" />
          <circle cx="542" cy="198" r="4" fill="#0f172a" />
          <circle cx="575" cy="122" r="4" fill="#0f172a" />
          <circle cx="442" cy="122" r="4" fill="#0f172a" />
          <circle cx="442" cy="198" r="4" fill="#0f172a" />
          <text x="546" y="210" fontSize="11.5" fontWeight="700" fill="#0f172a">1 (吸气)</text>
          <text x="580" y="122" fontSize="11.5" fontWeight="700" fill="#c2410c">2 (排气)</text>
          <text x="424" y="114" fontSize="11.5" fontWeight="700" fill="#0369a1">3</text>
          <text x="422" y="210" fontSize="11.5" fontWeight="700" fill="#166534">4 (等焓节流)</text>
        </>
      )

    case 'ref-subcool-superheat':
      return (
        <>
          <text x="20" y="24" fontSize="13" fontWeight="700" fill="#0d4658">
            lg p-h 图上的过冷 (3→3′) 增冷量效应与吸气过热 (1→1′) 演变
          </text>
          <line x1="100" y1="242" x2="570" y2="242" stroke="#334155" strokeWidth="2" />
          <line x1="100" y1="242" x2="100" y2="44" stroke="#334155" strokeWidth="2" />
          <text x="578" y="246" fontSize="12" fontWeight="700" fill="#0f172a">h (比焓)</text>
          <text x="72" y="54" fontSize="12" fontWeight="700" fill="#0f172a">lg p</text>
          <path d="M 180 232 C 210 100 310 72 332 72 C 354 72 418 104 440 232" fill="none" stroke="#64748b" strokeWidth="2" strokeDasharray="4 3" />
          <path d="M 225 112 L 485 112 L 424 198 L 225 198 Z" fill="none" stroke="#94a3b8" strokeWidth="2" strokeDasharray="5 3" />
          <path d="M 185 112 L 520 112 L 452 198 L 185 198 Z" fill="#e0f2fe" fillOpacity="0.4" stroke="#0284c7" strokeWidth="2.5" />
          <circle cx="185" cy="112" r="4" fill="#16a34a" />
          <circle cx="225" cy="112" r="4" fill="#64748b" />
          <circle cx="185" cy="198" r="4" fill="#16a34a" />
          <circle cx="424" cy="198" r="4" fill="#64748b" />
          <circle cx="452" cy="198" r="4" fill="#ea580c" />
          <text x="172" y="102" fontSize="11.5" fontWeight="700" fill="#15803d">3′(过冷) ← 3</text>
          <text x="172" y="214" fontSize="11.5" fontWeight="700" fill="#15803d">4′ (+Δq₀)</text>
          <text x="415" y="214" fontSize="11.5" fontWeight="700" fill="#c2410c">1 → 1′(过热)</text>
          <text x="480" y="102" fontSize="11.5" fontWeight="700" fill="#c2410c">2 → 2′(排气温升高)</text>
        </>
      )

    case 'ref-absorption-cycle':
      return (
        <>
          <text x="20" y="24" fontSize="13" fontWeight="700" fill="#0d4658">
            余热驱动吸收式制冷循环：溶液热力压缩回路与冷剂水力回路
          </text>
          <rect x="44" y="48" width="120" height="44" rx="6" fill="#ffedd5" stroke="#ea580c" strokeWidth="2" />
          <text x="64" y="74" fontSize="12" fontWeight="700" fill="#9a3412">冷凝器 Qk</text>
          <rect x="44" y="194" width="120" height="44" rx="6" fill="#dbeafe" stroke="#0284c7" strokeWidth="2" />
          <text x="64" y="220" fontSize="12" fontWeight="700" fill="#0369a1">蒸发器 Q₀</text>

          <rect x="446" y="48" width="144" height="44" rx="6" fill="#fee2e2" stroke="#dc2626" strokeWidth="2" />
          <text x="462" y="74" fontSize="12" fontWeight="700" fill="#991b1b">发生器 (热源 Qg)</text>
          <rect x="446" y="194" width="144" height="44" rx="6" fill="#dcfce7" stroke="#16a34a" strokeWidth="2" />
          <text x="466" y="220" fontSize="12" fontWeight="700" fill="#166534">吸收器 Qa</text>

          <rect x="456" y="124" width="124" height="36" rx="6" fill="#fef3c7" stroke="#d97706" strokeWidth="1.8" />
          <text x="470" y="146" fontSize="11.5" fontWeight="700" fill="#b45309">溶液热交换器</text>

          <line x1="104" y1="92" x2="104" y2="190" stroke="#0284c7" strokeWidth="2.2" markerEnd={arrowUrl} />
          <text x="112" y="146" fontSize="11" fill="#0369a1">节流冷剂</text>
          <line x1="446" y1="70" x2="168" y2="70" stroke="#dc2626" strokeWidth="2.4" markerEnd={warmArrowUrl} />
          <text x="242" y="62" fontSize="11.5" fontWeight="700" fill="#dc2626">高温冷剂蒸气 (分离)</text>
          <line x1="164" y1="216" x2="442" y2="216" stroke="#0284c7" strokeWidth="2.4" markerEnd={arrowUrl} />
          <text x="240" y="208" fontSize="11.5" fontWeight="700" fill="#0369a1">低温低压冷剂蒸气 (被吸收)</text>
          <line x1="484" y1="194" x2="484" y2="96" stroke="#16a34a" strokeWidth="2" markerEnd={arrowUrl} />
          <line x1="552" y1="92" x2="552" y2="190" stroke="#ea580c" strokeWidth="2" markerEnd={warmArrowUrl} />
          <text x="380" y="146" fontSize="11" fill="#166534">溶液泵 Wp</text>
        </>
      )

    case 'ref-co2-transcritical':
      return (
        <>
          <text x="20" y="24" fontSize="13" fontWeight="700" fill="#0d4658">
            R744 (CO₂) 跨临界循环 lg p-h 图：临界点上方超临界滑移降温放热
          </text>
          <line x1="105" y1="242" x2="575" y2="242" stroke="#334155" strokeWidth="2" markerEnd={arrowUrl} />
          <line x1="105" y1="242" x2="105" y2="44" stroke="#334155" strokeWidth="2" markerEnd={arrowUrl} />
          <text x="580" y="246" fontSize="12" fontWeight="700" fill="#0f172a">h (kJ/kg)</text>
          <text x="72" y="54" fontSize="12" fontWeight="700" fill="#0f172a">lg p</text>
          {/* Low CO2 Dome */}
          <path d="M 190 232 C 215 152 295 130 315 130 C 335 130 398 156 420 232" fill="none" stroke="#64748b" strokeWidth="2" strokeDasharray="4 3" />
          <line x1="105" y1="130" x2="535" y2="130" stroke="#94a3b8" strokeDasharray="3 3" />
          <circle cx="315" cy="130" r="4.5" fill="#dc2626" />
          <text x="115" y="124" fontSize="11" fontWeight="700" fill="#dc2626">临界线 Pc = 7.38 MPa (Tc = 31.1°C)</text>
          {/* Transcritical loop above dome */}
          <path d="M 248 78 L 490 78 L 424 198 L 248 198 Z" fill="#ccfbf1" fillOpacity="0.4" stroke="#0f766e" strokeWidth="2.5" />
          <circle cx="248" cy="78" r="4.5" fill="#0f766e" />
          <circle cx="490" cy="78" r="4.5" fill="#ea580c" />
          <circle cx="424" cy="198" r="4.5" fill="#0f172a" />
          <circle cx="248" cy="198" r="4.5" fill="#0284c7" />
          <text x="275" y="70" fontSize="11.5" fontWeight="700" fill="#0f766e">2→3 超临界气体冷却器放热 (约 9~10 MPa, 滑移贴合冷水升温)</text>
          <text x="195" y="80" fontSize="11" fontWeight="700" fill="#0f766e">3 (p_opt)</text>
          <text x="496" y="80" fontSize="11" fontWeight="700" fill="#c2410c">2 (高压排气)</text>
          <text x="430" y="212" fontSize="11" fill="#0f172a">1 (蒸发吸气)</text>
          <text x="218" y="212" fontSize="11" fill="#0369a1">4 (节流进液)</text>
        </>
      )
  }
}
