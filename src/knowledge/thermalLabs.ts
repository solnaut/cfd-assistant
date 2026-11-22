export const thermalLabs = [
  { id: 'brayton', title: '布雷顿热力循环', description: '调压比、入口温度及部件效率，查看 T–s 轨迹、净功和热效率。',
    keywords: ['Brayton', '燃气轮机', '热力循环', 'T-s'],
    lesson: '/knowledge/engineering-thermodynamics/td-gas-cycles-moist-air',
    source: { label: 'MIT Unified Engineering · Brayton Cycle', url: 'https://web.mit.edu/16.unified/www/FALL/thermodynamics/notes/node28.html' } },
  { id: 'refrigeration', title: 'R134a 蒸气压缩制冷', description: '调蒸发、冷凝、过热、过冷及效率，查看压焓图、COP、压缩功和排气温度。',
    keywords: ['制冷循环', 'COP', '压焓图实验', 'lg p-h', 'R134a'],
    lesson: '/knowledge/refrigeration-principles/ref-vapor-compression',
    source: { label: 'CoolProp · R134a 物性', url: 'https://coolprop.org/fluid_properties/fluids/R134a.html' } },
  { id: 'exchanger', title: '换热器 LMTD 与 ε–NTU', description: '比较顺流、逆流和叉流，观察出口温度、沿程分布、效能与面积。',
    keywords: ['换热器实验', 'LMTD', 'NTU', 'pinch', '逆流', '叉流'],
    lesson: '/knowledge/heat-transfer/ht-heat-exchangers',
    source: { label: 'MIT OCW · Heat Exchangers', url: 'https://ocw.mit.edu/courses/16-050-thermal-energy-fall-2002/87d9f4544b7fd64a77201382500d057c_10_part3.pdf' } },
] as const
