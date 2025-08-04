function zwxToLua(zwsCode) {
  const lines = zwsCode.split('\n');
  const declaredVars = new Set();
  const output = [];

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim();

    if (/^create: variable\("(.+?)"\)/.test(line)) {
      const varName = line.match(/^create: variable\("(.+?)"\)/)[1];
      declaredVars.add(varName);
      continue;
    }

    if (/^(\w+): workspace>/.test(line)) {
      const [, varName] = line.match(/^(\w+): workspace>/);
      const value = line.split(': ')[1].replace(/>/g, '.');

      if (declaredVars.has(varName)) {
        output.push(`local ${varName} = workspace.${value.split('workspace.')[1]}`);
        declaredVars.delete(varName);
      } else {
        output.push(`${varName} = workspace.${value.split('workspace.')[1]}`);
      }
      continue;
    }

    if (/^create: function\("(.+?)"\)/.test(line)) {
      const name = line.match(/^create: function\("(.+?)"\)/)[1];
      output.push(`function ${name}()`);
      continue;
    }

    if (/^FuncE: (\w+)/.test(line)) {
      output.push('end');
      continue;
    }

    if (/^GetF: (\w+)/.test(line)) {
      output.push(`${RegExp.$1}()`);
      continue;
    }

    if (/^print: "(.+?)"/.test(line)) {
      output.push(`print("${RegExp.$1}")`);
      continue;
    }

    if (/^when (\w+)#(\w+)\>(\w+)/.test(line)) {
      const [, obj, event, target] = line.match(/^when (\w+)#(\w+)\>(\w+)/);
      output.push(`${obj}.${event}:Connect(function(hit)`);
      output.push(`  if hit == ${target} then`);
      continue;
    }

    if (/^set (.+): (.+)/.test(line)) {
      const [, path, value] = line.match(/^set (.+): (.+)/);
      output.push(`    ${path.replace(/>/g, '.')} = ${value}`);
      output.push(`  end`);
      output.push(`end)`);
      continue;
    }

    output.push(line.replace(/>/g, '.'));
  }

  return output.join('\n');
}

function handleLiveTranslate() {
  const zwx = document.getElementById('zwx').value;
  const lua = zwxToLua(zwx);
  document.getElementById('lua').value = lua;
}

function simulateZWX() {
  const zwxOutput = `ZWX Interpreter: Simulated script ran successfully.\n(Example) Player touched part. Health set to 0.`;
  document.getElementById('zwxConsole').innerText = zwxOutput;
}

function simulateLua() {
  const luaOutput = `Roblox Studio: Code ran without error.\nchar.Humanoid.Health set to 0 on Touched event.`;
  document.getElementById('luaConsole').innerText = luaOutput;
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('zwx').addEventListener('input', handleLiveTranslate);
});
