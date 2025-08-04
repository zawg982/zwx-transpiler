function zwxToLua(zwsCode) {
  return zwsCode
    // Variable creation
    .replace(/create: variable\("(.+?)"\)/g, 'local $1')
    // Variable assignment using workspace>
    .replace(/^(\w+): workspace>(.+)$/gm, 'local $1 = workspace.$2'.replace(/>/g, '.'))

    // Function creation
    .replace(/create: function\("(.+?)"\)/g, 'function $1()')
    .replace(/FuncE: (\w+)/g, 'end')
    .replace(/GetF: (\w+)/g, '$1()')

    // Print
    .replace(/print: "(.+?)"/g, 'print("$1")')

    // Event connections (when A#Event>B)
    .replace(/when (\w+)#(\w+)\>(\w+)/g, '$1.$2:Connect(function(hit)\n  if hit == $3 then')

    // Set value (set A>B>C: D)
    .replace(/set (.+): (.+)/g, '$1 = $2')

    // End auto-block (add end for when block)
    .replace(/\b(set .+)/g, '  $1\nend') // indent 'set' inside 'when'
    
    // Replace > with . for any other remaining chains
    .replace(/>/g, '.');
}

function handleTranslate() {
  const input = document.getElementById('zwx').value;
  const output = zwxToLua(input);
  document.getElementById('lua').value = output;
}
