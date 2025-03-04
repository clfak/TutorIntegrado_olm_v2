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
      return "orange.300"; // Naranja claro para valores entre 70% y 99%
    } else {
      return "white"; // Blanco para valores >= 100
    }
  };

  export const extractExercise = data => {
    const exercises = [];
    const contentArray = data[0]?.content;
    
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
            cod = item.json.code
            desc = item.json.text;
            mathExpr = item.json.initialExpression?.trim()
            ? item.json.initialExpression
            : item.json.steps[0].expression
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
            id = item.id
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
            id = item.id
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
          });
        }
        else {
            console.log("Caso no manejado:", item.json)
        }
      }
    });

    return exercises;
  };