// This function formats a timestamp into a date string in the format "DD/Mon/YYYY" in Spanish.
// It removes the period from the month abbreviation and capitalizes the first letter of the month.
export function formatDate(timestamp) {
  // Returns an empty string if the date is empty
  if (!timestamp) {
    return "";
  }

  const date = new Date(timestamp);
  const formattedDate = new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
    .format(date)
    .replace(".", "")
    .replace(/\b\w/g, c => c.toUpperCase());

  const formattedTime = new Intl.DateTimeFormat("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false, // 24-hour format
  }).format(date);

  const [day, month, year] = formattedDate.split(" ");
  return `${day}/${month}/${year} ${formattedTime}`;
}

export function getColorScheme(value) {
  if (value <= 35) {
    return "red.500"; // Rojo para valores <= 35
  } else if (value < 70) {
    return "orange.400"; // Naranja para valores entre 51% y 69%
  } else if (value <= 100) {
    return "green"; // Naranja claro para valores entre 70% y 99%
  } else {
    return "white"; // Blanco para valores >= 100
  }
}

export const extractExercise = data => {
  const exercises = [];
  const contentArray = data[0]?.content;
  const topicId = data[0]?.id;

  contentArray?.forEach(item => {
    if (item?.json) {
      let id;
      let cod;
      let desc;
      let mathExpr;
      let img;

      switch (item.json.type) {
        case "fdsc2":
        case "fc1s":
        case "fcc3s":
        case "fdc2s":
        case "ftc5s":
        case "lvltutor":
          id = item.id;
          cod = item.json.code;
          desc = item.json.text;
          mathExpr = item.json.initialExpression?.trim()
            ? item.json.initialExpression
            : item.json.steps[0].expression;
          break;
        case "fc1s":
          id = item.id;
          cod = item.json.code;
          desc = item.json.title;
          mathExpr = item.json.steps[0].eqc;
          break;
        case "ecl2s":
        case "ecc5s":
        case "secl5s":
          id = item.id;
          cod = item.json.code;
          desc = item.json.title;
          mathExpr = item.json.eqc;
          break;
        case "thales1":
        case "thales2":
        case "pitagoras1":
        case "pitagoras2":
        case "areaperimetro1":
        case "areaperimetro2":
        case "geom":
          id = item.id;
          cod = item.json.code;
          desc = item.json.text;
          mathExpr = item.json.image;
          img = item.json.image;
          break;
        default:
          console.log("Caso no manejado:", item.json.type);
          break;
      }

      // Solo agregar si se definieron id, desc, y mathExpr
      if (id && desc && mathExpr) {
        exercises.push({
          exerciseId: id,
          code: cod,
          description: desc,
          mathExpression: mathExpr,
          image: img,
          topicId: topicId,
        });
      } else {
        console.log("Caso no manejado:", item.json);
      }
    }
  });
  return exercises;
};

export interface SkillModel {
  mth: number; // Threshold value
  level: number; // Current skill level
}

/**
 * Calculates the normalized progress value for a single user's skills
 * @param skillNames Array of skill identifiers to evaluate
 * @param userValues User's skill data (record of SkillModel)
 * @returns Normalized progress value (0-1)
 */
export const calculateUserProgress = (
  skillNames: string[],
  userValues: Record<string, SkillModel> | undefined | null,
): number => {
  // Handle undefined/null cases
  if (!skillNames?.length || !userValues) return 0;

  // Handle single skill case
  if (skillNames.length === 1) {
    const skill = userValues[skillNames[0]];
    if (!skill || skill.level === undefined) return 0;
    return skill.level >= skill.mth ? 1 : skill.level;
  }

  // Calculate average for multiple skills
  let total = 0;
  let validSkillsCount = 0;

  for (const skillName of skillNames) {
    // Safely access the skill
    const skill = userValues[skillName];
    if (!skill || skill.level === undefined) continue;

    validSkillsCount++;
    total += skill.level >= skill.mth ? 1 : skill.level;
  }

  return validSkillsCount > 0 ? total / validSkillsCount : 0;
};

/**
 * Calculates the average progress across multiple users
 * @param skillNames Array of skill identifiers to evaluate
 * @param usersData Array of users with their skill data
 * @returns Average progress value (0-1) rounded to 2 decimal places
 */
export const calculateGroupProgress = (
  skillNames: string[] | undefined | null,
  usersData:
    | Array<{ id: string; json: Record<string, SkillModel> | undefined | null }>
    | undefined
    | null,
): number => {
  // Handle undefined/null cases
  if (!skillNames?.length || !usersData?.length) return 0;

  // Handle single user case
  if (usersData.length === 1) {
    return calculateUserProgress(skillNames, usersData[0].json);
  }

  // Calculate average for multiple users
  const totalProgress = usersData.reduce((sum, user) => {
    return sum + calculateUserProgress(skillNames, user.json);
  }, 0);

  const averageProgress = totalProgress / usersData.length;
  return Number(averageProgress.toFixed(2));
};
