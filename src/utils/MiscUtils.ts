import { Config } from "./Config";

const copy = function(what, overrides) {
  let copy = Object.assign({}, what);
  if (overrides) {
    copy = Object.assign(copy, overrides);
  }
  return copy;
}

const getTransform = function(ctx) {
  if ('currentTransform' in ctx) {
    return ctx.currentTransform
  } else if ("getTransform" in ctx) {
    return ctx.getTransform();
  } else if (ctx.mozCurrentTransform) {
    let a = ctx.mozCurrentTransform;
    // restructure FF's array to an Matrix like object
    return { a: a[0], b: a[1], c: a[2], d: a[3], e: a[4], f: a[5] };
  }
};

export const nearly_format_file_url = (url: string) => {
  let title = "" ;

  try
  {
    const cut_after_first_occurence_of_char = (str:string , char: string) => {
      const idx = str.indexOf(char);
      if(idx > 0) {
        return str.substring(0, idx)
      }
      return str;
    };
    const last_delimiter_index = url.lastIndexOf("/");

    title = url.substring(last_delimiter_index + 1);
    title = cut_after_first_occurence_of_char(title, ".");
    title = cut_after_first_occurence_of_char(title, "?");
    title = cut_after_first_occurence_of_char(title, "#");
    title = decodeURIComponent(title);
  }
  catch(e) {
    title = url;
  }

  return title;
};

const getRotation = function(ctx) {
  let t = getTransform(ctx);
  let rad = Math.atan2(t.b, t.a);
  if (rad < 0) { // angle is > Math.PI
    rad += Math.PI * 2;
  }
  return rad;
};

const findByIdAndRemove = function(id) {
  const elem = document.getElementById(id);
  if (elem) {
    elem.remove();
  }
}

const mapObj = function(obj, fx) {
  return Object.keys(obj).reduce((accum, curVal) => {
    let val = fx(obj[curVal], curVal);

    if (val !== undefined && val !== null) {
      accum.push(val);
    }

    return accum;
  }, []);
}

const safeCall = function(fx) {
  try {
    fx();
  }
  catch (err) {
    console.error(err);
  }
}

const removeAllChildren = function(root) {
  while (root.firstChild) {
    root.removeChild(root.firstChild);
  }
}

export const escapeRegExp = (str) => {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

const replaceAll = function(where, find, replace) {
  return where.replace(new RegExp(escapeRegExp(find), 'g'), replace);
}

interface Replace_All_And_Count_Return {
  result: string;
  count: number;
};

export const replace_all_and_count = function(where, find, replace) {
  let count = 0;
  const regex = new RegExp(escapeRegExp(find), 'g');
  const result = where.replace(regex, (match, p1, offset, string, groups) => {
    count += 1;
    return replace;
  });

  const ret: Replace_All_And_Count_Return = {
    result: result,
    count: count
  };

  return ret;
}

const safeParseJson = function(str) {
  try {
    return JSON.parse(str);
  } catch (err) {
    alert("File is not a valid JSON file.");
  }
  return null;
}

const readFile = function(file) {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject("No file given.");
      return;
    }

    let reader = new FileReader();
    reader.readAsText(file);

    reader.onload = e => {
      resolve((<any>e.target).result as string);
    };
  });
}

const getBrowser = (): any => {
  if(BUILD_CONSTANT_TARGET_PLATFORM === "userscript") {
    console.log("=====================");
    console.log("=====================");
    console.log("=====================");
    console.log("=====================");
    console.log("=====================");
    console.log("=====================");
    console.log("=====================");
    console.log("=====================");
    console.log("=====================");
    console.log("=====================");
    console.log("=====================");
    console.error("getBrowser call in userscript!");
    console.trace();
  }
  return chrome || browser;
}

const injectScript = function(name) {
  console.log(`Injecting ${name}`);

  var s = document.createElement("script");
  s.async = false;
  s.src = getBrowser().extension.getURL(name);

  s.onload = () => { s.remove(); };
  document.head.appendChild(s);
}


const strIsNullOrEmpty = function(str) {
  return str === null || str === undefined || str.length <= 0 || str.trim().length <= 0;
}

const createCSSElement = function(css, id) {
  const el = document.createElement("style");
  el.innerHTML = css;
  el.id = id;
  return el;
}

export const LOGO_SVG_B64 = BUILD_CONSTANT_LOGO_B64;

export {
  getBrowser, readFile, safeParseJson,
  replaceAll, findByIdAndRemove,
  copy, getTransform, getRotation,
  safeCall, removeAllChildren,
  injectScript, strIsNullOrEmpty,
  mapObj, createCSSElement,
};

