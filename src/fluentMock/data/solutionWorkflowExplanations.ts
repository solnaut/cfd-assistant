import type { FluentMockExplanation } from '../fluentTypes'

type Guidance = Pick<FluentMockExplanation, 'whatItIs' | 'recommendation' | 'whenToUse' | 'checkItems' | 'commonMistakes'>
type SourcedGuidance = Guidance & Pick<FluentMockExplanation, 'sourceUrl' | 'sourceStatus'>

const guide = 'https://ansyshelp.ansys.com/public/Views/Secured/corp/v242/en/flu_ug/'
const initialization = guide + 'flu_ug_solution_initialization_task_page.html'
const calculation = guide + 'flu_ug_run_calculation_task_page.html'
const reporting = guide + 'flu_ug_reporting_sec_monitoring_solution.html'
const file = guide + 'flu_ug_file_menu.html'
const boundaries = guide + 'flu_ug_boundary_conditions_task_page.html'
const zones = guide + 'flu_ug_cell_zone_conditions_task_page.html'
const graphics = guide + 'flu_ug_ribbon_dialog.html'
const entries: Record<string, SourcedGuidance> = {}

function record(ids: string[], sourceUrl: string, guidance: Guidance) {
  for (const id of ids) entries[id + '-explanation'] = { ...guidance, sourceUrl, sourceStatus: 'source-checked' }
}

record(['cell-zone-source', 'cell-zone-source-enable', 'cell-zone-fluid-source-terms'], zones + '#flu_ug_Fluid', {
  whatItIs: '流体区域的 Source Terms 用于指定体积源项。开启后才可以进入 Source Terms 页签。',
  recommendation: '在对应的流体区域启用源项，再选择需要添加源项的方程。',
  whenToUse: '已知某个流体区域需要额外的质量、动量、能量或其他方程源项时。',
  checkItems: ['确认目标单元区域', '核对源项采用的体积单位及正负号'],
  commonMistakes: '把体积源项和区域总源量混用。',
})

record(['cell-zone-solid-source-enable', 'cell-zone-solid-heat-generation'], zones + '#flu_ug_Solid', {
  whatItIs: 'Solid Zone 的 Source Terms 用于指定固体区域的体积能量源项。',
  recommendation: '启用 Source Terms 后，在对应页签输入体积热源。',
  whenToUse: '固体区域内部有需要纳入能量方程的发热或吸热时。',
  checkItems: ['核对区域材料', '确认体积热源的单位'],
  commonMistakes: '在 W/m³ 的输入中直接填写以 W 表示的发热功率。',
})

record(['contours-coloring', 'contours-auto-range', 'contours-min-val', 'contours-max-val'], graphics + '#flu_ug_Contours', {
  whatItIs: 'Banded 用分段颜色显示云图，Smooth 使用连续过渡。Auto Range 决定是否自动获取色标范围。',
  recommendation: '比较多个工况时，可关闭 Auto Range 并统一上下限。',
  whenToUse: '需要调整云图的色带或比较各工况的空间分布时。',
  checkItems: ['确认各图选用相同变量和单位', '检查最小值小于最大值'],
  commonMistakes: '在对比两张彩图前遗漏检查色标范围。',
})

record(['vectors-style', 'vectors-color-by', 'vectors-scale', 'vectors-skip'], graphics + '#flu_ug_Vectors', {
  whatItIs: 'Style 改变矢量符号，Scale 调节符号尺度，Skip 调节抽样间隔，Color By 选择着色变量。',
  recommendation: '图形过密时可增加 Skip。改变着色变量后同时核对其单位。',
  whenToUse: '用矢量图查看流向及相关变量分布时。',
  checkItems: ['区分矢量场与着色变量', '检查抽样是否保留关注区域的主要结构'],
  commonMistakes: '把显示符号尺度当成对计算速度的修改。',
})

record(['initialization-hybrid', 'initialization-method'], initialization, {
  whatItIs: '选择 Hybrid 初始化方法。执行 Initialize 时，它为流场构造初始解，包括由 Laplace 方程得到的速度与压力初场。',
  recommendation: '选择方法后，再点击 Initialize 执行。',
  whenToUse: '需要为算例构造初始场时。',
  checkItems: ['检查 Console 是否报告完成初始化', '需要写入局部值时再执行 Patch'],
  commonMistakes: '选中 Hybrid 单选项后直接开始计算，遗漏执行 Initialize。',
})

record(['initialization-standard', 'initialization-standard-dialog', 'initialization-compute-from', 'initialization-compute-from-dialog'], initialization, {
  whatItIs: 'Standard Initialization 使用指定的初始值。Compute From 可以从所选边界或区域计算供初始化使用的初值。',
  recommendation: '选择 Compute From 后核对初值来源与参考系，再执行 Initialize。',
  whenToUse: '已知要采用的初值，或希望用某个边界的状态作为全场初值时。',
  checkItems: ['核对 Compute From 选择', '旋转域中确认速度参考系'],
  commonMistakes: '误以为 Compute From 只初始化所选边界相邻的单元。',
})

record(['initialization-fmg', 'ribbon-initialize-fmg', 'fmg-levels', 'fmg-courant', 'fmg-initialize'],
  guide + 'flu_ug_sec_fmg_multigrid.html#x1-180100027.13.1', {
    whatItIs: 'Full Multigrid 从已有流场出发，使用多重网格过程改善初始解。',
    recommendation: '先执行 Hybrid 或 Standard 初始化，或读入有效流场数据，再配置并运行 FMG。',
    whenToUse: '已有初场并希望进一步改善初始解时。',
    checkItems: ['确认已有初场', '核对网格层数和 FMG Courant 数'],
    commonMistakes: '把 FMG 当作无需已有初场的 Hybrid 初始化。',
  })

record(['run-check-case', 'ribbon-check-case', 'run-calculate', 'run-calculation-calculate'], calculation, {
  whatItIs: 'Check Case 用于检查算例设置。Calculate 从当前流场推进迭代或时间步。',
  recommendation: '运行后还需结合残差和目标工程量判断解的表现。工作台显示的是教学示例。',
  whenToUse: '完成模型、边界条件和初场设置后。',
  checkItems: ['确认当前采用稳态还是瞬态', '检查输出的残差和工程量监控记录'],
  commonMistakes: '把完成预设迭代数或通过 Check Case 当成已经收敛。',
})

record(['run-time-step-inline', 'run-calculation-time-step', 'run-transient-steps', 'run-calculation-time-steps',
  'run-max-iterations-inline', 'run-calculation-max-iterations'], calculation, {
  whatItIs: '固定时间步设置中，Time Step Size 决定每步推进的物理时间，Number of Time Steps 决定推进步数，Max Iterations/Time Step 限制步内迭代次数。',
  recommendation: '依据需要分辨的时间尺度设置步长，并检查每步迭代是否达到目标判据。',
  whenToUse: '使用固定步长推进瞬态求解时。',
  checkItems: ['步长以秒输入', '步数和步内最大迭代次数应为正整数'],
  commonMistakes: '把步内最大迭代数当成时间步数，或认为每一步都一定用满上限。',
})

record(['run-reporting-interval'], calculation, {
  whatItIs: '稳态 Reporting Interval 控制残差打印、绘图和残差收敛检查的迭代间隔。',
  recommendation: '单独配置 Report Definitions 使用的采样频率。',
  whenToUse: '调整稳态残差输出和检查频率时。',
  checkItems: ['确认间隔单位是迭代次数', '确认残差收敛检查的时间点符合预期'],
  commonMistakes: '用 Reporting Interval 控制所有报告定义的收敛检查。',
})

const timeFields = ['run-time-type', 'run-fixed-method', 'run-adaptive-method', 'run-period',
  'run-frequency', 'run-steps-per-period', 'run-total-periods', 'run-adaptive-initial',
  'run-adaptive-courant', 'run-adaptive-error', 'run-multiphase-courant', 'run-adaptive-settings']
record([...timeFields, ...timeFields.map((id) => id + '-dialog'), 'run-min-time-step', 'run-max-time-step',
  'run-min-change-factor', 'run-max-change-factor'], calculation, {
  whatItIs: 'Fixed 方法可以直接给定步长，也可以把一个周期按设定步数均分。Adaptive 方法使用 CFL、截断误差或多相条件来选择步长。',
  recommendation: '核对所选时间推进方法。使用 Adaptive 时检查初始步长是否落在最小和最大步长之间。',
  whenToUse: '设置瞬态求解的时间推进方式时。',
  checkItems: ['核对周期、频率或初始步长的单位', '确认当前模型支持所选方法'],
  commonMistakes: '把 Adaptive 的初始步长当成所有后续时间步的固定值。',
})

record(['ribbon-read-mesh', 'read-mesh-mode', 'read-mesh-show-scale'], file, {
  whatItIs: 'Read Mesh Options 可读入新网格并丢弃 case/data，也可保留案例设置、替换网格并丢弃旧流场数据。',
  recommendation: '按是否需要复用当前案例设置选择。替换后可自动打开 Scale Mesh 核对尺度。',
  whenToUse: '导入新网格，或在现有设置下更换网格时。',
  checkItems: ['确认是否需要保留案例设置', '替换后重新核对区域和网格单位'],
  commonMistakes: '认为替换网格会自动保留旧网格上的流场数据。',
})

record(['ribbon-write-journal', 'ribbon-stop-journal', 'ribbon-write-transcript', 'ribbon-stop-transcript'], file, {
  whatItIs: 'Journal 记录用于重放的 Fluent 命令。Transcript 记录交互输入和输出。开始记录后，该项目会切换为 Stop。',
  recommendation: '按是否需要重放命令选择记录类型。',
  whenToUse: '需要复现实操步骤或保留控制台记录时。',
  checkItems: ['确认记录正在进行', '结束时使用对应的 Stop 操作'],
  commonMistakes: '把 Transcript 当作 Journal 读入以重放命令。',
})

record(['ribbon-export-during', 'ribbon-export-during-solution', 'ribbon-export-during-particles'], file, {
  whatItIs: '此自动导出入口用于瞬态计算。在计算过程中按设定间隔导出结果。',
  recommendation: '先选择 Transient，再配置导出内容和间隔。',
  whenToUse: '需要保存多个时刻的流场或颗粒轨迹输出时。',
  checkItems: ['核对输出变量、区域和频率', '导出颗粒历史时检查离散相和注入设置'],
  commonMistakes: '把计算期间的自动导出与一次性 Solution Data 导出混为同一操作。',
})

record(['bc-mass-flow-outlet', 'mass-flow-outlet-method', 'mass-flow-outlet-corrected-rate',
  'mass-flow-outlet-corrected-temperature', 'mass-flow-outlet-corrected-pressure'], boundaries, {
  whatItIs: 'Mass-Flow Outlet 可以按质量流量、质量通量或修正质量流量指定出口。修正方式还需要参考温度和参考表压。',
  recommendation: '根据已知的边界量选择指定方式，核对数值单位和参考条件。',
  whenToUse: '算例已知所选出口的质量流量条件且该边界类型可用时。',
  checkItems: ['分清质量流量和单位面积质量通量', '采用修正质量流量时核对参考温度和压力'],
  commonMistakes: '把压力出口的静压直接作为修正质量流量的唯一输入。',
})

record(['bc-porous-jump', 'porous-jump-permeability', 'porous-jump-thickness', 'porous-jump-coefficient'], boundaries, {
  whatItIs: 'Porous Jump 是以面处理薄阻力层的边界设置，输入包含渗透率、厚度和压降系数。',
  recommendation: '使用与目标介质、单位和定义一致的数据填写参数。',
  whenToUse: '用薄阻力面的近似处理局部流动阻力时。',
  checkItems: ['核对渗透率和厚度的单位', '确认该工况适合用面代替具有体积的多孔区域'],
  commonMistakes: '把 Porous Jump 的面参数直接填成 Porous Zone 的体阻力设置。',
})

record(['materials-copy-database', 'database-material-type', 'database-fluid-material',
  'database-solid-material', 'database-material-copy'], guide + 'flu_ug_materials_task_page.html', {
  whatItIs: 'Fluent Database Materials 可筛选材料类别、查看数据库材料，并将选中的材料复制到当前案例。',
  recommendation: '先选择流体或固体类别。复制后在当前案例核对材料名称和适用的物性数据。',
  whenToUse: '准备从材料数据库取一个已有材料条目时。',
  checkItems: ['确认材料类别正确', '检查材料已出现在当前案例列表中'],
  commonMistakes: '把复制材料和将材料分配给某个区域当成同一步。',
})

record(['run-data-quantities', 'autosave-data-quantities', 'ribbon-file-data-quantities', 'data-quantities-velocity',
  'data-quantities-mach', 'data-quantities-total-pressure'], guide + 'flu_ug_sec_files_data_file_options.html', {
  whatItIs: 'Data File Quantities 用于为旧版 data 文件选择附加后处理量。文件仍包含标准量。',
  recommendation: '按目标后处理工具的需求勾选附加量。输出时核对是否选择了旧版文件格式。',
  whenToUse: '向依赖旧版 Fluent data 文件的后处理流程提供附加量时。',
  checkItems: ['确认文件格式', '确认目标后处理量已经包括在输出设置中'],
  commonMistakes: '把 Data File Quantities 当成自动保存的频率设置。',
})

record(['ribbon-report-defs', 'report-definition-force', 'report-definition-surface', 'report-definition-flux',
  'report-definition-type', 'report-definition-surfaces', 'report-force-vector', 'report-surface-variable'],
  reporting + '#flu_ug_sec_report_definition_creation', {
    whatItIs: 'Report Definition 定义要监控的量及其计算位置，例如壁面力、表面面积加权平均或质量流率。',
    recommendation: '按目标量选取报告类型、区域和对应的方向或变量。',
    whenToUse: '需要在求解期间跟踪目标量，或复用同一报告设置时。',
    checkItems: ['确认方向、变量和区域与目标一致', '确认定义已保存并被需要的输出引用'],
    commonMistakes: '用速度的面积加权平均替代质量流量报告。',
  })

for (const [kind, ids, anchor, description, mistake] of [
  ['Report Plot', ['ribbon-report-plots', 'monitors-report-plots', 'report-plot-new', 'report-plot-definition',
    'report-plot-destination', 'report-plot-every', 'report-plot-basis', 'report-plot-display'],
    'flu_ug_sec_create_report_plots', '把选定报告定义的采样值显示成曲线。', '把预览图中的示例值当作真实流场的报告值。'],
  ['Report File', ['ribbon-report-files', 'monitors-report-files', 'report-file-new', 'report-file-definition',
    'report-file-destination', 'report-file-every', 'report-file-basis'],
    'flu_ug_sec_create_report_files', '按指定频率把所选报告定义的值记录到文件。', '把报告文件当作能够重启求解的 case/data。'],
] as const) {
  record([...ids], reporting + '#' + anchor, {
    whatItIs: kind + ' ' + description,
    recommendation: '先保存至少一个报告定义，再配置输出。瞬态下核对频率是按迭代、时间步还是流动时间。',
    whenToUse: '需要保留求解过程中工程量的变化记录时。',
    checkItems: ['确认已选报告定义', '核对采样间隔和频率类型'],
    commonMistakes: mistake,
  })
}

export const solutionWorkflowExplanations = entries
