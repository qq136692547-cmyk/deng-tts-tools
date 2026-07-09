import os

# Fix Fee Calculator HTML
path = 'tools/tiktok-fee-calculator/index.html'
with open(path, 'r', encoding='utf-8') as f:
    html = f.read()

# Replace category dropdown
html = html.replace(
    'value="0.08" selected>Default / Beauty / Home / Toys / Sports (8%)',
    'value="0.06" selected>All categories (6%)'
)
# Update the hint
html = html.replace(
    'TikTok Shop\'s 2026 fee varies by category',
    'Unified 6% flat fee for all US categories'
)

# Add FBT tier before shipping
html = html.replace(
    '<label for="shippingCharged">Shipping charged</label>\n              <input type="number" id="shippingCharged"',
    '<label for="fbtTier">FBT fulfillment (per unit)</label>\n              <select id="fbtTier">\n                <option value="2.86">Multi-item ($2.86/unit)</option>\n                <option value="3.20" selected>Standard single ($3.20/unit)</option>\n                <option value="3.58">Large single ($3.58/unit)</option>\n              </select>\n              <span class="hint">Fulfilled by TikTok</span>\n            </div>\n            <div class="form-row">\n              <label for="shippingCharged">Shipping charged</label>\n              <input type="number" id="shippingCharged"'
)

# Remove old payment processing rows
html = html.replace('Payment processing fee', 'Refund admin fee')
html = html.replace('1.8%\n              <span class="hint">Additional processing', '20% of referral fee (capped at $5)\n              <span class="hint">TikTok refund admin')

# Add FBT row in results table
html = html.replace(
    '<td>Payment processing</td>\n              <td id="r_payment"></td>',
    '<td>Payment processing</td>\n              <td id="r_payment">included</td>'
)

html = html.replace(
    '<td>Referral fee (6%)</td>\n              <td id="r_base"></td>',
    '<td>Referral fee (6%)</td>\n              <td id="r_base"></td>\n            </tr>\n            <tr>\n              <td>FBT fulfillment</td>\n              <td id="r_fbt"></td>'
)

with open(path, 'w', encoding='utf-8') as f:
    f.write(html)
print('Fee Calculator HTML fixed')

# Fix Profit Calculator HTML
path2 = 'tools/tiktok-profit-calculator/index.html'
with open(path2, 'r', encoding='utf-8') as f:
    html2 = f.read()

html2 = html2.replace(
    'value="0.08" selected>Default (8%)',
    'value="0.06" selected>All categories (6%)'
)
html2 = html2.replace(
    'TikTok category commission rate',
    'Unified 6% flat fee for all US categories'
)
html2 = html2.replace(
    '<label for="ship">Shipping cost</label>',
    '<label for="fbtTier">FBT fulfillment</label>\n              <select id="fbtTier">\n                <option value="2.86">Multi-item ($2.86)</option>\n                <option value="3.20" selected>Standard single ($3.20)</option>\n                <option value="3.58">Large single ($3.58)</option>\n              </select>\n              <span class="hint">Mandatory FBT</span>\n            </div>\n            <div class="form-row">\n              <label for="ship">Shipping cost</label>'
)
html2 = html2.replace('r_return_handling', 'r_return_fee')

with open(path2, 'w', encoding='utf-8') as f:
    f.write(html2)
print('Profit Calculator HTML fixed')

# Fix vs Amazon HTML
path3 = 'tools/tiktok-vs-amazon/index.html'
with open(path3, 'r', encoding='utf-8') as f:
    html3 = f.read()

html3 = html3.replace(
    '<label for="creator">Creator commission (%)</label>',
    '<label for="fbtTier">FBT fulfillment</label>\n              <select id="fbtTier">\n                <option value="2.86">Multi-item ($2.86)</option>\n                <option value="3.20" selected>Standard single ($3.20)</option>\n                <option value="3.58">Large single ($3.58)</option>\n              </select>\n              <span class="hint">Mandatory FBT</span>\n            </div>\n            <div class="form-row">\n              <label for="creator">Creator commission (%)</label>'
)

with open(path3, 'w', encoding='utf-8') as f:
    f.write(html3)
print('vs Amazon HTML fixed')