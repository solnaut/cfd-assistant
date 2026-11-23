import { useId } from 'react'
import type { FluentDiagramKind, TeachingDiagramSpec } from '../data/fluentTeachingDiagrams'

interface Props {
  spec: TeachingDiagramSpec
  compact?: boolean
}

interface MarkerIds {
  ink: string
  accent: string
  warm: string
}

function DiagramSvgBody({
  kind,
  m,
  activeModel = '',
}: {
  kind: FluentDiagramKind
  m: MarkerIds
  activeModel?: string
}) {
  const lower = activeModel.toLowerCase()

  switch (kind) {
    case 'solver-comparison': {
      const pbActive = !lower.includes('density')
      const dbActive = lower.includes('density')
      return (
        <>
          <text x="20" y="24" className="diag-heading">求解算法物理内核对比 (Ma &lt; 0.3 vs 可压缩激波)</text>
          <rect x="20" y="40" width="275" height="196" rx="8" className={pbActive ? 'diag-box diag-box-active' : 'diag-box'} />
          <text x="34" y="62" className="diag-title">Pressure-Based (压力基求解器)</text>
          <text x="34" y="80" className="diag-sub">适用：不可压至亚声速 / 多相 / 传热 / 化学反应</text>
          <rect x="40" y="96" width="106" height="32" rx="5" className="diag-node" />
          <text x="93" y="116" textAnchor="middle" className="diag-label">动量预测 u*, v*, w*</text>
          <line x1="146" y1="112" x2="174" y2="112" className="diag-arrow" markerEnd={`url(#${m.accent})`} />
          <rect x="176" y="96" width="104" height="32" rx="5" className="diag-node-accent" />
          <text x="228" y="116" textAnchor="middle" className="diag-label">压力泊松修正 p&apos;</text>
          <path d="M 228 128 L 228 148 L 93 148 L 93 132" fill="none" className="diag-arrow" markerEnd={`url(#${m.accent})`} />
          <rect x="40" y="162" width="240" height="58" rx="5" className="diag-note-box" />
          <text x="50" y="180" className="diag-small">• 通过压力修正方程强制满足连续性 ∇·(ρu) = 0</text>
          <text x="50" y="196" className="diag-small">• Coupled 同时联立 u-p；SIMPLE/PISO 分离迭代</text>
          <text x="50" y="212" className="diag-small">• 内存占用较低，收敛稳健（常温水/低速空气首选）</text>

          <rect x="325" y="40" width="275" height="196" rx="8" className={dbActive ? 'diag-box diag-box-active' : 'diag-box'} />
          <text x="339" y="62" className="diag-title">Density-Based (密度基耦合求解器)</text>
          <text x="339" y="80" className="diag-sub">适用：跨声速 / 超声速 (Ma &gt; 0.3) / 斜激波 / 喷管</text>
          <rect x="345" y="96" width="235" height="36" rx="5" className="diag-node-warm" />
          <text x="462" y="112" textAnchor="middle" className="diag-label">联合通量向量 U = [ρ, ρu, ρE]ᵀ 强耦合</text>
          <text x="462" y="126" textAnchor="middle" className="diag-small">Roe / AUSM+ 迎风黎曼求解器 + 理想气体 EOS p=ρRT</text>
          <line x1="350" y1="186" x2="465" y2="186" className="diag-arrow" markerEnd={`url(#${m.warm})`} />
          <polygon points="465,186 525,146 525,212" className="diag-shade-warm" />
          <line x1="465" y1="186" x2="532" y2="146" className="diag-shock" />
          <text x="542" y="170" className="diag-small">Ma &gt; 1 激波</text>
          <text x="542" y="186" className="diag-small">强间断捕获</text>
          <text x="345" y="220" className="diag-small">需合理 Courant 数与双时间步物理时间收敛</text>
        </>
      )
    }

    case 'turbulence-hierarchy': {
      const highlightLes = lower.includes('les') || lower.includes('des')
      const highlightKe = lower.includes('k-epsilon')
      const highlightKw = lower.includes('sst') || lower.includes('k-omega')
      return (
        <>
          <text x="20" y="24" className="diag-heading">湍流能谱与尺度模化分工: E(κ) ~ κ^(-5/3)</text>
          <line x1="55" y1="205" x2="365" y2="205" className="diag-axis" markerEnd={`url(#${m.ink})`} />
          <line x1="55" y1="205" x2="55" y2="48" className="diag-axis" markerEnd={`url(#${m.ink})`} />
          <text x="22" y="58" className="diag-small">E(κ)</text>
          <text x="305" y="222" className="diag-small">波数 κ (小尺度 →)</text>

          <path d="M 62 108 C 95 72, 130 68, 175 95 C 225 128, 285 162, 345 196" fill="none" className="diag-curve-accent" />
          <rect x="64" y="60" width="128" height="145" className={highlightLes ? 'diag-shade-active' : 'diag-shade-accent'} />
          <line x1="192" y1="54" x2="192" y2="205" className="diag-dashed" />
          <text x="128" y="76" textAnchor="middle" className="diag-small">LES 直接解析大涡</text>
          <text x="268" y="138" textAnchor="middle" className="diag-small">SGS / RANS 模化小涡耗散</text>

          <rect x="382" y="42" width="218" height="54" rx="6" className={highlightKw ? 'diag-box diag-box-active' : 'diag-box'} />
          <text x="394" y="61" className="diag-title">k-ω SST (通用工程推荐)</text>
          <text x="394" y="77" className="diag-small">近壁 k-ω 抗逆压分离 + 远场切向 k-ε</text>
          <text x="394" y="90" className="diag-small">需细近壁网格 (y+ ≈ 1) 或混合过渡</text>

          <rect x="382" y="106" width="218" height="54" rx="6" className={highlightKe ? 'diag-box diag-box-active' : 'diag-box'} />
          <text x="394" y="125" className="diag-title">Realizable k-ε (大曲率/强射流)</text>
          <text x="394" y="141" className="diag-small">成熟快速收敛，常配 EWT 或标准壁面函数</text>
          <text x="394" y="154" className="diag-small">强旋流极度各向异性改用 RSM (7方程)</text>

          <rect x="382" y="170" width="218" height="62" rx="6" className={highlightLes ? 'diag-box diag-box-active' : 'diag-box'} />
          <text x="394" y="189" className="diag-title">LES / DES (瞬态三维涡脱落声源)</text>
          <text x="394" y="205" className="diag-small">仅解析瞬态含能大涡，代价高，必须开</text>
          <text x="394" y="220" className="diag-small">瞬态 (Transient) 且近壁需各向同性加密</text>
        </>
      )
    }

    case 'near-wall-yplus': {
      return (
        <>
          <text x="20" y="24" className="diag-heading">壁面律速度分布 u+ vs ln(y+) 与第一层边界层网格尺度</text>
          <rect x="46" y="45" width="90" height="158" className="diag-shade-accent" />
          <rect x="136" y="45" width="76" height="158" className="diag-shade-muted" />
          <rect x="212" y="45" width="160" height="158" className="diag-shade-warm" />
          <line x1="46" y1="203" x2="380" y2="203" className="diag-axis" markerEnd={`url(#${m.ink})`} />
          <line x1="46" y1="203" x2="46" y2="42" className="diag-axis" markerEnd={`url(#${m.ink})`} />
          <text x="91" y="62" textAnchor="middle" className="diag-small">黏性底层</text>
          <text x="91" y="76" textAnchor="middle" className="diag-small">y+ &lt; 5</text>
          <text x="174" y="62" textAnchor="middle" className="diag-small">过渡层</text>
          <text x="174" y="76" textAnchor="middle" className="diag-small">5–30</text>
          <text x="292" y="62" textAnchor="middle" className="diag-small">对数律区 Log-Law</text>
          <text x="292" y="76" textAnchor="middle" className="diag-small">30 &lt; y+ &lt; 300</text>
          <path d="M 48 198 Q 92 178 136 138 Q 175 112 212 100 L 366 72" fill="none" className="diag-curve-accent" />
          <text x="72" y="160" className="diag-label">u+ = y+</text>
          <text x="248" y="114" className="diag-label">u+ = 1/κ ln(Ey+)</text>
          <text x="348" y="220" className="diag-small">y+ = ρ·u_τ·y / μ</text>

          <rect x="394" y="45" width="206" height="86" rx="6" className="diag-box diag-box-active" />
          <text x="406" y="64" className="diag-title">解析壁面法 (目标 y+ ≈ 1)</text>
          <line x1="410" y1="118" x2="585" y2="118" className="diag-wall" />
          <line x1="410" y1="112" x2="585" y2="112" className="diag-mesh" />
          <line x1="410" y1="103" x2="585" y2="103" className="diag-mesh" />
          <line x1="410" y1="90" x2="585" y2="90" className="diag-mesh" />
          <text x="408" y="81" className="diag-small">10–20 层加密棱柱，适配 SST / EWT / 换热传质</text>

          <rect x="394" y="142" width="206" height="88" rx="6" className="diag-box" />
          <text x="406" y="161" className="diag-title">壁面函数法 (30 &lt; y+ &lt; 300)</text>
          <line x1="410" y1="216" x2="585" y2="216" className="diag-wall" />
          <line x1="410" y1="192" x2="585" y2="192" className="diag-mesh" />
          <text x="408" y="178" className="diag-small">首层直接跨入对数律区，严禁落入 5–30 禁区！</text>
        </>
      )
    }

    case 'multiphase-regimes': {
      const isVof = lower.includes('vof') || lower.includes('volume of fluid')
      const isMix = lower.includes('mixture')
      const isEul = lower.includes('eulerian')
      return (
        <>
          <text x="20" y="24" className="diag-heading">三大核心多相流拓扑构型与动量求解自由度对比</text>
          <rect x="18" y="42" width="186" height="196" rx="7" className={isVof ? 'diag-box diag-box-active' : 'diag-box'} />
          <text x="30" y="62" className="diag-title">VOF (体积分数追踪)</text>
          <rect x="32" y="114" width="158" height="44" className="diag-shade-accent" />
          <path d="M 32 114 Q 72 98 111 114 T 190 112" fill="none" className="diag-curve-accent" />
          <text x="111" y="92" textAnchor="middle" className="diag-small">气相 α = 0 | 自由表面</text>
          <text x="111" y="138" textAnchor="middle" className="diag-small">液相 α = 1 (共用一套 u)</text>
          <text x="30" y="178" className="diag-small">• 共享速度压力场，算锋利界面</text>
          <text x="30" y="194" className="diag-small">• 表面张力 κ ∇α / 接触角壁粘附</text>
          <text x="30" y="210" className="diag-small">• Explicit 需 Co ≤ 0.25 + 明渠波浪</text>

          <rect x="217" y="42" width="186" height="196" rx="7" className={isMix ? 'diag-box diag-box-active' : 'diag-box'} />
          <text x="229" y="62" className="diag-title">Mixture (混合滑移)</text>
          <rect x="231" y="82" width="158" height="76" rx="4" className="diag-node" />
          <circle cx="262" cy="106" r="5" className="diag-particle" />
          <circle cx="298" cy="130" r="6" className="diag-particle" />
          <circle cx="342" cy="100" r="5" className="diag-particle" />
          <line x1="298" y1="130" x2="324" y2="115" className="diag-arrow" markerEnd={`url(#${m.accent})`} />
          <text x="310" y="148" textAnchor="middle" className="diag-small">代数滑移速度 u_pq</text>
          <text x="229" y="178" className="diag-small">• 求解混合物动量 + 相分数</text>
          <text x="229" y="194" className="diag-small">• 低负载气泡/泥浆沉积分离首选</text>
          <text x="229" y="210" className="diag-small">• 计算成本明显低于全欧拉模型</text>

          <rect x="416" y="42" width="186" height="196" rx="7" className={isEul ? 'diag-box diag-box-active' : 'diag-box'} />
          <text x="428" y="62" className="diag-title">Eulerian (欧拉多流体)</text>
          <rect x="430" y="82" width="158" height="76" rx="4" className="diag-node-warm" />
          <text x="509" y="104" textAnchor="middle" className="diag-label">主相 q 动量-能量方程 (u_q)</text>
          <text x="509" y="122" textAnchor="middle" className="diag-small">⇅ 曳力 F_D · 升力 · 虚质量 · 传热</text>
          <text x="509" y="140" textAnchor="middle" className="diag-label">次相 p 动量-能量方程 (u_p)</text>
          <text x="428" y="178" className="diag-small">• 每相独立速度场，算密相流化床</text>
          <text x="428" y="194" className="diag-small">• 颗粒动力学 KTGF / 沸腾 / PBM</text>
          <text x="428" y="210" className="diag-small">• Phase Interaction 配对完整闭包</text>
        </>
      )
    }

    case 'heat-transfer-modes': {
      return (
        <>
          <text x="20" y="24" className="diag-heading">能量传递物理耦合：流体对流换热、固体导热与流固共轭接口</text>
          <rect x="24" y="46" width="220" height="186" rx="6" className="diag-shade-accent" />
          <text x="134" y="66" textAnchor="middle" className="diag-title">流体域 (Fluid Cell Zone)</text>
          <line x1="48" y1="96" x2="180" y2="96" className="diag-arrow" markerEnd={`url(#${m.accent})`} />
          <line x1="48" y1="126" x2="152" y2="126" className="diag-arrow" markerEnd={`url(#${m.accent})`} />
          <text x="50" y="156" className="diag-small">边界层对流换热 h(T_w - T_∞)</text>
          <text x="50" y="174" className="diag-small">自然对流：启用 Gravity + 理想气体 /</text>
          <text x="50" y="190" className="diag-small">Boussinesq Δρ = -ρβ(T - T₀)</text>

          <rect x="244" y="46" width="12" height="186" className="diag-wall-band" />
          <text x="250" y="248" textAnchor="middle" className="diag-label">Coupled 耦合壁面 (q_f = q_s, T_f = T_s)</text>

          <rect x="256" y="46" width="170" height="186" rx="6" className="diag-shade-warm" />
          <text x="341" y="66" textAnchor="middle" className="diag-title">固体域 (Solid Zone)</text>
          <path d="M 274 114 Q 312 104 345 128 Q 378 148 410 142" fill="none" className="diag-curve-warm" />
          <text x="268" y="90" className="diag-small">纯导热：q = -k ∇T</text>
          <text x="268" y="172" className="diag-small">支持发热体积源 (W/m³)</text>
          <text x="268" y="190" className="diag-small">薄板多向壳导热可选 Shell</text>
          <text x="268" y="206" className="diag-small">Conduction 替代体网格</text>

          <rect x="442" y="46" width="158" height="186" rx="6" className="diag-box" />
          <text x="454" y="68" className="diag-title">开启 Energy 触发联动</text>
          <text x="454" y="92" className="diag-small">1. Materials 解锁 Cp, k 模型</text>
          <text x="454" y="114" className="diag-small">2. 入口/回流解锁总温或静温</text>
          <text x="454" y="136" className="diag-small">3. Wall Thermal 解锁 6 类：</text>
          <text x="462" y="154" className="diag-small">Heat Flux / Temperature</text>
          <text x="462" y="170" className="diag-small">Convection / Radiation</text>
          <text x="462" y="186" className="diag-small">Mixed / Coupled (流固界面)</text>
          <text x="454" y="212" className="diag-small">4. Viscous 解锁黏性耗散发热</text>
        </>
      )
    }

    case 'radiation-models': {
      return (
        <>
          <text x="20" y="24" className="diag-heading">辐射换热模型按光学厚度 τ = a · L 物理选型区间</text>
          <rect x="30" y="54" width="560" height="36" rx="6" className="diag-box" />
          <rect x="30" y="54" width="140" height="36" rx="6" className={lower.includes('surface') ? 'diag-shade-active' : 'diag-shade-muted'} />
          <rect x="170" y="54" width="220" height="36" className={lower.includes('discrete') || lower.includes('do') || lower.includes('dtrm') ? 'diag-shade-active' : 'diag-shade-accent'} />
          <rect x="390" y="54" width="200" height="36" rx="6" className={lower.includes('p1') || lower.includes('rosseland') ? 'diag-shade-active' : 'diag-shade-warm'} />
          <text x="100" y="76" textAnchor="middle" className="diag-label">τ ≈ 0 透明腔体 (S2S)</text>
          <text x="280" y="76" textAnchor="middle" className="diag-label">0 &lt; τ &lt; ∞ 全能适用 (DO / DTRM)</text>
          <text x="490" y="76" textAnchor="middle" className="diag-label">τ &gt; 1 (P1) / τ &gt;&gt; 3 (Rosseland)</text>

          <rect x="24" y="108" width="180" height="130" rx="6" className="diag-box" />
          <text x="36" y="128" className="diag-title">Surface-to-Surface (S2S)</text>
          <line x1="48" y1="186" x2="178" y2="148" className="diag-arrow" markerEnd={`url(#${m.accent})`} />
          <line x1="48" y1="150" x2="178" y2="196" className="diag-arrow" markerEnd={`url(#${m.accent})`} />
          <text x="36" y="214" className="diag-small">仅计表面间角系数 F_ij；假定介质</text>
          <text x="36" y="229" className="diag-small">不吸收不散射，无参与气体最快</text>

          <rect x="220" y="108" width="180" height="130" rx="6" className="diag-box diag-box-active" />
          <text x="232" y="128" className="diag-title">Discrete Ordinates (DO)</text>
          <circle cx="310" cy="168" r="24" className="diag-node-accent" />
          <line x1="310" y1="168" x2="344" y2="148" className="diag-arrow" markerEnd={`url(#${m.accent})`} />
          <line x1="310" y1="168" x2="344" y2="188" className="diag-arrow" markerEnd={`url(#${m.accent})`} />
          <line x1="310" y1="168" x2="274" y2="152" className="diag-arrow" markerEnd={`url(#${m.accent})`} />
          <text x="232" y="214" className="diag-small">划分 θ/φ 离散立体角求解输运方程，</text>
          <text x="232" y="229" className="diag-small">支持半透明玻璃/火焰/太阳载荷</text>

          <rect x="416" y="108" width="180" height="130" rx="6" className="diag-box" />
          <text x="428" y="128" className="diag-title">P1 &amp; Rosseland</text>
          <circle cx="482" cy="168" r="18" className="diag-particle" />
          <circle cx="534" cy="168" r="18" className="diag-particle" />
          <text x="428" y="214" className="diag-small">将辐射强度球谐展开为扩散方程，</text>
          <text x="428" y="229" className="diag-small">强吸收高光学厚度炉膛收敛快</text>
        </>
      )
    }

    case 'species-combustion': {
      return (
        <>
          <text x="20" y="24" className="diag-heading">化学反应流与湍流燃烧相互作用机制 (Da = 湍流时间/化学时间)</text>
          <rect x="20" y="44" width="184" height="192" rx="6" className={lower.includes('transport') ? 'diag-box diag-box-active' : 'diag-box'} />
          <text x="32" y="64" className="diag-title">Species Transport</text>
          <text x="32" y="84" className="diag-small">多组分质量分数输运方程 ∂(ρY_i)/∂t</text>
          <rect x="34" y="98" width="156" height="44" rx="4" className="diag-node" />
          <text x="112" y="116" textAnchor="middle" className="diag-small">• Finite-Rate：纯 Arrhenius (Da&lt;1)</text>
          <text x="112" y="132" textAnchor="middle" className="diag-small">• Eddy-Dissipation：混合控制 (Da≫1)</text>
          <rect x="34" y="152" width="156" height="44" rx="4" className="diag-node-accent" />
          <text x="112" y="170" textAnchor="middle" className="diag-small">• EDC：微尺度精细结构反应</text>
          <text x="112" y="186" textAnchor="middle" className="diag-small">(适合 CHEMKIN 详细机理/熄火)</text>
          <text x="32" y="218" className="diag-small">需确保各组份质量分数和 = 1.0</text>

          <rect x="218" y="44" width="184" height="192" rx="6" className={lower.includes('non-premixed') ? 'diag-box diag-box-active' : 'diag-box'} />
          <text x="230" y="64" className="diag-title">Non-Premixed (PDF)</text>
          <text x="230" y="84" className="diag-small">分别通入 Fuel 与 Oxidizer 两股气流</text>
          <path d="M 240 165 Q 310 72 380 165" fill="none" className="diag-curve-warm" />
          <line x1="234" y1="168" x2="386" y2="168" className="diag-axis" />
          <text x="310" y="182" textAnchor="middle" className="diag-small">混合分数 f (0 空气 → 1 燃料)</text>
          <text x="230" y="206" className="diag-small">预先积分化学平衡查表 Lookup Table，</text>
          <text x="230" y="222" className="diag-small">不用逐个求全部中间组分输运</text>

          <rect x="416" y="44" width="184" height="192" rx="6" className={lower.includes('premixed') ? 'diag-box diag-box-active' : 'diag-box'} />
          <text x="428" y="64" className="diag-title">Premixed / Partial</text>
          <rect x="434" y="92" width="60" height="68" className="diag-shade-accent" />
          <path d="M 494 92 Q 512 126 494 160" fill="none" className="diag-shock" />
          <rect x="494" y="92" width="90" height="68" className="diag-shade-warm" />
          <text x="464" y="128" textAnchor="middle" className="diag-small">c=0 未燃</text>
          <text x="539" y="128" textAnchor="middle" className="diag-small">c=1 已燃</text>
          <text x="428" y="186" className="diag-small">C-Equation 追踪反应进度波前；</text>
          <text x="428" y="204" className="diag-small">点火失败时检查层流火焰传播速度与</text>
          <text x="428" y="220" className="diag-small">出口回流温度 / Spark 点火</text>
        </>
      )
    }

    case 'dpm-lagrangian': {
      return (
        <>
          <text x="20" y="24" className="diag-heading">欧拉-拉格朗日离散相 (DPM) 颗粒轨道积分与相间双向耦合</text>
          <rect x="22" y="44" width="372" height="186" rx="6" className="diag-box" />
          <line x1="22" y1="106" x2="394" y2="106" className="diag-mesh" />
          <line x1="22" y1="168" x2="394" y2="168" className="diag-mesh" />
          <line x1="115" y1="44" x2="115" y2="230" className="diag-mesh" />
          <line x1="208" y1="44" x2="208" y2="230" className="diag-mesh" />
          <line x1="301" y1="44" x2="301" y2="230" className="diag-mesh" />

          <line x1="40" y1="80" x2="365" y2="80" className="diag-arrow" markerEnd={`url(#${m.ink})`} />
          <text x="44" y="68" className="diag-small">连续相速度 u_fluid (Eulerian 网格计算)</text>

          <path d="M 46 135 Q 150 112 232 162 T 376 196" fill="none" className="diag-curve-warm" markerEnd={`url(#${m.warm})`} />
          <circle cx="96" cy="126" r="6" className="diag-particle" />
          <circle cx="206" cy="146" r="5" className="diag-particle" />
          <circle cx="298" cy="190" r="3" className="diag-particle" />
          <circle cx="312" cy="176" r="2.5" className="diag-particle" />
          <text x="122" y="186" className="diag-label">m_p dv_p/dt = F_drag + F_g + F_other</text>
          <text x="122" y="204" className="diag-small">DRW 脉动速度弥散 + KH-RT 液滴二次破碎</text>
          <line x1="100" y1="226" x2="380" y2="226" className="diag-wall" />
          <text x="275" y="220" className="diag-small">壁面 Reflect / Trap / Wall Film</text>

          <rect x="410" y="44" width="190" height="186" rx="6" className="diag-box diag-box-active" />
          <text x="422" y="66" className="diag-title">Two-Way Coupling 耦合开关</text>
          <text x="422" y="92" className="diag-small">• 单向耦合：仅流体携带颗粒</text>
          <text x="422" y="110" className="diag-small">  (离散相体积分率 &lt; 1%)</text>
          <text x="422" y="136" className="diag-small">• Interaction with Continuous：</text>
          <text x="422" y="154" className="diag-small">  向连续相单元反馈动量/质量/能量</text>
          <text x="422" y="182" className="diag-small">• 开启 Unsteady + Breakup：</text>
          <text x="422" y="200" className="diag-small">  解锁喷射器的 Breakup 选项卡</text>
          <text x="422" y="218" className="diag-small">  及 Multicomponent Components 页</text>
        </>
      )
    }

    case 'boundary-conditions': {
      return (
        <>
          <text x="20" y="24" className="diag-heading">流体通道典型边界约束体系与内部跳跃界面逻辑</text>
          <rect x="44" y="62" width="532" height="132" rx="4" className="diag-shade-accent" />
          <line x1="44" y1="62" x2="576" y2="62" className="diag-wall" />
          <line x1="44" y1="194" x2="576" y2="194" className="diag-wall" />
          <text x="310" y="54" textAnchor="middle" className="diag-title">Wall：No-Slip / Moving / Shear / Thermal (Heat Flux, Temperature, Coupled)</text>

          <line x1="44" y1="62" x2="44" y2="194" className="diag-inlet" />
          <line x1="16" y1="100" x2="62" y2="100" className="diag-arrow" markerEnd={`url(#${m.accent})`} />
          <line x1="16" y1="128" x2="62" y2="128" className="diag-arrow" markerEnd={`url(#${m.accent})`} />
          <line x1="16" y1="156" x2="62" y2="156" className="diag-arrow" markerEnd={`url(#${m.accent})`} />
          <text x="58" y="214" textAnchor="middle" className="diag-label">Inlet 入口</text>
          <text x="58" y="230" textAnchor="middle" className="diag-small">Velocity / Mass Flow / Pressure Inlet</text>

          <line x1="308" y1="62" x2="308" y2="194" className="diag-dashed" />
          <rect x="235" y="92" width="146" height="72" rx="6" className="diag-node-warm" />
          <text x="308" y="114" textAnchor="middle" className="diag-label">内部薄面边界 (Internal)</text>
          <text x="308" y="132" textAnchor="middle" className="diag-small">Fan: 给定压升 ΔP(V_n)</text>
          <text x="308" y="148" textAnchor="middle" className="diag-small">Porous Jump / Radiator</text>

          <line x1="576" y1="62" x2="576" y2="194" className="diag-outlet" />
          <line x1="548" y1="112" x2="598" y2="112" className="diag-arrow" markerEnd={`url(#${m.warm})`} />
          <line x1="548" y1="146" x2="598" y2="146" className="diag-arrow" markerEnd={`url(#${m.warm})`} />
          <text x="556" y="214" textAnchor="middle" className="diag-label">Outlet 出口</text>
          <text x="556" y="230" textAnchor="middle" className="diag-small">Pressure Outlet + Backflow 规范</text>
        </>
      )
    }

    case 'dynamic-mesh': {
      return (
        <>
          <text x="20" y="24" className="diag-heading">Dynamic Mesh 三大核心网格变形与再生机制</text>
          <rect x="18" y="42" width="186" height="196" rx="7" className="diag-box" />
          <text x="30" y="62" className="diag-title">1. Smoothing (弹性光顺)</text>
          <line x1="38" y1="90" x2="184" y2="90" className="diag-mesh" />
          <line x1="38" y1="126" x2="184" y2="118" className="diag-mesh" />
          <line x1="38" y1="162" x2="184" y2="152" className="diag-mesh" />
          <line x1="86" y1="90" x2="86" y2="162" className="diag-mesh" />
          <line x1="138" y1="90" x2="138" y2="158" className="diag-mesh" />
          <text x="30" y="186" className="diag-small">• 不增减网格点，像弹簧微调节点</text>
          <text x="30" y="203" className="diag-small">• 适用小幅振动（如机翼颤振）</text>
          <text x="30" y="220" className="diag-small">• Diffusion 比 Spring 更耐大变形</text>

          <rect x="217" y="42" width="186" height="196" rx="7" className="diag-box diag-box-active" />
          <text x="229" y="62" className="diag-title">2. Layering (动态铺层)</text>
          <rect x="234" y="88" width="16" height="68" className="diag-shade-warm" />
          <rect x="250" y="88" width="128" height="68" className="diag-shade-accent" />
          <line x1="282" y1="88" x2="282" y2="156" className="diag-mesh" />
          <line x1="314" y1="88" x2="314" y2="156" className="diag-mesh" />
          <line x1="346" y1="88" x2="346" y2="156" className="diag-mesh" />
          <line x1="252" y1="122" x2="274" y2="122" className="diag-arrow" markerEnd={`url(#${m.accent})`} />
          <text x="229" y="186" className="diag-small">• 活塞平动沿扫掠方向劈裂/合并层</text>
          <text x="229" y="203" className="diag-small">• 要求面邻接区为六面体/楔形网格</text>
          <text x="229" y="220" className="diag-small">• Split / Collapse Factor 控制生成</text>

          <rect x="416" y="42" width="186" height="196" rx="7" className="diag-box" />
          <text x="428" y="62" className="diag-title">3. Remeshing (局部重构)</text>
          <polygon points="444,150 478,90 526,118 494,158" className="diag-shade-accent" />
          <polygon points="526,118 574,94 562,154 494,158" className="diag-shade-warm" />
          <circle cx="508" cy="126" r="14" className="diag-node" />
          <text x="428" y="186" className="diag-small">• 当四面体偏斜度 &gt; Max Skew 或尺</text>
          <text x="428" y="203" className="diag-small">  寸超 Min/Max Length 自动重剖</text>
          <text x="428" y="220" className="diag-small">• 大幅度运动配 6-DOF 刚体自由下落</text>
        </>
      )
    }

    case 'solution-schemes': {
      return (
        <>
          <text x="20" y="24" className="diag-heading">对流项空间离散格式阶数对比与压力-速度耦合迭代环</text>
          <rect x="20" y="44" width="278" height="192" rx="7" className="diag-box" />
          <text x="34" y="64" className="diag-title">空间离散格式数值耗散特性</text>
          <line x1="42" y1="176" x2="278" y2="176" className="diag-axis" />
          <line x1="42" y1="176" x2="42" y2="84" className="diag-axis" />
          <polyline points="46,166 146,166 146,96 268,96" fill="none" className="diag-dashed" />
          <path d="M 46 164 C 102 162, 126 144, 146 130 C 166 116, 196 100, 268 98" fill="none" className="diag-curve-warm" />
          <path d="M 46 166 L 136 165 L 154 98 L 268 96" fill="none" className="diag-curve-accent" />
          <text x="160" y="88" className="diag-small">精确阶跃 ————</text>
          <text x="172" y="128" className="diag-small">一阶迎风（抹平梯度/最稳）</text>
          <text x="52" y="142" className="diag-label">二阶迎风 / QUICK (高精度工程标配)</text>
          <text x="34" y="218" className="diag-small">发散先用 First-Order 稳态拉通，再切 Second-Order！</text>

          <rect x="314" y="44" width="286" height="192" rx="7" className="diag-box diag-box-active" />
          <text x="328" y="64" className="diag-title">Pressure-Velocity Coupling 算法对比</text>
          <rect x="330" y="80" width="254" height="44" rx="5" className="diag-node-accent" />
          <text x="457" y="99" textAnchor="middle" className="diag-label">Coupled (同步耦合求解动量+连续性)</text>
          <text x="457" y="116" textAnchor="middle" className="diag-small">稳态/浮升强耦合收敛快，内存略高 (~1.5×)</text>
          <rect x="330" y="134" width="254" height="44" rx="5" className="diag-node" />
          <text x="457" y="153" textAnchor="middle" className="diag-label">SIMPLE / SIMPLEC (分离迭代省内存)</text>
          <text x="457" y="170" textAnchor="middle" className="diag-small">需合理设置亚松弛因子 URF 防高频震荡</text>
          <rect x="330" y="188" width="254" height="36" rx="5" className="diag-node-warm" />
          <text x="457" y="210" textAnchor="middle" className="diag-small">PISO (含邻域修正)：强烈推荐小时间步瞬态算例</text>
        </>
      )
    }

    case 'uds-transport': {
      return (
        <>
          <text x="20" y="24" className="diag-heading">User-Defined Scalars (UDS) 对流-扩散方程跨窗口联动模型</text>
          <rect x="24" y="44" width="572" height="50" rx="6" className="diag-node-accent" />
          <text x="310" y="66" textAnchor="middle" className="diag-title">∂(ρ φ_k)/∂t + ∇·(ρ F φ_k - Γ_k ∇φ_k) = S_φk   (k = 0, 1, …, N_uds - 1)</text>
          <text x="310" y="84" textAnchor="middle" className="diag-small">F = 对流通量函数 (Mass Flow Rate / None) · Γ_k = 材料扩散系数 · S = 单元区体源项</text>

          <rect x="24" y="114" width="170" height="122" rx="6" className="diag-box diag-box-active" />
          <text x="109" y="136" textAnchor="middle" className="diag-title">1. UDM / UDS 对话框</text>
          <text x="36" y="160" className="diag-small">设定标量个数 ≥ 1</text>
          <text x="36" y="178" className="diag-small">选择对流通量函数 F 与</text>
          <text x="36" y="196" className="diag-small">瞬态项及求解流体域范围</text>
          <text x="36" y="218" className="diag-label">当前状态: {activeModel || 'UDS = 0'}</text>

          <line x1="194" y1="174" x2="226" y2="174" className="diag-arrow" markerEnd={`url(#${m.accent})`} />

          <rect x="228" y="114" width="174" height="122" rx="6" className="diag-box" />
          <text x="315" y="136" textAnchor="middle" className="diag-title">2. Materials 物性联动</text>
          <text x="240" y="160" className="diag-small">在流体/固体属性中解锁：</text>
          <text x="240" y="182" className="diag-label">UDS Diffusivity (Γ_k)</text>
          <text x="240" y="204" className="diag-small">可按常数或 UDF 输入扩散率</text>

          <line x1="402" y1="174" x2="430" y2="174" className="diag-arrow" markerEnd={`url(#${m.accent})`} />

          <rect x="432" y="114" width="164" height="122" rx="6" className="diag-box" />
          <text x="514" y="136" textAnchor="middle" className="diag-title">3. 边界条件自动联动</text>
          <text x="444" y="160" className="diag-small">所有 Inlet / Outlet / Wall</text>
          <text x="444" y="182" className="diag-label">自动新增 [UDS] 选项卡</text>
          <text x="444" y="204" className="diag-small">切换 Specified Value φ₀</text>
          <text x="444" y="220" className="diag-small">或 Specified Flux ∂φ/∂n</text>
        </>
      )
    }

    case 'surface-mesh-cad': {
      return (
        <>
          <text x="20" y="24" className="diag-heading">Watertight CAD 共享拓扑共节点传递与尺寸函数控制原理</text>
          <rect x="20" y="42" width="280" height="196" rx="7" className="diag-box diag-box-active" />
          <text x="34" y="64" className="diag-title">Share Topology (共享拓扑共节点)</text>
          <rect x="40" y="84" width="110" height="72" className="diag-shade-accent" />
          <rect x="150" y="84" width="130" height="72" className="diag-shade-warm" />
          <circle cx="150" cy="102" r="4" className="diag-particle" />
          <circle cx="150" cy="120" r="4" className="diag-particle" />
          <circle cx="150" cy="138" r="4" className="diag-particle" />
          <text x="95" y="124" textAnchor="middle" className="diag-label">流体区</text>
          <text x="215" y="124" textAnchor="middle" className="diag-label">固体区</text>
          <text x="34" y="178" className="diag-small">• 交界面网格点一一重合共节点（Conformal）</text>
          <text x="34" y="196" className="diag-small">• 消除非共形插值误差，热通量守恒最优</text>
          <text x="34" y="214" className="diag-small">• 导几何前务必去除微小倒角与极窄缝隙</text>

          <rect x="316" y="42" width="284" height="196" rx="7" className="diag-box" />
          <text x="330" y="64" className="diag-title">Curvature &amp; Proximity 局部尺寸加密</text>
          <path d="M 340 120 Q 375 74 415 112" fill="none" className="diag-curve-accent" />
          <circle cx="358" cy="100" r="3" className="diag-particle" />
          <circle cx="375" cy="91" r="3" className="diag-particle" />
          <circle cx="394" cy="94" r="3" className="diag-particle" />
          <text x="430" y="106" className="diag-small">Curvature Normal Angle (12°–18°)</text>
          <line x1="340" y1="146" x2="565" y2="146" className="diag-wall" />
          <line x1="340" y1="176" x2="565" y2="176" className="diag-wall" />
          <line x1="340" y1="156" x2="565" y2="156" className="diag-mesh" />
          <line x1="340" y1="166" x2="565" y2="166" className="diag-mesh" />
          <text x="330" y="196" className="diag-small">• Proximity Gaps：窄缝/管径至少保证 2–3 层单元</text>
          <text x="330" y="214" className="diag-small">• 面网格 Max Skewness 建议控制在 &lt; 0.7</text>
        </>
      )
    }

    case 'volume-mesh-layers': {
      return (
        <>
          <text x="20" y="24" className="diag-heading">Poly-Hexcore 混合核心拓扑、棱柱边界层与正交质量几何意义</text>
          <rect x="20" y="42" width="288" height="196" rx="7" className="diag-box diag-box-active" />
          <text x="34" y="64" className="diag-title">Poly-Hexcore + Smooth Transition 棱柱层</text>
          <line x1="36" y1="212" x2="290" y2="212" className="diag-wall" />
          <line x1="36" y1="204" x2="290" y2="204" className="diag-mesh" />
          <line x1="36" y1="192" x2="290" y2="192" className="diag-mesh" />
          <line x1="36" y1="176" x2="290" y2="176" className="diag-mesh" />
          <rect x="64" y="84" width="60" height="44" className="diag-shade-accent" />
          <rect x="124" y="84" width="60" height="44" className="diag-shade-accent" />
          <rect x="184" y="84" width="60" height="44" className="diag-shade-accent" />
          <polygon points="74,176 98,144 134,144 152,176" className="diag-shade-warm" />
          <polygon points="152,176 174,144 214,144 236,176" className="diag-shade-warm" />
          <text x="154" y="110" textAnchor="middle" className="diag-label">核心八叉树 Hexcore (低数值扩散)</text>
          <text x="154" y="164" textAnchor="middle" className="diag-small">Poly 过渡层</text>
          <text x="34" y="230" className="diag-small">高长宽比贴壁棱柱 (Growth ≈ 1.2) + 核心正交六面体</text>

          <rect x="324" y="42" width="276" height="196" rx="7" className="diag-box" />
          <text x="338" y="64" className="diag-title">体网格正交质量 (Orthogonal Quality)</text>
          <polygon points="354,172 418,98 498,162" className="diag-node" />
          <circle cx="424" cy="144" r="3.5" className="diag-particle" />
          <line x1="424" y1="144" x2="490" y2="122" className="diag-arrow" markerEnd={`url(#${m.accent})`} />
          <line x1="424" y1="144" x2="478" y2="96" className="diag-arrow" markerEnd={`url(#${m.warm})`} />
          <text x="498" y="114" className="diag-small">面法向 A_f</text>
          <text x="484" y="92" className="diag-small">体心连线 c_i</text>
          <text x="338" y="198" className="diag-small">• cos θ = (A_f · c_i) / (|A_f| |c_i|) 越近 1 越佳</text>
          <text x="338" y="216" className="diag-small">• 工程红线：Min Orthogonal Quality &gt; 0.15</text>
          <text x="338" y="232" className="diag-small">• 体网格偏斜度 Max Skewness 建议 &lt; 0.90</text>
        </>
      )
    }
  }
}

export function FluentTeachingDiagram({ spec, compact = false }: Props) {
  const uid = useId().replace(/:/g, '')
  const markerIds: MarkerIds = {
    ink: `diag-ink-${uid}`,
    accent: `diag-acc-${uid}`,
    warm: `diag-warm-${uid}`,
  }

  return (
    <figure className={compact ? 'fluent-teaching-diagram-card compact' : 'fluent-teaching-diagram-card'}>
      <div className="fluent-teaching-diagram-head">
        <strong>{spec.title}</strong>
        {spec.activeModel && (
          <span className="fluent-teaching-diagram-badge">{spec.activeModel}</span>
        )}
      </div>
      <svg
        className="fluent-teaching-diagram-svg"
        viewBox="0 0 620 260"
        role="img"
        aria-label={spec.title}
      >
        <defs>
          <marker id={markerIds.ink} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 1.5 L 8.5 5 L 0 8.5 z" fill="var(--fl-ink, #1e293b)" />
          </marker>
          <marker id={markerIds.accent} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 1.5 L 8.5 5 L 0 8.5 z" fill="#0b7285" />
          </marker>
          <marker id={markerIds.warm} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 1.5 L 8.5 5 L 0 8.5 z" fill="#d9480f" />
          </marker>
        </defs>
        <DiagramSvgBody kind={spec.kind} m={markerIds} activeModel={spec.activeModel} />
      </svg>
      <figcaption className="fluent-teaching-diagram-caption">
        <span>{spec.caption}</span>
        {spec.highlights && spec.highlights.length > 0 && (
          <span className="fluent-teaching-diagram-tags">
            {spec.highlights.map((item) => (
              <span key={item} className="fluent-teaching-diagram-tag">{item}</span>
            ))}
          </span>
        )}
      </figcaption>
    </figure>
  )
}
