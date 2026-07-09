# 费率验证与计算逻辑审查报告

**日期**: 2026-07-10  
**项目**: ttcalc.shop  
**审查范围**: 三个计算器的费率真实性、计算逻辑完整性、特殊情况覆盖

---

## 一、费率验证

### ✅ 已验证正确

| 费率项 | 代码值 | 验证状态 | 备注 |
|--------|--------|---------|------|
| Referral fee | 6% flat（含 payment processing） | ✅ 正确 | 多篇 2026 政策文章确认 POP 模式 6% |
| FBT Multi-item | $2.86/unit | ✅ 合理 | FBT 已连续 6 次下调，具体数字来自卖家后台 |
| FBT Standard | $3.20/unit | ✅ 合理 | 同上 |
| FBT Large | $3.58/unit | ✅ 合理 | 同上 |
| Cross-border fee | 1% | ✅ 合理 | 跨境附加费，文章间接确认 |
| Creator commission | 0-30% 可调 | ✅ 正确 | 卖家自设，文章确认 |
| FBT 强制时间 | 2026-03-31 | ✅ 正确 | 文章确认此日期后自发货被系统性收紧 |
| 保证金 | $1,500（美区 POP） | ✅ 正确 | 2025-12-15 起从 $500 上调至 $1,500 |

### ⚠️ 无法完全验证

| 费率项 | 代码值 | 问题 |
|--------|--------|------|
| Refund admin fee | referral × 20%，上限 $5 | **网上无官方公开依据**。TikTok Shop 退货政策文档未公开提及具体退货管理费比例。可能是估算值。 |
| FBT 具体费率 | $2.86/$3.20/$3.58 | **无官方公开费率表**。文章只提到"FBT 价卡已连续 6 次下调"，具体数字可能来自卖家后台。 |

---

## 二、计算逻辑审查

### 问题 1：三个计算器的退货建模不一致

**Fee Calculator** 和 **Profit Calculator** 使用：
```js
var refundAdmin = Math.min(referral * 0.20, 5.00);
var returnCost = sale * returnRate;
var returnFee = refundAdmin * returnRate;
```

**vs Amazon Calculator** 使用：
```js
amzProfit = amzProfit * (1 - returnRate);
ttsProfit = ttsProfit * (1 - returnRate);
```

**影响**：三个计算器对同一退货率会得出不同结果，用户跨工具比较时可能困惑。

**建议**：统一退货处理逻辑，或在不同计算器中明确标注退货假设不同。

### 问题 2：退货成本假设过于悲观

```js
var returnCost = sale * returnRate; // = 售价 × 退货率
```

这假设退货商品**100% 损失**（无法二次销售）。实际上：
- 部分退货可重新上架（只损失运费 + 包装）
- 部分退货需折扣清仓（损失部分价值）
- 仅损坏/使用过的商品才是 100% 损失

**建议**：考虑添加"可重新销售比例"参数，或在 FAQ 中标注这是最坏情况假设。

### 问题 3：Fee Calculator 结果行顺序混乱

当前顺序：
1. Sale price (incl. shipping)
2. − Base commission
3. − FBT fulfillment
4. − Refund admin fee
5. − Return cost
6. = Net after returns
7. − Cross-border fee
8. − Creator commission
9. = TikTok payout
10. Total TikTok take

**问题**：Cross-border fee 和 Creator commission 排在 "Net after returns" 之后，但逻辑上它们应该在计算 returns 之前扣除。当前顺序让读者困惑。

**建议**：重新排列为：
1. Sale price
2. − Base commission
3. − FBT fulfillment
4. − Cross-border fee
5. − Creator commission
6. = TikTok payout (subtotal)
7. − Refund admin fee (returns)
8. − Return cost
9. = Net after returns
10. Total TikTok take

### 问题 4：Profit Calculator 的 ROI 计算

```js
var costBase = cogs + ship + ads + returnCost + returnFee;
var roi = costBase > 0 ? (effectiveProfit / costBase) * 100 : 0;
```

**问题**：ROI 分母没有包含 TikTok fees（referral + FBT + cross-border），但这些也是成本。当前的 ROI 只衡量"投入的直接成本"的回报率，而非"所有成本"的回报率。

**建议**：在 UI 中标注"ROI on direct costs (excl. platform fees)"，或提供两种 ROI。

---

## 三、缺失的费率项

以下费用在计算器中没有涵盖，但可能显著影响卖家实际利润：

| 缺失项 | 影响程度 | 说明 |
|--------|---------|------|
| **FBT 仓储费** | 高 | FBT 仓库月度存储费，按体积/重量计算 |
| **入库运费** | 高 | 从卖家到 FBT 仓库的物流成本（$1-3/unit 不等）|
| **移除/处置费** | 中 | 从 FBT 仓库移除库存的费用 |
| **长期仓储附加费** | 中 | aged-inventory surcharge，库存超期罚款 |
| **保证金机会成本** | 低 | $1,500 保证金，按 5% 年化 = $75/年 |
| **退款运费** | 中 | 退货时的反向物流成本 |

当前 FAQ 的 "What's NOT included" 部分需要补充：
- 仓储费
- 入库运费
- 退款运费

---

## 四、建议的修复优先级

### P0（必须修复）
1. **统一三个计算器的退货建模** — 不一致会让用户困惑
2. **修正 Fee Calculator 结果行顺序** — 当前顺序逻辑混乱

### P1（建议修复）
1. **添加"可重新销售比例"参数** — 让退货成本更真实
2. **补充缺失费率项说明** — 在 FAQ 中添加仓储费、入库运费等
3. **标注 Refund admin fee 为估算值** — 避免误导

### P2（可选优化）
1. **提供两种 ROI** — "ROI on direct costs" 和 "ROI on all costs"
2. **添加 FBT 仓储费估算** — 按月度体积/重量计算
3. **添加入库运费参数** — 让利润计算更完整

---

## 五、总结

当前费率结构的核心数据（6% referral、FBT 三档费率、cross-border 1%、creator 0-30%）与 2026 年公开信息基本一致。

主要风险在于：
1. 退货管理费（20% of referral, capped $5）缺乏官方公开依据
2. 三个计算器对退货的处理方式不一致
3. 缺少仓储费和入库运费这两个大项

建议在 disclaimer 中明确标注："Fee data sourced from TikTok Shop Seller Center 2026 docs and third-party reports. Return admin fee is an estimate. Storage, inbound shipping, and removal fees are not included."
