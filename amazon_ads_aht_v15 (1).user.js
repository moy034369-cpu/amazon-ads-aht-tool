// ==UserScript==
// @name         Amazon Ads AHT Calculator v16
// @namespace    http://tampermonkey.net/
// @version      10.8
// @description  multi-region stable
// @author       You


// @match        https://advertising.amazon.com/*
// @match        https://advertising.amazon.co.uk/*
// @match        https://advertising.amazon.de/*
// @match        https://advertising.amazon.fr/*
// @match        https://advertising.amazon.it/*
// @match        https://advertising.amazon.es/*
// @match        https://advertising.amazon.co.jp/*
// @match        https://advertising.amazon.com.au/*
// @match        https://advertising.amazon.ca/*
// @match        https://advertising.amazon.com.mx/*

// @run-at       document-idle
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  // ═══════════════════════════════════════════════════════════════════════════
  //  Title → Rec Bucket
  // ═══════════════════════════════════════════════════════════════════════════
  const TITLE_MAP = [
    // ★ 顺序重要：具体词在前，宽泛词在后

    // ───── Budget Rule（必须在 budget 通用词前）─────
    { keywords: ['budget rule'],                                    bucket: 'Increase Budget' },

    // ───── Increase Budget ─────
    { keywords: ['budget recommendation'],                          bucket: 'Increase Budget' },  // 单复数均覆盖
    { keywords: ['out of budget'],                                  bucket: 'Increase Budget' },  // run out / go out / might go out
    { keywords: ['increase budget'],                                bucket: 'Increase Budget' },
    { keywords: ['bids greater than campaign daily budget'],        bucket: 'Increase Budget' },

      // ───── Change Campaign State ─────
{ keywords: ['campaign status recommendation'], bucket: 'Change Campaign State' },
{ keywords: ['campaign status recommendations'], bucket: 'Change Campaign State' },

    // ───── Optimize Bids ─────
    { keywords: ['rule-based bidding'],                             bucket: 'Optimize Bids' },
    { keywords: ['rule based bidding'],                             bucket: 'Optimize Bids' },
    { keywords: ['eligible and recommended for'],                   bucket: 'Optimize Bids' },  // "campaigns eligible and recommended for Rule Based Bidding"
    { keywords: ['audience bid boost'],                             bucket: 'Optimize Bids' },
    { keywords: ['audience bid'],                                   bucket: 'Optimize Bids' },  // 通用 audience bid 变体
    { keywords: ['audience target bid'],                            bucket: 'Optimize Bids' },
    { keywords: ['keyword bid'],                                    bucket: 'Optimize Bids' },
    { keywords: ['product target bid'],                             bucket: 'Optimize Bids' },
    { keywords: ['bidding strategy'],                               bucket: 'Optimize Bids' },
    { keywords: ['optimize bids'],                                  bucket: 'Optimize Bids' },
    { keywords: ['optimize bid'],                                   bucket: 'Optimize Bids' },
    { keywords: ['increase bids'],                                  bucket: 'Optimize Bids' },
    { keywords: ['increase bid'],                                   bucket: 'Optimize Bids' },
    { keywords: ['low roas in the last'],                           bucket: 'Optimize Bids' },
    { keywords: ['ads spend drop'],                                 bucket: 'Optimize Bids' },  // month-over-month ads spend drop
    { keywords: ['impression drop'],                                bucket: 'Optimize Bids' },  // MoM / month-over-month impression drop
    { keywords: ['0 clicks in the last'],                           bucket: 'Optimize Bids' },
    { keywords: ['no impressions in last 30 days'],                 bucket: 'Optimize Bids' },  // Adgroups in enabled campaigns with no impressions（注意：Optimize Bids）
    { keywords: ['bid recommendation'],                             bucket: 'Optimize Bids' },  // 兜底单复数
  { keywords: ['amazon business bid boost'],                      bucket: 'Optimize Bids' },  // "Amazon Business bid boost recommendations"
    { keywords: ['business bid boost'],                             bucket: 'Optimize Bids' },  // 兜底变体


    // ───── Placement Strategies ─────
    { keywords: ['bid-by-placement'],                               bucket: 'Placement Strategies' },
    { keywords: ['top of search bid'],                              bucket: 'Placement Strategies' },
    { keywords: ['top-of-search bid'],                              bucket: 'Placement Strategies' },
    { keywords: ['top-of-search'],                                  bucket: 'Placement Strategies' },
    { keywords: ['bid boosting'],                                   bucket: 'Placement Strategies' },  // "implementing bid boosting recommendations"

    // ───── Campaign Creation ─────
    { keywords: ['custom campaign'],                                bucket: 'Campaign Creation' },  // SP
    { keywords: ['reach relevant audience'],                        bucket: 'Campaign Creation' },  // SD
    { keywords: ['drive brand discovery'],                          bucket: 'Campaign Creation' },  // SB
    { keywords: ['campaign recommendation'],                        bucket: 'Campaign Creation' },  // SD/SB 单复数
    { keywords: ['brands recommendation'],                          bucket: 'Campaign Creation' },  // SB 无 campaign 变体
    { keywords: ['build new campaign'],                             bucket: 'Campaign Creation' },  // 单复数
    { keywords: ['build new campaigns for retail'],                 bucket: 'Campaign Creation' },
    { keywords: ['recommend new sponsored products campaign'],      bucket: 'Campaign Creation' },
    { keywords: ['sponsored brands keyword targeting campaign'],    bucket: 'Campaign Creation' },
    { keywords: ['create campaign'],                                bucket: 'Campaign Creation' },
    { keywords: ['new campaign'],                                   bucket: 'Campaign Creation' },  // 兜底

            // ───── Add New Targets ─────
{ keywords: ['keyword status'], bucket: 'Add New Targets' },
{ keywords: ['audience target status'], bucket: 'Add New Targets' },
{ keywords: ['product target status'], bucket: 'Add New Targets' },

    { keywords: ['add new target'],                                 bucket: 'Add New Targets' },   // 单复数
    { keywords: ['add new targets'],                                bucket: 'Add New Targets' },
    { keywords: ['budget utilization'],                             bucket: 'Add New Targets' },   // "less than 50% budget utilization"
    { keywords: ['no sales in last'],                               bucket: 'Add New Targets' },
    { keywords: ['less than 30 keyword'],                           bucket: 'Add New Targets' },   // 单复数
    { keywords: ['low discoverability'],                            bucket: 'Add New Targets' },
    { keywords: ['improve discoverability'],                        bucket: 'Add New Targets' },
    { keywords: ['no negative keyword'],                            bucket: 'Add New Targets' },   // 单复数
    { keywords: ['broad match keyword'],                            bucket: 'Add New Targets' },   // 单复数
    { keywords: ['campaigns with no impressions'],                  bucket: 'Add New Targets' },   // Campaign 级别（区别于 Adgroup 级别→Optimize Bids）
    { keywords: ['week-over-week'],                                 bucket: 'Add New Targets' },
    { keywords: ['>=1000 impressions'],                             bucket: 'Add New Targets' },
    { keywords: ['low impressions or clicks'],                      bucket: 'Add New Targets' },
    { keywords: ['low click through'],                              bucket: 'Add New Targets' },   // "low click through and conversion"
    { keywords: ['help more shoppers find'],                        bucket: 'Add New Targets' },
    { keywords: ['keyword recommendation'],                         bucket: 'Add New Targets' },   // 单复数（Add New Targets 类）
    { keywords: ['target recommendation'],                          bucket: 'Add New Targets' },   // 单复数 兜底
    { keywords: ['product target recommend'],                       bucket: 'Add New Targets' },

  ];
  // ═══════════════════════════════════════════════════════════════════════════
  //  AHT 查找表
  // ═══════════════════════════════════════════════════════════════════════════
const AHT_TABLE = {
  'sp|non-aris|non apb|optimize bids':         27,
  'sb|non-aris|non apb|add new targets':        25,
  'sp|non-aris|non apb|campaign creation':      22,

  'sd|aris|apb|optimize bids':                  21,
  'sp|aris|apb|add new targets':                20,
  'sp|non-aris|non apb|add new targets':        20,
  'sd|non-aris|non apb|add new targets':        13,
  'sp|aris|non apb|optimize bids':              19,
  'sb|aris|apb|increase budget':                17,
  'sp|aris|apb|optimize bids':                  17,

  'sb|aris|non apb|optimize bids':              16,
  'sb|aris|apb|add new targets':                15,
  'sd|non-aris|non apb|optimize bids':          15,

  'sd|aris|non apb|optimize bids':              14,

    // ───── Change Campaign State ─────
'sp|non-aris|non apb|change campaign state': 13,
'sb|non-aris|non apb|change campaign state': 13,
'sd|non-aris|non apb|change campaign state': 13,

  // ✅ 你缺的这一条（已补）
  'sd|aris|apb|increase budget':                13,

  'sb|non-aris|non apb|campaign creation':      13,
  'sb|non-aris|non apb|optimize bids':          13,

  'sd|non-aris|non apb|increase budget':        12,
  'sp|aris|non apb|add new targets':            12,
  'sp|aris|non apb|increase budget':            12,

  'sd|non-aris|non apb|campaign creation':      11,
  'sp|aris|apb|increase budget':                11,

  'sp|non-aris|non apb|placement strategies':   10,
  'sb|non-aris|non apb|increase budget':         9,
  'sp|aris|non apb|placement strategies':        9,
  'sp|non-aris|non apb|increase budget':         9,

  'sd|aris|apb|campaign creation':               8,
  'sb|aris|apb|campaign creation':               7,
  'sb|aris|non apb|increase budget':             7,
  'sd|aris|apb|add new targets':                 7,

  'sp|aris|apb|campaign creation':               6,
  'sp|aris|apb|placement strategies':            6,

  'sb|aris|apb|optimize bids':                   5,

};

  // ═══════════════════════════════════════════════════════════════════════════
  //  标准化函数
  // ═══════════════════════════════════════════════════════════════════════════
  function normalizeAdPdt(text) {
    const t = (text || '').toLowerCase();
    if (t.includes('sponsored product')) return 'sp';
    if (t.includes('sponsored brand'))   return 'sb';
    if (t.includes('sponsored display')) return 'sd';
    // 短码匹配
    if (/\bsp\b/.test(t)) return 'sp';
    if (/\bsb\b/.test(t)) return 'sb';
    if (/\bsd\b/.test(t)) return 'sd';
    return 'sp';
  }

  function normalizeBucket(b) {
    return (b || '').toLowerCase()
      .replace('new campaign creation', 'campaign creation')
      .trim();
  }

  function inferBucket(title) {
    const t = (title || '').toLowerCase();
    for (const entry of TITLE_MAP) {
      if (entry.keywords.some(kw => t.includes(kw.toLowerCase()))) return entry.bucket;
    }
    return null;
  }

  function lookupAHT(adPdt, isAris, bucket) {
    const pdt  = normalizeAdPdt(adPdt);
    const aris = isAris ? 'aris'    : 'non-aris';
    const apb  = isAris ? 'apb'     : 'non apb';
    const bkt  = normalizeBucket(bucket);
    const key  = `${pdt}|${aris}|${apb}|${bkt}`;
    return AHT_TABLE[key] ?? null;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //  UI
  // ═══════════════════════════════════════════════════════════════════════════
  const panel = document.createElement('div');
  panel.style.cssText = `
    position:fixed;top:8px;right:8px;z-index:2147483647;
    cursor:move;
    background:#fff;border:1px solid #d5d9d9;border-radius:8px;
    padding:12px 14px;font-size:12px;font-family:Arial,sans-serif;
    box-shadow:0 4px 16px rgba(0,0,0,.25);width:320px;
    max-height:90vh;overflow-y:auto;line-height:1.6;
  `;
  panel.innerHTML = `
    <div style="font-weight:700;font-size:14px;margin-bottom:6px;
                display:flex;justify-content:space-between;align-items:center;">
      AHT 计算器
      <div style="display:flex;gap:6px;">
        <button id="aht-debug-btn" style="cursor:pointer;background:#555;color:#fff;
          border:none;border-radius:4px;padding:3px 8px;font-size:11px;">📋 日志</button>
        <button id="aht-btn" style="cursor:pointer;background:#e47911;color:#fff;
          border:none;border-radius:4px;padding:3px 10px;font-size:12px;">▶ 开始</button>
      </div>
    </div>
    <div id="aht-status" style="color:#888;font-size:11px;min-height:16px;"></div>
    <div id="aht-result"></div>
    <div id="aht-debug" style="display:none;margin-top:8px;border-top:1px solid #eee;
      padding-top:6px;font-size:10px;color:#555;max-height:220px;overflow-y:auto;
      font-family:monospace;white-space:pre-wrap;word-break:break-all;"></div>
  `;
  document.body.appendChild(panel);

  const btn      = document.getElementById('aht-btn');
  const debugBtn = document.getElementById('aht-debug-btn');
  const statusEl = document.getElementById('aht-status');
  const resultEl = document.getElementById('aht-result');
  const debugEl  = document.getElementById('aht-debug');

  debugBtn.addEventListener('click', () => {
    debugEl.style.display = debugEl.style.display === 'none' ? 'block' : 'none';
  });

  const logs = [];
  function log(msg) {
    console.log('[AHT]', msg);
    logs.push(msg);
    debugEl.textContent = logs.join('\n');
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //  工具函数
  // ═══════════════════════════════════════════════════════════════════════════
  const delay = ms => new Promise(r => setTimeout(r, ms));

  function waitFor(fn, timeout = 15000, interval = 100) {
    return new Promise((resolve, reject) => {
      const start = Date.now();
      const tick = () => {
        const r = fn(); if (r) return resolve(r);
        if (Date.now() - start > timeout) return reject(new Error('timeout'));
        setTimeout(tick, interval);
      };
      tick();
    });
  }

  function waitForRows() {
    return new Promise(resolve => {
      if (getDataRows().length > 0) return resolve();
      const ob = new MutationObserver(() => {
        if (getDataRows().length > 0) { ob.disconnect(); setTimeout(resolve, 200); }
      });
      ob.observe(document.body, { childList: true, subtree: true });
      setTimeout(() => { ob.disconnect(); resolve(); }, 15000);
    });
  }

  function getDataRows() {
    const rows = Array.from(document.querySelectorAll('table tbody tr'));
    if (rows.length) return rows;
    return Array.from(document.querySelectorAll('[role="row"]')).filter(r =>
      !r.querySelector('[role="columnheader"]') &&
      r.querySelectorAll('[role="cell"],[role="gridcell"],td').length > 0
    );
  }

  // ★ Tracking 列索引：找列头文字含 "Tracking" 的那列
  function findTrackingIdx() {
    const headers = Array.from(document.querySelectorAll('th,[role="columnheader"]'));
    return headers.findIndex(h => /tracking/i.test(h.textContent));
  }

  // ★ 判断单元格是 Yes / No
  //   Yes 旁边有 ⓘ 图标，textContent 会是 "Yes " 或 "Yes®" 等
  //   只要文字以 Yes 开头 或 以 No 开头即可
  function classifyCell(cell) {
    // 只取第一个文字节点，避免图标干扰
    let text = '';
    for (const node of cell.childNodes) {
      if (node.nodeType === Node.TEXT_NODE) {
        text = node.textContent.trim();
        if (text) break;
      }
    }
    // 如果文字节点为空，退而求其次取整体 textContent 的前几个字符
    if (!text) text = cell.textContent.trim().slice(0, 5);

    if (/^yes/i.test(text)) return 'yes';
    if (/^no/i.test(text))  return 'no';
    return null;
  }

  function getNextBtn() {
    for (const sel of ['button[aria-label*="next" i]', '[aria-label="Next page"]']) {
      const el = document.querySelector(sel);
      if (el && !el.disabled) return el;
    }
    return Array.from(document.querySelectorAll('button'))
      .find(b => /^[>›]$/.test(b.textContent.trim()) && !b.disabled) || null;
  }

  async function goToFirstPage() {
    const first = Array.from(document.querySelectorAll('button')).find(b => {
      const t   = b.textContent.trim();
      const lbl = (b.getAttribute('aria-label') || '').toLowerCase();
      return ['«', '<<', '|<'].includes(t) || lbl.includes('first');
    });
    if (first && !first.disabled) {
      first.click();
      await delay(400);
      await waitForRows();
    }
  }

  function findViewLinks() {
    return Array.from(document.querySelectorAll('a,button'))
      .filter(el => /view recommendation/i.test(el.textContent.trim()));
  }

  // ★ 从详情页读 title 和 adPdt
  //   Ad product 字段页面上写法有两种：
  //   "Ad product: SP"  或  "Ad product; SD"
  //   用正则同时匹配冒号和分号
  function readDetailPageInfo() {
    const allLeaves = Array.from(document.querySelectorAll('p,div,span,h1,h2,h3,li,td'))
      .filter(el => el.children.length === 0 || Array.from(el.children).every(c => c.tagName === 'BR'));

    let title  = '';
    let adPdtRaw = '';

    for (const el of allLeaves) {
      const t = el.textContent.trim();
      if (!t) continue;

      // 匹配 "Ad product: SP" 或 "Ad product; SD"（冒号或分号，大小写不限）
      if (/^ad\s*product\s*[;:]\s*/i.test(t)) {
        const m = t.match(/^ad\s*product\s*[;:]\s*(.+)/i);
        if (m) adPdtRaw = m[1].trim();
      }

      // title：第一段以 "You have" 开头 或 足够长的描述句
      if (!title && /^you have \d/i.test(t)) {
        title = t;
      }
      if (!title && t.length > 50 &&
          !/^(ad\s*product|case\s*status|audit\s*summary|selected \d|these rec)/i.test(t)) {
        title = t;
      }
    }

    // adPdt 兜底：从 title 里提取 Sponsored X
    if (!adPdtRaw && title) {
      const m = title.match(/sponsored\s+(product|brand|display)/i);
      if (m) adPdtRaw = 'Sponsored ' + m[1];
    }

    return { title, adPdtRaw: adPdtRaw || title };
  }
function getListCardInfoFromLink(linkEl) {
  let card = null;
  let el = linkEl;

  // 往上找真正的卡片容器
  for (let i = 0; i < 8 && el; i++, el = el.parentElement) {
    const txt = (el.innerText || '').replace(/\s+/g, ' ').trim();
    if (
      /view recommendation details/i.test(txt) &&
      /ad product/i.test(txt) &&
      /case status/i.test(txt)
    ) {
      card = el;
      break;
    }
  }

  const text = ((card || linkEl.parentElement || linkEl).innerText || '').trim();
  const lines = text.split('\n').map(s => s.trim()).filter(Boolean);

  let title = lines.find(t => /^you have \d/i.test(t)) || '';
  if (!title) {
    title = lines.find(t =>
      t.length > 40 &&
      !/^(optimization|new campaign recommendation|ad product|case status|audit summary)/i.test(t)
    ) || '';
  }

  let adPdtRaw = '';
  const adLine = lines.find(t => /^ad\s*product\s*[:;]\s*/i.test(t));
  if (adLine) {
    const m = adLine.match(/^ad\s*product\s*[:;]\s*(.+)/i);
    if (m) adPdtRaw = m[1].trim();
  }

  if (!adPdtRaw && title) {
    const m = title.match(/sponsored\s+(product|brand|display)/i);
    if (m) adPdtRaw = 'Sponsored ' + m[1];
  }

  const adPdt = normalizeAdPdt(adPdtRaw || title);
  const key = `${title}||${adPdt}`;

  return { title, adPdtRaw: adPdtRaw || title, adPdt, key };
}

function findLinkByTask(task) {
  const links = findViewLinks();

  const matched = links.map(link => ({
    link,
    info: getListCardInfoFromLink(link)
  })).filter(x => x.info.key === task.key);

  return matched[task.occurrence]?.link || null;
}
  // ★ 扫描详情页所有页，统计 Tracking Yes/No
  async function scanDetail(label) {
    let yes = 0, no = 0, page = 1;
    await goToFirstPage();

    while (true) {
      await waitForRows();
      const tIdx = findTrackingIdx();
      log(`  第${page}页 trackingIdx=${tIdx} rows=${getDataRows().length}`);

      getDataRows().forEach(row => {
        const cells = Array.from(row.querySelectorAll('td,[role="cell"],[role="gridcell"]'));
        let cell = null;

        if (tIdx >= 0 && cells[tIdx]) {
          cell = cells[tIdx];
        } else {
          // 兜底：找第一个开头是 Yes/No 的短单元格
          cell = cells.find(c => /^(yes|no)/i.test(c.textContent.trim()));
        }

        if (!cell) return;
        const kind = classifyCell(cell);
        if (kind === 'yes') yes++;
        else if (kind === 'no') no++;
      });

      statusEl.textContent = `「${label}」第${page}页 ✅${yes} ❌${no}`;

      const nxt = getNextBtn();
      if (!nxt) break;

      const prevFirst = getDataRows()[0]?.textContent?.slice(0, 40) || '';
      nxt.click();
      page++;
      await waitFor(() => {
        const rows = getDataRows();
        return rows.length > 0 && rows[0].textContent.slice(0, 40) !== prevFirst;
      }, 8000, 100).catch(() => {});
      await delay(100);
    }

    return { yes, no };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  //  主流程
  // ═══════════════════════════════════════════════════════════════════════════
async function runScan() {
  btn.disabled = true;
  btn.textContent = '⏳扫描中…';
  resultEl.innerHTML = '';
  debugEl.textContent = '';
  logs.length = 0;
  statusEl.textContent = '初始化…';

  const combinationMap = {};
  const unknownCards   = [];

  function getOrCreate(bucket, adPdtRaw, isAris, cardLabel) {
    const adPdt = normalizeAdPdt(adPdtRaw);
    const key   = `${normalizeBucket(bucket)}||${adPdt}||${isAris ? 1 : 0}`;
    if (!combinationMap[key]) {
      combinationMap[key] = {
        bucket, adPdt, isAris,
        yes: 0, no: 0,
        aht: lookupAHT(adPdtRaw, isAris, bucket),
        cards: []
      };
    }
    if (!combinationMap[key].cards.includes(cardLabel)) {
      combinationMap[key].cards.push(cardLabel);
    }
    return combinationMap[key];
  }

  try {
    await waitFor(() => findViewLinks().length > 0, 15000);

    const initialLinks = findViewLinks();
    const total = initialLinks.length;

    const occurrenceMap = {};
    const taskQueue = initialLinks.map((link, idx) => {
      const info = getListCardInfoFromLink(link);
      const occurrence = occurrenceMap[info.key] || 0;
      occurrenceMap[info.key] = occurrence + 1;

      return {
  label: `卡片${idx + 1}`,
  key: info.key,
  occurrence,
  preview: info.title.slice(0, 80),
  title: info.title,
  adPdtRaw: info.adPdtRaw,
  adPdt: info.adPdt
};
    });

    log(`找到 ${total} 张卡片`);
    taskQueue.forEach(t => {
      log(`  ${t.label} -> ${t.preview} [${t.adPdt}] (#${t.occurrence + 1})`);
    });
    statusEl.textContent = `找到 ${total} 张卡片，开始扫描…`;

    for (const task of taskQueue) {
      const label = task.label;

      const link = findLinkByTask(task);
      if (!link) {
        log(`\n[${label}]`);
        log(`  ❌ 当前列表找不到对应卡片: ${task.preview} [${task.adPdt}] (#${task.occurrence + 1})`);
        continue;
      }

      log(`\n[${label}]`);
      log(`  queueKey : "${task.key.slice(0, 160)}"`);
      log(`  preview  : "${task.preview}"`);
      log(`  occurrence: ${task.occurrence + 1}`);

      statusEl.textContent = `点击「${label}」…`;
      link.click();

      // 等待详情页加载
      await waitFor(() => getDataRows().length > 0, 12000, 100).catch(() => {});
      await delay(400);

      // 读取详情信息
// ❗改为：用列表页卡片信息作为分类来源（解决详情页title重复问题）
const title = task.title;
const adPdtRaw = task.adPdtRaw;
const bucket = inferBucket(title);

log(`\n[${label}]`);
log(`  listTitle : "${title.slice(0, 100)}"`);

// 调试用：详情页 title 依然可能是错的，但不再用于分类
const detailInfo = readDetailPageInfo();
log(`  detailTitle(错误来源): "${(detailInfo.title || '').slice(0, 100)}"`);

log(`  adPdtRaw: "${adPdtRaw}"`);
log(`  adPdt  : "${normalizeAdPdt(adPdtRaw)}"`);
log(`  bucket : "${bucket || '❓未识别'}"`);
      if (!bucket) {
        unknownCards.push({
          label,
          title: (title || '').slice(0, 100),
          adPdtRaw
        });
      }

      // 扫描详情页
      const { yes, no } = await scanDetail(label);
      log(`  yes=${yes}  no=${no}`);

      if (bucket) {
        if (yes > 0) {
          const c = getOrCreate(bucket, adPdtRaw, true, label);
          c.yes += yes;
          log(`  → ARIS combo AHT=${c.aht}`);
        }
        if (no > 0) {
          const c = getOrCreate(bucket, adPdtRaw, false, label);
          c.no += no;
          log(`  → NON-ARIS combo AHT=${c.aht}`);
        }
      }

      // 点击左上角关闭按钮返回列表
      statusEl.textContent = `「${label}」完成，关闭详情页…`;

      const closeBtn = Array.from(document.querySelectorAll('button,[role="button"]'))
        .find(el => {
          const txt = (el.textContent || '').trim();
          const aria = (el.getAttribute('aria-label') || '').toLowerCase();
          return txt === '×' || txt === '✕' || txt === '✖' || aria.includes('close');
        });

      if (closeBtn) {
        closeBtn.click();
      } else {
        log('⚠️ 没找到关闭按钮，fallback 到 history.back()');
        history.back();
      }

      await waitFor(() => findViewLinks().length > 0, 15000, 200).catch(() => {});
      await delay(500);
    }

    // ── 渲染结果 ─────────────────────────────
    const combos   = Object.values(combinationMap);
    const totalYes = combos.reduce((s, c) => s + c.yes, 0);
    const totalNo  = combos.reduce((s, c) => s + c.no,  0);
    // ★ Campaign Creation 按条数×AHT累加，其他 bucket 每个unique组合只计一次AHT
    const totalAHT = combos.reduce((s, c) => {
      if (!c.aht) return s;
      if (normalizeBucket(c.bucket) === 'campaign creation') {
        return s + (c.yes + c.no) * c.aht;  // 按条数累加
      }
      return s + c.aht;  // 每个unique组合计一次
    }, 0);
    const missing  = combos.filter(c => c.aht == null);

    log(`\n── 最终汇总 ──`);
    combos.forEach(c => {
      const tag = c.isAris ? 'ARIS+APB' : 'NON-ARIS+NON-APB';
      const isCampaign = normalizeBucket(c.bucket) === 'campaign creation';
      const comboAHT = c.aht
        ? (isCampaign ? `${c.yes+c.no}条×${c.aht}=${(c.yes+c.no)*c.aht}min` : `固定${c.aht}min`)
        : '❓';
      log(`  ${c.bucket} × ${c.adPdt.toUpperCase()} × ${tag} → ${c.yes + c.no}条, AHT=${comboAHT}`);
    });
    log(`  总 AHT = ${totalAHT} min`);

    const byBucket = {};
    combos.forEach(c => {
      if (!byBucket[c.bucket]) byBucket[c.bucket] = [];
      byBucket[c.bucket].push(c);
    });
// ⭐ 放在这里（关键位置）
const bucketSet = new Set(combos.map(c => c.bucket));
const adProductSet = new Set(combos.map(c => c.adPdt.toUpperCase()));
    let html = `

      <div style="margin:8px 0;padding:8px;background:#fff8f0;
                  border-radius:6px;border:1px solid #f0a030;">
        <div style="font-weight:700;font-size:13px;margin-bottom:4px;">📊 汇总</div>
       <div>🗂 总卡片数: <b>${taskQueue.length} 个</b></div>
<div>📦 Rec Bucket 数量: <b>${bucketSet.size} 个</b></div>
<div>🛒 Ad Product 数量: <b>${adProductSet.size} 个</b></div>
<div>🔢 Unique 组合数: <b>${combos.length} 个</b></div>
<div>⏱ 预估总 AHT: <b>${totalAHT} 分钟</b>
  <span style="color:#888;font-size:10px;">（每种组合计一次）</span>
</div>
        ${missing.length > 0
          ? `<div style="color:#c00;font-size:10px;">⚠️ ${missing.length}个组合未找到AHT，请看📋日志</div>`
          : ''}
      </div>
      <div style="font-weight:700;font-size:12px;margin:6px 0 2px;">📁 按 Rec Bucket 明细</div>
    `;

    Object.entries(byBucket).sort().forEach(([bucket, rows]) => {
      const bucketAHT = rows.reduce((s, r) => {
        if (!r.aht) return s;
        if (normalizeBucket(r.bucket) === 'campaign creation') {
          return s + (r.yes + r.no) * r.aht;
        }
        return s + r.aht;
      }, 0);
      html += `
        <div style="margin-top:6px;background:#f8f8f8;border-radius:4px;padding:6px 8px;">
          <div style="font-weight:700;font-size:12px;">📂 ${bucket}
            <span style="font-weight:normal;color:#888;font-size:11px;"> 小计 ${bucketAHT}min</span>
          </div>`;
      rows.forEach(r => {
        const pdt    = r.adPdt.toUpperCase();
        const tag    = r.isAris ? '✅ ARIS+APB' : '❌ NON-ARIS+NON-APB';
        const count  = r.yes + r.no;
        const isCampaign = normalizeBucket(r.bucket) === 'campaign creation';
        const comboAHT = isCampaign ? count * (r.aht ?? 0) : (r.aht ?? 0);
        const ahtStr = r.aht != null
          ? (isCampaign
              ? `${count}条 × ${r.aht}min = <b>${comboAHT}min</b>`
              : `固定 <b>${r.aht}min</b>`)
          : '❓未找到';
        html += `
          <div style="margin:3px 0 0 10px;font-size:11px;color:#333;">
            ${pdt} · ${tag} · <b>${count}条</b> · AHT ${r.aht ? ahtStr : '<b style="color:#c00">❓未找到</b>'}
            <div style="color:#aaa;font-size:10px;">来自：${r.cards.join('、')}</div>
          </div>`;
      });
      html += `</div>`;
    });

    if (unknownCards.length > 0) {
      html += `
        <div style="margin-top:8px;padding:6px 8px;background:#fff0f0;
                    border-radius:4px;font-size:11px;">
          <b>⚠️ 未识别 Bucket（${unknownCards.length}张）</b><br>
          请点 📋日志 查看 title，告诉我补关键词
        </div>`;
    }

    resultEl.innerHTML = html;
    statusEl.textContent = '✔ 扫描完成';

  } catch (e) {
    statusEl.textContent = '❌ ' + e.message;
    log('ERROR: ' + e.stack);
  }

  btn.disabled = false;
  btn.textContent = '▶ 重新扫描';
}

  btn.addEventListener('click', runScan);

  // ── 拖拽移动浮窗 ──────────────────────────────────────────────────────────
  let dragging = false, ox = 0, oy = 0;
  panel.addEventListener('mousedown', e => {
    if (e.target.tagName === 'BUTTON') return;
    dragging = true;
    ox = e.clientX - panel.getBoundingClientRect().left;
    oy = e.clientY - panel.getBoundingClientRect().top;
    e.preventDefault();
  });
  document.addEventListener('mousemove', e => {
    if (!dragging) return;
    panel.style.left  = (e.clientX - ox) + 'px';
    panel.style.top   = (e.clientY - oy) + 'px';
    panel.style.right = 'auto';
  });
  document.addEventListener('mouseup', () => { dragging = false; });

})();
