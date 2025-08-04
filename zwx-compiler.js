const zwxBox = document.getElementById("zwx");
const luaBox = document.getElementById("lua");
const zwxConsole = document.getElementById("zwxConsole");
const luaConsole = document.getElementById("luaConsole");

// Main compiler function
function compileZWX(code) {
  const lines = code.split("\n");
  let lua = "";

  for (let rawLine of lines) {
    // Strip dev note comments after ~~
    let line = rawLine.split("~~")[0].trim();
    if (!line) continue;

    // create: variable("name")>"value"
    let varMatch = line.match(/^create: variable\("(.+?)"\)>\((.+)\)$/);
    if (varMatch) {
      let name = varMatch[1];
      let val = varMatch[2].trim();
      if (!val.match(/^".*"$/) && isNaN(val)) val = `"${val}"`;
      lua += `local ${name} = ${val}\n`;
      continue;
    }

    // create: variable("name")="value" or =value
    let varAssignMatch = line.match(/^create: variable\("(.+?)"\)\s*=\s*(.+)$/);
    if (varAssignMatch) {
      let name = varAssignMatch[1];
      let val = varAssignMatch[2].trim();
      if (!val.match(/^".*"$/) && isNaN(val)) val = `"${val}"`;
      lua += `local ${name} = ${val}\n`;
      continue;
    }

    // create: function("name")
    let funcStartMatch = line.match(/^create: function\("(.+?)"\)/);
    if (funcStartMatch) {
      lua += `function ${funcStartMatch[1]}()\n`;
      continue;
    }

    // end: function("name")
    let funcEndMatch = line.match(/^end: function\("(.+?)"\)/);
    if (funcEndMatch) {
      lua += `end\n`;
      continue;
    }

    // print: "something"
    if (line.startsWith("print:")) {
      let val = line.slice(6).trim();
      lua += `print(${val})\n`;
      continue;
    }

    // print variable (no colon)
    let printVarMatch = line.match(/^print\s+(.+)$/);
    if (printVarMatch) {
      let val = printVarMatch[1].trim();
      lua += `print(${val})\n`;
      continue;
    }

    // loop: 10>func("name")
    let loopMatch = line.match(/^loop: (\d+)>\s*func\("(.+?)"\)/);
    if (loopMatch) {
      let count = loopMatch[1];
      let funcName = loopMatch[2];
      lua += `for i = 1, ${count} do\n  ${funcName}()\nend\n`;
      continue;
    }

    // set obj>prop: value
    let setMatch = line.match(/^set (.+?): (.+)$/);
    if (setMatch) {
      let path = setMatch[1].replace(/>/g, ".");
      let val = setMatch[2];
      lua += `${path} = ${val}\n`;
      continue;
    }

    // when obj#Signal>param
    let whenMatch = line.match(/^when (.+?)#(\w+?)>(.+)$/);
    if (whenMatch) {
      let obj = whenMatch[1].replace(/>/g, ".");
      let signal = whenMatch[2];
      let param = whenMatch[3];
      lua += `${obj}.${signal}:Connect(function(${param})\n`;
      continue;
    }

    // if condition then
    if (line.match(/^if .+ then$/)) {
      lua += line + "\n";
      continue;
    }

    // else:
    if (line === "else:") {
      lua += "else\n";
      continue;
    }

    // end: if
    if (line === "end: if") {
      lua += "end\n";
      continue;
    }

    // wait: number
    let waitMatch = line.match(/^wait: (\d+(?:\.\d+)?)$/);
    if (waitMatch) {
      lua += `wait(${waitMatch[1]})\n`;
      continue;
    }

    // return: value
    let returnMatch = line.match(/^return: (.+)$/);
    if (returnMatch) {
      lua += `return ${returnMatch[1]}\n`;
      continue;
    }

    // Family relations:

    // script>cousin("name")
    let cousinMatch = line.match(/^script>cousin\("(.+?)"\)$/);
    if (cousinMatch) {
      lua += `script.Parent.Parent:FindFirstChild("${cousinMatch[1]}")\n`;
      continue;
    }

    // script>nephew("folder,child")
    let nephewMatch = line.match(/^script>nephew\("(.+?)"\)$/);
    if (nephewMatch) {
      let parts = nephewMatch[1].split(",").map(s => s.trim());
      if (parts.length === 2) {
        lua += `script.Parent:FindFirstChild("${parts[0]}"):FindFirstChild("${parts[1]}")\n`;
      } else {
        lua += `-- Invalid nephew syntax\n`;
      }
      continue;
    }

    // script>uncle("name")
    let uncleMatch = line.match(/^script>uncle\("(.+?)"\)$/);
    if (uncleMatch) {
      lua += `script.Parent.Parent:FindFirstChild("${uncleMatch[1]}")\n`;
      continue;
    }

    // default fallback — unhandled line
    lua += `-- Unhandled: ${line}\n`;
  }

  return lua.trim();
}

// Live compile on input event
zwxBox.addEventListener("input", () => {
  const code = zwxBox.value;
  const lua = compileZWX(code);
  luaBox.value = lua;
  zwxConsole.textContent = "";
  luaConsole.textContent = "";
});

// Run ZWX simulation console
function runZWX() {
  const lines = zwxBox.value.split("\n");
  let output = "";

  for (let line of lines) {
    let cleanLine = line.split("~~")[0].trim();
    if (cleanLine.startsWith("print:")) {
      output += cleanLine.slice(6).trim() + "\n";
    }
    else if (cleanLine.match(/^print\s+(.+)$/)) {
      let val = cleanLine.match(/^print\s+(.+)$/)[1];
      output += val + "\n";
    }
  }

  zwxConsole.textContent = output || "No ZWX output.";
}

// Run Lua simulation console
function runLua() {
  const lua = luaBox.value;
  let output = "";

  const printMatches = [...lua.matchAll(/print\((["']?)(.*?)\1\)/g)];
  for (const m of printMatches) {
    output += m[2] + "\n";
  }

  luaConsole.textContent = output || "No Lua output.";
}
