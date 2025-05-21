export function convertirNotacion(input: string) {
  // Buscar la cadena "\\frac" en la entrada con posible signo negativo
  var matchFraccion = input.match(/(-?)\\frac(\d+)(\d+)/);

  // Buscar la cadena "\\sqrt" en la entrada
  var matchRaizCuadrada = input.match(/\\sqrt(\d+)/);

  // Verificar si se encuentra una coincidencia para fracciones
  if (matchFraccion && matchFraccion.length === 4) {
    // Construir la salida con el formato adecuado, preservando el signo
    return matchFraccion[1] + "\\frac{" + matchFraccion[2] + "}{" + matchFraccion[3] + "}";
  }
  // Verificar si se encuentra una coincidencia para la raíz cuadrada
  else if (matchRaizCuadrada && matchRaizCuadrada.length === 2) {
    // Construir la salida con el formato adecuado
    return "\\sqrt{" + matchRaizCuadrada[1] + "}";
  } else {
    return input;
  }
}
