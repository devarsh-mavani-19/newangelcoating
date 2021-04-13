export function validateIFSC (input) {
  var reg = /[A-Z|a-z]{4}[0][a-zA-Z0-9]{6}$/
  if (input.match(reg)) return true
  return false
}
