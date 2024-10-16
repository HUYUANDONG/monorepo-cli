import { isArray } from "./is";
type FieldNamesProps = {
  label: string;
  value: string;
  children?: string;
};

/**
 * @description 处理 prop，当 prop 为多级嵌套时 ==> 返回最后一级 prop
 * @param {String} prop 当前 prop
 * @returns {String}
 * */
function handleProp(prop: string) {
  const propArr = prop.split(".");
  if (propArr.length == 1) return prop;
  return propArr[propArr.length - 1];
}
function generateUUID() {
  let uuid = "";
  for (let i = 0; i < 32; i++) {
    let random = (Math.random() * 16) | 0;
    if (i === 8 || i === 12 || i === 16 || i === 20) uuid += "-";
    uuid += (i === 12 ? 4 : i === 16 ? (random & 3) | 8 : random).toString(16);
  }
  return uuid;
}

/**
 * @description 根据枚举列表查询当需要的数据（如果指定了 label 和 value 的 key值，会自动识别格式化）
 * @param {String} callValue 当前单元格值
 * @param {Array} enumData 字典列表
 * @param {Array} fieldNames label && value && children 的 key 值
 * @param {String} type 过滤类型（目前只有 tag）
 * @returns {String}
 * */
export function filterEnum(
  callValue: any,
  enumData?: any,
  fieldNames?: FieldNamesProps,
  type?: "tag"
) {
  const value = fieldNames?.value ?? "value";
  const label = fieldNames?.label ?? "label";
  const children = fieldNames?.children ?? "children";
  let filterData: { [key: string]: any } = {};
  // 判断 enumData 是否为数组
  if (Array.isArray(enumData))
    filterData = findItemNested(enumData, callValue, value, children);
  // 判断是否输出的结果为 tag 类型
  if (type == "tag") {
    return filterData?.tagType ? filterData.tagType : "";
  } else {
    return filterData ? filterData[label] : "--";
  }
}
/**
 * @description 递归查找 callValue 对应的 enum 值
 * */
export function findItemNested(
  enumData: any,
  callValue: any,
  value: string,
  children: string
) {
  return enumData.reduce((accumulator: any, current: any) => {
    if (accumulator) return accumulator;
    if (current[value] === callValue) return current;
    if (current[children])
      return findItemNested(current[children], callValue, value, children);
  }, null);
}
/**
 * @description 处理 ProTable 值为数组 || 无数据
 * @param {*} callValue 需要处理的值
 * @returns {String}
 * */
export function formatValue(callValue: any) {
  // 如果当前值为数组，使用 / 拼接（根据需求自定义）
  if (isArray(callValue))
    return callValue.length ? callValue.join(" / ") : "--";
  return callValue ?? "--";
}
/**
 * @description 处理 prop 为多级嵌套的情况，返回的数据 (列如: prop: user.name)
 * @param {Object} row 当前行数据
 * @param {String} prop 当前 prop
 * @returns {*}
 * */
export function handleRowAccordingToProp(
  row: { [key: string]: any },
  prop: string
) {
  if (!prop.includes(".")) return row[prop] ?? "--";
  prop.split(".").forEach((item) => (row = row[item] ?? "--"));
  return row;
}

/**
 * 获取任意数据的类型
 * @param { any } value
 * @returns { String } // 数据类型
 */
export function getTypes(value: any) {
  let origin = Object.prototype.toString.call(value);
  return origin.split(" ")[1].slice(0, -1).toLocaleLowerCase();
}

/**
 * 获取文件blob url
 * @param { Object } file 文件对象
 * @returns { String } blob url
 */
export function getBlobUrl(file: File) {
  if (!file) {
    console.error(new Error("请传入file参数"));
    return;
  }
  return window.URL && window.URL.createObjectURL
    ? window.URL.createObjectURL(file)
    : window.webkitURL.createObjectURL(file);
}

/**
 * 使用a标签下载文件
 * a标签下载文件只能下载不能被浏览器直接打开的文件，图片格式的文件会被直接打开
 * @param { String } url
 * @param { String } fileName
 */
export function download(url: string, fileName = "文件名") {
  const tempLink = createLinkDom(url, fileName);

  setTimeout(function () {
    document.body.removeChild(tempLink);
  }, 200);
}

/**
 * 下载流文件
 * @github https://github.com/kennethjiang/js-file-download
 */
export function downloadForStream(
  data: string,
  filename: string,
  mime?: string,
  bom?: string
) {
  var blobData = typeof bom !== "undefined" ? [bom, data] : [data];
  var blob = new Blob(blobData, { type: mime || "application/octet-stream" });
  if (typeof window.navigator.msSaveBlob !== "undefined") {
    // IE workaround for "HTML7007: One or more blob URLs were
    // revoked by closing the blob for which they were created.
    // These URLs will no longer resolve as the data backing
    // the URL has been freed."
    window.navigator.msSaveBlob(blob, filename);
  } else {
    var blobURL =
      window.URL && window.URL.createObjectURL
        ? window.URL.createObjectURL(blob)
        : window.webkitURL.createObjectURL(blob);
    const tempLink = createLinkDom(blobURL, filename);

    // Fixes "webkit blob resource error 1"
    setTimeout(function () {
      document.body.removeChild(tempLink);
      window.URL.revokeObjectURL(blobURL);
    }, 200);
  }
}

/**
 * 创建a标签下载文件
 * @param { String } url
 * @param { String } filename
 *
 */
function createLinkDom(url: string, filename: string) {
  var tempLink = document.createElement("a");
  tempLink.style.display = "none";
  tempLink.href = url;
  tempLink.setAttribute("download", filename);

  if (typeof tempLink.download === "undefined") {
    tempLink.setAttribute("target", "_blank");
  }

  document.body.appendChild(tempLink);
  tempLink.click();
  return tempLink;
}

function getS() {
  return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
}
function guid() {
  return `${getS()}${getS()}-${getS()}`;
}

function guid2() {
  return `${getS()}${getS()}`;
}

export { handleProp, generateUUID, $on, $once, $off, $emit, guid, guid2 };
