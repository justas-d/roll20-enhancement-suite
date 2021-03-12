const spliceOrWarn = <T>(array: T[], idx: number, err: string, obj: any) => {
  if(idx === -1) {
    console.log(`Tried to ${err} but couldn't find object!`, array, obj);
  } else {
    array.splice(idx, 1);
  }
};

export const removeByReference = <T>(array: T[], obj: T) => {
  const idx = array.findIndex(p => p == obj);
  spliceOrWarn(array, idx, "remove by reference", obj);
};

export const removeOnceByPredicate = <T>(array: T[], predicate: (data: T) => boolean) => {
  const idx = array.findIndex(predicate);
  spliceOrWarn(array, idx, "remove once by predicate", predicate);
};
