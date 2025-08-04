const zwxInput = document.getElementById("zwx");
const luaOutput = document.getElementById("lua");
const zwxConsole = document.getElementById("zwxConsole");
const luaConsole = document.getElementById("luaConsole");

zwxInput.addEventListener("input", () => {
  const zwxCode = zwxInput.value;
  const luaCode = translateZWX(zwxCode);
  luaOutput.value = luaCode;
});

function translateZWX(zwxCode) {
  return zwxCode
    .replace(/create: variable\(([^)]+)\)/g, (_, name) => `local ${name}`)
    .replace(/^(\w+):\s*"?([\w>.\"]+)"?/gm, (_, name, val) => `${name} = ${val.replace(/>/g, ".")}`)
    .replace(/print: ([\w"]+)/g, (_, val) => `print(${val})`)
    .replace(/when (.+?)#Touched>(\w+)/g, (_, a, b) => `${a}.Touched:Connect(function()\n  if ${b} then\n`)
    .replace(/set (.+?): (.+)/g, (_, a, b) => `${a} = ${b}`)
    .replace(/(function|FuncE|GetF):\s*(\w+)/g, (match, type, name) => {
      if (type === "function") return `function ${name}()`;
      if (type === "FuncE") return `end -- ${name}`;
      if (type === "GetF") return `${name}()`;
    });
}

function simulateZWX() {
  zwxConsole.textContent = `ZWX Output:\n(✓) Simulated execution complete.`;
}

function simulateLua() {
  luaConsole.textContent = `Lua Output:\n(✓) Roblox Studio simulation complete.`;
}
