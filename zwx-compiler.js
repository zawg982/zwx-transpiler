function zwxToLua(zwsCode) {
  return zwsCode
    .replace(/create: variable\("(.+?)"\)/g, 'local $1')
    .replace(/create: function\("(.+?)"\)/g, 'function $1()')
    .replace(/FuncE: (\w+)/g, 'end')
    .replace(/GetF: (\w+)/g, '$1()')
    .replace(/print: "(.+?)"/g, 'print("$1")')
    .replace(/(\w+): workspace/g, 'local $1 = workspace')
    .replace(/>/g, '.');
}

function handleTranslate() {
  const input = document.getElementById('zwx').value;
  const output = zwxToLua(input);
  document.getElementById('lua').value = output;
}
