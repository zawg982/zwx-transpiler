const keywords = ["create:", "variable(", "print:", "set", "when"];

function zwxToLua(zwsCode) {
  const lines = zwsCode.split('\n');
  const declaredVars = new Set();
  const output = [];

  for (let raw of lines) {
    let line = raw.trim();
    if (line === '') continue;

    if (/^create: variable\((.+?)\)/.test(line)) {
      const varName = line.match(/^create: variable\((.+?)\)/)[1];
      declaredVars.add(varName);
      continue;
    }

    if (/^(\w+)\s*=\s*(.+)/.test(line)) {
      const [, name, value] = line.match(/^(\w+)\s*=\s*(.+)/);
      if (declaredVars.has(name)) {
        output.push(`local ${name} = ${value}`);
        declaredVars.delete(name);
      } else {
        output.push(`${name} = ${value}`);
      }
      continue;
    }

    if (/^print: (.+)/.test(line)) {
      const name = line.match(/^print: (.+)/)[1];
      output.push(`print(${name})`);
      continue;
    }

    output.push('-- Unrecognized: ' + line);
  }

  return output.join('\n');
}

function handleLiveTranslate() {
  const zwx = document.getElementById('zwx').value;
  const lua = zwxToLua(zwx);
  document.getElementById('lua').value = lua;
}

function simulateZWX() {
  const zwxCode = document.getElementById('zwx').value;
  document.getElementById('zwxConsole').innerText =
    `ZWX Output:\n✓ Code interpreted\n✓ No errors`;
}

function simulateLua() {
  const luaCode = document.getElementById('lua').value;
  document.getElementById('luaConsole').innerText =
    `Lua Output:\n${luaCode.includes("print") ? "✓ print executed" : "✓ No print output"}`;
}

// AUTOCOMPLETE
document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("zwx");
  const ghost = document.getElementById("ghostText");

  input.addEventListener("input", () => {
    const text = input.value;
    const lastWord = text.split(/\\s|\\n/).pop();
    const match = keywords.find(k => k.startsWith(lastWord));
    ghost.textContent = match && match !== lastWord ? text + match.slice(lastWord.length) : "";
    handleLiveTranslate();
  });

  input.addEventListener("keydown", (e) => {
    if (e.key === "Tab") {
      const text = input.value;
      const lastWord = text.split(/\\s|\\n/).pop();
      const match = keywords.find(k => k.startsWith(lastWord));
      if (match && match !== lastWord) {
        input.value = text.slice(0, -lastWord.length) + match;
        e.preventDefault();
        handleLiveTranslate();
      }
    }
  });
});
