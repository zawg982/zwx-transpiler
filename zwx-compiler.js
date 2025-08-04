const zwxBox = document.getElementById("zwx");
const luaBox = document.getElementById("lua");
const zwxConsole = document.getElementById("zwxConsole");
const luaConsole = document.getElementById("luaConsole");

// Live compile ZWX to Lua
zwxBox.addEventListener("input", () => {
  const code = zwxBox.value;
  const lua = compileZWX(code);
  luaBox.value = lua;
  zwxConsole.textContent = "";
  luaConsole.textContent = "";
});

function runZWX() {
  const lines = zwxBox.value.trim().split("\n");
  let output = "";

  for (let line of lines) {
    line = line.trim();
    if (line.startsWith("create: function(")) {
      const funcName = line.match(/function\("(.+?)"\)/)?.[1];
      output += `Made a function named ${funcName} with nothing inside of it.\n`;
    } else if (line.startsWith("FuncE:")) {
      // end of function (ignore for output)
    } else if (line.startsWith("print:")) {
      const toPrint = line.split("print:")[1].trim().replace(/^"|"$/g, "");
      output += `${toPrint}\n`;
    } else if (line === "") {
      continue;
    } else {
      output += `Unrecognized or empty line.\n`;
    }
  }

  zwxConsole.textContent = output || "No valid ZWX code to run.";
}

function runLua() {
  const lua = luaBox.value.trim();
  let result = "";

  if (lua.includes("print(")) {
    const match = lua.match(/print\("(.*)"\)/);
    if (match) result += match[1] + "\n";
  }

  if (lua.includes("Humanoid.Health")) {
    result += "char.Humanoid.Health set to 0 on Touched event.\n";
  }

  luaConsole.textContent = result || "No Lua output simulated.";
}

function compileZWX(code) {
  const lines = code.split("\n");
  let lua = "";

  for (let line of lines) {
    line = line.trim();
    if (line.startsWith("create: variable(")) {
      const varName = line.match(/variable\("(.+?)"\)/)?.[1];
      lua += `local ${varName}\n`;
    } else if (line.includes("=")) {
      const [left, right] = line.split("=").map(x => x.trim());
      lua += `local ${left} = ${right.replace(/"/g, '"')}\n`;
    } else if (line.startsWith("print:")) {
      const content = line.split("print:")[1].trim();
      lua += `print(${content})\n`;
    } else if (line.startsWith("create: function(")) {
      const funcName = line.match(/function\("(.+?)"\)/)?.[1];
      lua += `function ${funcName}()\n`;
    } else if (line.startsWith("FuncE:")) {
      lua += `end\n`;
    } else if (line.startsWith("set ")) {
      const [path, value] = line.split(":").map(x => x.trim());
      lua += `${path} = ${value}\n`;
    } else if (line.startsWith("when ")) {
      const eventParts = line.split("#");
      const obj = eventParts[0].replace("when ", "").trim();
      const signal = eventParts[1].split(">")[0];
      const target = eventParts[1].split(">")[1];
      lua += `${obj}.${signal}:Connect(function(${target})\n-- action\nend)\n`;
    }
  }

  return lua.trim();
}
