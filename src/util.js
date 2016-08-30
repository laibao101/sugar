var OP = Object.prototype;
var has = OP.hasOwnProperty;

/**
 * typeof 类型检测
 * @param   {Mix}      test
 * @param   {String}   type
 * @return  {Boolean}
 */
function typeOf (test, type) {
	return typeof test === type;
}

/**
 * 是否是对象
 */
export function isObject (object) {
	return OP.toString.call(object) === '[object Object]';
}

/**
 * 是否是数组
 */
export function isArray (array) {
	return Array.isArray(array);
}

/**
 * 是否是函数
 */
export function isFunc (func) {
	return typeOf(func, 'function');
}

/**
 * 是否是字符串
 */
export function isString (str) {
	return typeOf(str, 'string');
}

/**
 * 是否是布尔值
 */
export function isBool (bool) {
	return typeOf(bool, 'boolean');
}

/**
 * 是否是数字
 */
export function isNumber (num) {
	return typeOf(num, 'number') && !isNaN(num);
}

/**
 * 是否是纯粹对象
 */
export function isPlainObject (object) {
	if (!object || !isObject(object) || object.nodeType || object === object.window) {
		return false;
	}

	if (object.constructor && !has.call(object.constructor.prototype, 'isPrototypeOf')) {
		return false;
	}

	return true;
}

/**
 * 是否是空对象
 * @param   {Object}   object
 * @return  {Boolean}
 */
export function isEmptyObject (object) {
	return Object.keys(object).length === 0;
}

/**
 * value 转成 Number 类型
 * @param   {String|Mix}  value
 * @return  {Number|Mix}
 */
export function toNumber (value) {
	if (isString(value)) {
		let val = Number(value);
		return isNumber(val) ? val : value;
	} else {
		return value;
	}
}

/**
 * 可选的数据格式化
 * @param   {String}   value
 * @param   {Boolean}  convertToNumber
 * @return  {Number}
 */
export function formatValue (value, convertToNumber) {
	return convertToNumber ? toNumber(value) : value;
}

/**
 * 空操作函数
 */
export function noop () {}

var cons = window.console;

/**
 * 打印警告信息
 */
/* istanbul ignore next */
export function warn () {
	if (cons) {
		cons.warn.apply(cons, arguments);
	}
}

/**
 * 打印错误信息
 */
/* istanbul ignore next */
export function error () {
	if (cons) {
		cons.error.apply(cons, arguments);
	}
}

/*
 * 对象自有属性检测
 */
export function hasOwn (obj, key) {
	return obj && has.call(obj, key);
}

/**
 * object 定义或修改 property 属性
 * @param   {Object}   object        [对象]
 * @param   {String}   property      [属性字段]
 * @param   {Mix}      value         [属性的修改值/新值]
 * @param   {Boolean}  writable      [属性是否能被赋值运算符改变]
 * @param   {Boolean}  enumerable    [属性是否出现在枚举中]
 * @param   {Boolean}  configurable  [属性是否能够被改变或删除]
 */
function def (object, property, value, writable, enumerable, configurable) {
	return Object.defineProperty(object, property, {
		'value'       : value,
		'writable'    : !!writable,
		'enumerable'  : !!enumerable,
		'configurable': !!configurable
	});
}

/**
 * 将 object[property] 定义为一个不可枚举的属性
 */
export function defRec (object, property, value) {
	return def(object, property, value, true, false, true);
}

/**
 * 遍历数组或对象，提供删除选项和退出遍历的功能
 * @param  {Array|Object}  iterator  [数组或对象]
 * @param  {Fuction}       callback  [回调函数]
 * @param  {Object}        context   [作用域]
 */
export function each (iterator, callback, context) {
	var i, ret;

	if (!context) {
		context = this;
	}

	// 数组
	if (isArray(iterator)) {
		for (i = 0; i < iterator.length; i++) {
			ret = callback.call(context, iterator[i], i, iterator);

			// 回调返回 false 退出循环
			if (ret === false) {
				break;
			}

			// 回调返回 null 从原数组删除当前选项
			if (ret === null) {
				iterator.splice(i, 1);
				i--;
			}
		}

	} else if (isObject(iterator)) {
		let keys = Object.keys(iterator);

		for (i = 0; i < keys.length; i++) {
			let key = keys[i];

			ret = callback.call(context, iterator[key], key, iterator);

			// 回调返回 false 退出循环
			if (ret === false) {
				break;
			}

			// 回调返回 null 从原对象删除当前选项
			if (ret === null) {
				delete iterator[key];
			}
		}
	}
}

/**
 * 删除 object 所有属性
 * @param   {Object}   object
 */
export function clearObject (object) {
	each(object, function () {
		return null;
	});
}

/**
 * 扩展合并对象，摘自 jQuery
 */
export function extend () {
	var options, name, src, copy, copyIsArray, clone;
	var target = arguments[0] || {}, i = 1, length = arguments.length, deep = false;

	// Handle a deep copy situation
	if (isBool(target)) {
		deep = target;
		target = arguments[i] || {};
		i++;
	}

	// Handle case when target is a string or something (possible in deep copy)
	if (typeof target !== 'object' && !isFunc(target)) {
		target = {};
	}

	// Extend Util itself if only one argument is passed
	if (i === length) {
		target = this;
		i--;
	}

	for (; i < length; i++) {
		// Only deal with non-null/undefined values
		if ((options = arguments[i]) != null) {
			// Extend the base object
			for (name in options) {
				src = target[name];
				copy = options[name];

				// Prevent never-ending loop
				if (target === copy) {
					continue;
				}

				// Recurse if we're merging plain objects or arrays
				if (deep && copy && (isPlainObject(copy) || (copyIsArray = isArray(copy)))) {
					if (copyIsArray) {
						copyIsArray = false;
						clone = src && isArray(src) ? src : [];

					} else {
						clone = src && isPlainObject(src) ? src : {};
					}

					// Never move original objects, clone them
					target[name] = extend(deep, clone, copy);
				}
				// Don't bring in undefined values
				else if (copy !== undefined) {
					target[name] = copy;
				}
			}
		}
	}

	// Return the modified object
	return target;
}

/**
 * 复制对象或数组，其他类型原样返回
 * @param   {Object|Array}  target
 * @return  {Mix}
 */
export function copy (target) {
	var isA = isArray(target);
	var isO = isObject(target);
	var tmp = isA ? [] : (isO ? {} : null);

	if (tmp) {
		return extend(true, tmp, target);
	} else {
		return target;
	}
}

/**
 * 拆解字符键值对，返回键值数组
 * @param   {String}        expression
 * @param   {Boolean}       both
 * @return  {String|Array}
 */
export function getKeyValue (expression, both) {
	var array = expression.split(':');
	return both ? array : array.pop();
}


/**
 * 创建一个空的 dom 元素
 * @param   {String}  tag  [元素标签名称]
 * @return  {Elemnt}
 */
export function createElement (tag) {
	return document.createElement(tag);
}

/**
 * 返回一个空文档碎片
 * @return  {Fragment}
 */
export function createFragment () {
	return document.createDocumentFragment();
}

/**
 * element 的子节点转换成文档片段（element 将会被清空）
 * @param  {Element}  element
 */
export function nodeToFragment (element) {
	var child;
	var fragment = createFragment();

	while (child = element.firstChild) {
		fragment.appendChild(child);
	}

	return fragment;
}

/**
 * 字符串 html 转文档碎片
 * @param   {String}    html
 * @return  {Fragment}
 */
export function stringToFragment (html) {
	var fragment;

	// 存在标签
	if (/<[^>]+>/g.test(html)) {
		let div = createElement('div');
		div.innerHTML = html;
		fragment = nodeToFragment(div);
	}
	// 纯文本节点
	else {
		fragment = createFragment();
		fragment.appendChild(document.createTextNode(html));
	}

	return fragment;
}

/**
 * 去掉字符串中所有空格
 * @param   {String}  string
 * @return  {String}
 */
const regSpaceAll = /\s/g;
export function removeSpace (string) {
	return string.replace(regSpaceAll, '');
}

/**
 * 返回 contrastObject 相对于 referObject 的差异对象
 * @param   {Object}  contrastObject  [对比对象]
 * @param   {Object}  referObject     [参照对象]
 * @return  {Object}
 */
function getUniqueObject (contrastObject, referObject) {
	var unique = {};

	each(contrastObject, function (value, key) {
		var _diff, oldItem = referObject[key];

		if (isObject(value)) {
			_diff = getUniqueObject(value, oldItem);
			if (!isEmptyObject(_diff)) {
				unique[key] = _diff;
			}
		} else if (isArray(value)) {
			var newArray = [];

			each(value, function (nItem, index) {
				var _diff;

				if (isObject(nItem)) {
					_diff = getUniqueObject(nItem, oldItem[index]);
					newArray.push(_diff);
				}
				else {
					// 新数组元素
					if (oldItem.indexOf(nItem) < 0) {
						newArray.push(nItem);
					}
				}
			});

			unique[key] = newArray;
		} else {
			if (value !== oldItem) {
				unique[key] = value;
			}
		}
	});

	return unique;
}

/**
 * 返回 contrastArray 相对于 referArray 的差异数组
 * @param   {Array}  contrastArray  [对比数组]
 * @param   {Array}  referArray     [参照数组]
 * @return  {Array}
 */
function getUniqueArray (contrastArray, referArray) {
	var uniques = [];

	if (!isArray(contrastArray) || !isArray(referArray)) {
		return contrastArray;
	}

	each(contrastArray, function (item) {
		if (referArray.indexOf(item) < 0) {
			uniques.push(item);
		}
	});

	return uniques;
}

/**
 * 返回两个比较值的差异
 * 用于获取 v-bind 绑定 object 的更新差异
 * @param   {Object|Array}  newTarget
 * @param   {Object|Array}  oldTarget
 * @return  {Object}
 */
export function diff (newTarget, oldTarget) {
	var isA = isArray(newTarget) && isArray(oldTarget);
	var isO = isObject(newTarget) && isObject(oldTarget);
	var handler = isO ? getUniqueObject : (isA ? getUniqueArray : null);

	var after = handler && handler(newTarget, oldTarget) || newTarget;
	var before = handler && handler(oldTarget, newTarget) || oldTarget;

	return { after, before };
}

export default {
	each,
	copy,
	extend,
	hasOwn,
	defRec,

	isFunc,
	isBool,
	isArray,
	isObject,
	isNumber,
	isString,
	isEmptyObject
}