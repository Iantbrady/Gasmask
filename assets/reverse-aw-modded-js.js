/**
 * Reverse-Engineered GSAP Core Module Base
 * Cleaned from Webpack boilerplate and vendor-specific hooks.
 */
// --- 1. Global Core Constants & Defaults ---
const GSAP_CONFIG = {
    autoSleep: 120,
    force3D: "auto",
    nullTargetWarn: 1,
    units: { lineHeight: "" }
};

const TWEEN_DEFAULTS = {
    duration: 0.5,
    overwrite: false,
    delay: 0
};

// Math & Performance Constants
const INFINITY = 1e8;
const PRECISION_LIMIT = 1e-8;
const TWO_PI = 2 * Math.PI;
const HALF_PI = TWO_PI / 4;

let globalAnimationId = 0;
const sqrt = Math.sqrt;
const cos = Math.cos;
const sin = Math.sin;

// --- 2. Type Checking & Validation Utilities ---
const isString = (val) => typeof val === "string";
const isFunction = (val) => typeof val === "function";
const isNumber = (val) => typeof val === "number";
const isUndefined = (val) => typeof val === "undefined";
const isObject = (val) => typeof val === "object";
const isTruthy = (val) => val !== false;

const hasWindow = () => typeof window !== "undefined";
const isCallableOrString = (val) => isFunction(val) || isString(val);
const isArrayView = (typeof ArrayBuffer === "function" && ArrayBuffer.isView) || (() => {});
const isArray = Array.isArray;

// --- 3. Regular Expressions (Parser Engines) ---
const REGEX_NUMBERS = /(?:-?\.?\d|\.)+/gi;
const REGEX_SCIENTIFIC = /[-+=.]*\d+[.e\-+]*\d*[e\-+]*\d*/g;
const REGEX_UNITS = /[-+=.]*\d+[.e-]*\d*[a-z%]*/g;
const REGEX_TWEEN_VALUES = /[-+=.]*\d+\.?\d*(?:e-|e\+)?\d*/gi;
const REGEX_RELATIVE = /[+-]=-?[.\d]+/;
const REGEX_NON_SPACE = /[^,'"\[\]\s]+/gi;
const REGEX_STRICT_UNIT = /^[+\-=e\s\d]*\d+[.\d]*([a-z]*|%)\s*$/i;

// --- 4. Internal State Registry ---
const plugins = {};
const easings = {};
let masterTimeline; // Assigned during initialization
const lazyTweens = [];
const emptyString = "";

// --- 5. Core Operational Engines ---
/**
 * Resolves an active harness or creates a target instance configuration block
 */
const getTargetState = (targets) => {
    let list = targets[0];
    if (isObject(list) || isFunction(list)) {
        targets = [targets];
    }
    
    // Resolve engine target descriptors safely 
    for (let i = targets.length; i--;) {
        if (targets[i] && !targets[i]._gsap) {
            targets[i]._gsap = {
                id: ++globalAnimationId,
                target: targets[i],
                harness: null // Populate when mapping external DOM or Canvas layers
            };
        }
    }
    return targets;
};

/**
 * Math utility for relative transformations (e.g., "+=20", "-=50")
 */
const calculateRelativeValue = (currentValue, transformationString) => {
    const operator = transformationString.charAt(0);
    const delta = parseFloat(transformationString.substr(2));
    const base = parseFloat(currentValue);

    if (operator === "+") return base + delta;
    if (operator === "-") return base - delta;
    if (operator === "*") return base * delta;
    return base / delta;
};

/**
 * Merges target configurations safely
 */
const shallowMerge = (target, source) => {
    for (const key in source) {
        if (!(key in target)) {
            target[key] = source[key];
        }
    }
    return target;
};

// --- 6. Exposing Public API Hook ---
export const GSAPCore = {
    config: GSAP_CONFIG,
    defaults: TWEEN_DEFAULTS,
    utils: {
        isString,
        isFunction,
        isNumber,
        isArray,
        getTargetState,
        calculateRelativeValue,
        shallowMerge
    }
};
