# Fluent 入口湍流参数

- 依据 [Fluent 2024 R2 User’s Guide §7.4.2.1](https://ansyshelp.ansys.com/public/Views/Secured/corp/v242/en/flu_ug/flu_ug_bcs_sec_bound_cond.html#flu_ug_ke_params)。水力直径法使用长度尺度估算，黏度比法使用入口湍流黏度与动力黏度之比。
- 量纲自检使用 SI 单位。输入 10 m/s、5%，得到 `k = 0.375 m²/s²`。输入 0.10 m 水力直径，长度尺度为 0.007 m。将派生黏度比原样带入另一模式，应得到同一组耗散量。
- 这是入口估算关系。模型适用性、入口剖面及数据仍需按具体工况核对。
