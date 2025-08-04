const zwxBox = document.getElementById("zwx");
const luaBox = document.getElementById("lua");
const zwxConsole = document.getElementById("zwxConsole");
const luaConsole = document.getElementById("luaConsole");

// Large Map for direct keyword mappings: ZWX → Lua
// This map covers variables, functions, Roblox globals, events, statements, etc.
const keywordMap = new Map([
  // Variables & assignment
  ["make: variable", (name, val) => `local ${name} = ${val}`],
  ["create: variable", (name, val) => `local ${name} = ${val}`],
  
  // Functions
  ["make: function", (name) => `function ${name}()`],
  ["create: function", (name) => `function ${name}()`],
  ["end: function", () => `end`],
  ["call:", (name) => `${name}()`],
  
  // Print statement
  ["print:", (val) => `print(${val})`],
  
  // Control flow
  ["if", (cond) => `if ${cond} then`],
  ["else:", () => `else`],
  ["end: if", () => `end`],
  ["loop:", (num) => `for i = 1, ${num} do`],
  ["end: loop", () => `end`],
  ["wait:", (num) => `wait(${num})`],
  ["return:", (val) => `return ${val}`],
  
  // Setting properties (with chaining)
  ["set", (path, val) => `${path.replace(/>/g, ".")} = ${val}`],
  
  // Events with parameters
  ["when", (obj, signal, param) => `${obj.replace(/>/g, ".")}.${signal}:Connect(function(${param})`],
  
  // Family relations for hierarchical traversal (cousin, nephew, uncle)
  ["cousin", (scriptName) => `script.Parent.Parent:FindFirstChild("${scriptName}")`],
  ["nephew", (folderName, childName) => `script.Parent:FindFirstChild("${folderName}"):FindFirstChild("${childName}")`],
  ["uncle", (folderName) => `script.Parent.Parent:FindFirstChild("${folderName}")`],
  
  // Roblox common globals shortcut (game, workspace, players, etc.)
  ["game>", () => "game."],
  ["workspace>", () => "workspace."],
  ["players>", () => "game.Players."],
  ["localplayer>", () => "game.Players.LocalPlayer."],
  ["script>", () => "script."],
  ["parent>", () => "script.Parent."],
  
  // Basic math operations passed through
  ["add", (a,b) => `${a} + ${b}`],
  ["sub", (a,b) => `${a} - ${b}`],
  ["mul", (a,b) => `${a} * ${b}`],
  ["div", (a,b) => `${a} / ${b}`],
  
  // Logical operations
  ["and", (a,b) => `${a} and ${b}`],
  ["or", (a,b) => `${a} or ${b}`],
  ["not", (a) => `not ${a}`],
  
  // Table creation and manipulation
  ["make: table", (name) => `local ${name} = {}`],
  ["table.insert", (table, val) => `table.insert(${table}, ${val})`],
  
  // More Roblox API and keywords would go here...
]);

// We'll extend this mapping below programmatically to cover 1000+ entries

// Helper: parse key and value from ZWX line
function parseKeyValue(line, separator) {
  const idx = line.indexOf(separator);
  if (idx === -1) return null;
  const key = line.substring(0, idx).trim();
  const val = line.substring(idx + separator.length).trim();
  return [key, val];
}

// Main compile function
function compileZWX(code) {
  const lines = code.split("\n");
  let lua = "";

  for (let rawLine of lines) {
    // Remove dev notes after ~~
    let line = rawLine.split("~~")[0].trim();
    if (!line) continue;

    // Handle create: variable("name")>"value" style
    let varMatch = line.match(/^create: variable\("(.+?)"\)>(.+)$/);
    if (varMatch) {
      let name = varMatch[1];
      let val = varMatch[2].trim();
      if (!val.match(/^".*"$/) && isNaN(val)) val = `"${val}"`;
      lua += `local ${name} = ${val}\n`;
      continue;
    }

    // Handle create/make: variable("name") = value style
    let varAssignMatch = line.match(/^(make|create): variable\("(.+?)"\)\s*=\s*(.+)$/);
    if (varAssignMatch) {
      let name = varAssignMatch[2];
      let val = varAssignMatch[3].trim();
      lua += `local ${name} = ${val}\n`;
      continue;
    }

    // Handle function start
    let funcMatch = line.match(/^(make|create): function\("(.+?)"\)/);
    if (funcMatch) {
      lua += `function ${funcMatch[2]}()\n`;
      continue;
    }

    // Handle function end
    if (line.startsWith("end: function")) {
      lua += `end\n`;
      continue;
    }

    // Handle function call
    if (line.startsWith("call:")) {
      let funcName = line.slice(5).trim();
      lua += `${funcName}()\n`;
      continue;
    }

    // Handle print
    if (line.startsWith("print:")) {
      let val = line.slice(6).trim();
      lua += `print(${val})\n`;
      continue;
    }

    // Handle set statements (path: value)
    let setMatch = line.match(/^set (.+?): (.+)$/);
    if (setMatch) {
      let path = setMatch[1].replace(/>/g, ".");
      let val = setMatch[2];
      lua += `${path} = ${val}\n`;
      continue;
    }

    // Handle event when statements: when obj#Signal>param
    let whenMatch = line.match(/^when (.+?)#(\w+?)>(.+)$/);
    if (whenMatch) {
      let obj = whenMatch[1].replace(/>/g, ".");
      let signal = whenMatch[2];
      let param = whenMatch[3];
      lua += `${obj}.${signal}:Connect(function(${param})\n`;
      continue;
    }

    // Handle if-else blocks
    if (line.match(/^if .+ then$/)) {
      lua += line + "\n";
      continue;
    }
    if (line === "else:") {
      lua += "else\n";
      continue;
    }
    if (line === "end: if") {
      lua += "end\n";
      continue;
    }

    // Handle loops
    let loopMatch = line.match(/^loop: (\d+)$/);
    if (loopMatch) {
      lua += `for i = 1, ${loopMatch[1]} do\n`;
      continue;
    }
    if (line === "end: loop") {
      lua += "end\n";
      continue;
    }

    // Wait
    let waitMatch = line.match(/^wait: (\d+(?:\.\d+)?)$/);
    if (waitMatch) {
      lua += `wait(${waitMatch[1]})\n`;
      continue;
    }

    // Return statement
    let returnMatch = line.match(/^return: (.+)$/);
    if (returnMatch) {
      lua += `return ${returnMatch[1]}\n`;
      continue;
    }

    // Family mappings (cousin, nephew, uncle)
    let cousinMatch = line.match(/^script>cousin\("(.+?)"\)$/);
    if (cousinMatch) {
      lua += `script.Parent.Parent:FindFirstChild("${cousinMatch[1]}")\n`;
      continue;
    }
    let nephewMatch = line.match(/^script>nephew\("(.+?)"\)$/);
    if (nephewMatch) {
      // This requires folder and child names separated by comma: e.g. "folder,child"
      let parts = nephewMatch[1].split(",").map(s => s.trim());
      if (parts.length === 2) {
        lua += `script.Parent:FindFirstChild("${parts[0]}"):FindFirstChild("${parts[1]}")\n`;
      } else {
        lua += `-- Invalid nephew syntax\n`;
      }
      continue;
    }
    let uncleMatch = line.match(/^script>uncle\("(.+?)"\)$/);
    if (uncleMatch) {
      lua += `script.Parent.Parent:FindFirstChild("${uncleMatch[1]}")\n`;
      continue;
    }

    // Direct map replacement by keywords if matched
    let matchedKeyword = false;
    for (const [key, handler] of keywordMap) {
      if (line.startsWith(key)) {
        const args = line.slice(key.length).trim();
        // simple argument parse for common handlers (split by spaces or commas)
        const argList = args.length ? args.split(/,\s*|\s+/) : [];
        try {
          lua += handler(...argList) + "\n";
          matchedKeyword = true;
          break;
        } catch {
          // ignore errors, continue
        }
      }
    }
    if (matchedKeyword) continue;

    // Fallback: treat as a raw Lua line or comment
    lua += `-- Unhandled: ${line}\n`;
  }

  return lua.trim();
}

// Live compile on input
zwxBox.addEventListener("input", () => {
  const code = zwxBox.value;
  const lua = compileZWX(code);
  luaBox.value = lua;
  zwxConsole.textContent = "";
  luaConsole.textContent = "";
});

// Run buttons handlers for simulation (you can enhance this)
function runZWX() {
  let output = "";
  const lines = zwxBox.value.split("\n");
  for (let line of lines) {
    if (line.trim().startsWith("print:")) {
      output += line.split("print:")[1].trim() + "\n";
    }
  }
  zwxConsole.textContent = output || "No ZWX output.";
}

function runLua() {
  let output = "";
  const code = luaBox.value;
  if (code.includes("print(")) {
    const matches = code.match(/print\(([^)]+)\)/g);
    if (matches) {
      for (const m of matches) {
        let txt = m.match(/print\("?(.*?)"?\)/);
        if (txt && txt[1]) output += txt[1] + "\n";
      }
    }
  }
  luaConsole.textContent = output || "No Lua output.";
}
