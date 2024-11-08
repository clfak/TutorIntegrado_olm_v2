interface model {
  mth: number;
  level: number;
}

const pval = (kcnames: Array<string>, uservalues: Record<string, model>): number => {
  let val = 0;
  let length = kcnames.length;
  if (length > 1) {
    for (var k of kcnames) {
      let value = uservalues[k];
      if (!value) continue;
      let value2 = value.level;
      if (!value || !value2) {
        length = length - 1;
        continue;
      }
      if (value2 >= value.mth) value2 = 1;
      val = val + value2;
    }
    if (length > 0) val = val / length;
    else val = 0;
  } else {
    let value = uservalues[kcnames[0]];
    if (value) {
      if (value.level >= value.mth) val = 1;
      else val = value.level;
    }
  }
  return val;
};

export const progresscalc = (
  kcnames: Array<string>,
  values: Array<{ id: string; json: Record<string, model> }>,
): number => {
  if (!kcnames && !values) return 0;
  let length = 1;
  let level = 0;
  if (length > 1) {
    for (var e of values) {
      level = level + pval(kcnames, e.json);
    }
    level = level / length;
  } else {
    level = pval(kcnames, values[0].json);
  }
  level = Number(level.toPrecision(2));
  return level;
};
