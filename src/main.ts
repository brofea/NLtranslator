import "./style.css";
import { encodeToNailong, decodeFromNailong } from "./nailong";

const app = document.querySelector<HTMLDivElement>("#app")!;

app.innerHTML = `
  <div class="wrapper">
    <header class="header">
      <h1>奶龙语翻译器</h1>
      <p class="subtitle">把文字变成一串「哈」，只有奶龙才能看懂</p>
    </header>

    <main class="card">
      <section class="panel">
        <label class="label" for="source">原文</label>
        <textarea id="source" class="textarea" rows="6"
          placeholder="在这里输入要翻译成奶龙语的内容……"></textarea>
        <div class="actions">
          <button id="btn-encode" class="btn btn-primary">翻译成奶龙语</button>
          <button id="btn-decode" class="btn btn-ghost">解译回原文</button>
        </div>
      </section>

      <section class="panel">
        <div class="label-row">
          <label class="label" for="output">奶龙语</label>
          <div class="copy-area">
            <span id="copy-tip" class="copy-tip"></span>
            <button id="btn-copy" class="btn btn-mini">复制结果</button>
          </div>
        </div>
        <textarea id="output" class="textarea" rows="6" spellcheck="false"
          placeholder="翻译结果会显示在这里……"></textarea>
        <p id="stats" class="stats"></p>
      </section>
    </main>

  </div>
`;

const source = document.querySelector<HTMLTextAreaElement>("#source")!;
const output = document.querySelector<HTMLTextAreaElement>("#output")!;
const stats = document.querySelector<HTMLParagraphElement>("#stats")!;
const copyTip = document.querySelector<HTMLSpanElement>("#copy-tip")!;

let tipTimer: number | undefined;

function showTip(message: string) {
  copyTip.textContent = message;
  copyTip.classList.add("visible");
  window.clearTimeout(tipTimer);
  tipTimer = window.setTimeout(() => copyTip.classList.remove("visible"), 2000);
}

function showStats(text: string) {
  let haCount = 0;
  for (const ch of text) {
    if (ch === "\u54C8") haCount++;
  }
  if (text.length === 0) {
    stats.textContent = "";
    return;
  }
  stats.textContent = `共 ${haCount} 个「哈」`;
}

function setOutput(text: string) {
  output.value = text;
  showStats(text);
}

document.querySelector("#btn-encode")!.addEventListener("click", () => {
  const text = source.value;
  if (!text.trim()) {
    setOutput("");
    return;
  }
  setOutput(encodeToNailong(text));
});

document.querySelector("#btn-decode")!.addEventListener("click", () => {
  try {
    source.value = decodeFromNailong(output.value);
  } catch (err) {
    stats.textContent = err instanceof Error ? err.message : "解析失败";
    stats.classList.add("stats-error");
  }
});

document.querySelector("#btn-copy")!.addEventListener("click", async () => {
  if (!output.value) return;
  try {
    await navigator.clipboard.writeText(output.value);
    showTip("已复制到剪贴板");
  } catch {
    output.select();
    document.execCommand("copy");
    showTip("已复制到剪贴板");
  }
});

output.addEventListener("input", () => {
  showStats(output.value);
  stats.classList.remove("stats-error");
});
