// /api/orchestrator/rulesEngine.ts

// Enkel JSONLogic-utvärderare
// (Kan bytas till `json-logic-js` om du vill använda färdigt paket)

export function applyRule(condition: any, data: any): boolean {
  if (!condition || typeof condition !== 'object') return false

  const [op, operands] = Object.entries(condition)[0] || []

  switch (op) {
    case 'and':
      return operands.every((c: any) => applyRule(c, data))
    case 'or':
      return operands.some((c: any) => applyRule(c, data))
    case '>':
      return resolveValue(operands[0], data) > resolveValue(operands[1], data)
    case '<':
      return resolveValue(operands[0], data) < resolveValue(operands[1], data)
    case '==':
      return resolveValue(operands[0], data) === resolveValue(operands[1], data)
    case '!=':
      return resolveValue(operands[0], data) !== resolveValue(operands[1], data)
    default:
      return false
  }
}

// Hjälpfunktion: hämta värde från datanyckel eller literal
function resolveValue(expr: any, data: any): any {
  if (typeof expr === 'object' && expr.var) {
    return data[expr.var] ?? null
  }
  return expr
} 