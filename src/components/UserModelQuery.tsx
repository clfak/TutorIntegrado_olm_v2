import { Text } from "@chakra-ui/react";
import { uModel } from "../utils/startModel";

const UserModelQuery = ({ KCs }) => {
  let a = uModel.data;

  const averageLevel = () => {
    // verifica si hay datos disponibles para hacer los calculos
    if (!a || !a.length) {
      return 0; // Retorna 0 si no hay data
    }

    // accede al ultimo modelo del usuario
    const jsonData = a[0].json;

    const levels = KCs.map(kc => {
      const kcData = jsonData[kc.code]; // accede a cada kc usando su codigo
      const level = kcData ? kcData.level : 0; // Si existe kcData obtengo el level, si no sera 0
      //console.log(`level del KC (${kc.code}):`, level);
      return level;
    });

    // calculo suma y promedio
    const sum = levels.reduce((a, b) => a + b, 0);
    return levels.length > 0 ? (sum / levels.length).toFixed(2) : 0; // Calcula el promedio
  };

  return <Text mt={2}>Promedio de niveles: {averageLevel()}</Text>;
};

export default UserModelQuery;
