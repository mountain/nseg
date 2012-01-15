/**
 * reusable-list.js: a reusable list
 *
 * nseg module: Node.js version of MMSEG for Chinese word segmentation
 * https://github.com/mountain/nseg/
 * MIT License
 *
 */

function ReusableList(initlen) {
    if (initlen <= 0) {
        throw 'initial length should be greater than zero!';
    }
    this.limit = initlen;
    this.length = 0;
    this.array = [];
    for (var i = 0; i < initlen; i++) {
        this.array[i] = null;
    }
}

ReusableList.check = true;

ReusableList.prototype.clear = function () {
    this.length = 0;
};

ReusableList.prototype.at = function (pos) {
    var len = this.length;
    if (ReusableList.check && pos > len) {
        throw 'index[' + pos + '] out of bound[' + len + ']';
    }
    return this.array[pos];
};

ReusableList.prototype.push = function (elem) {
    var pos = this.length, bnd = this.limit;
    if (ReusableList.check && pos > bnd) {
        throw 'index[' + pos + '] out of bound[' + bnd + ']';
    }
    this.array[pos] = elem;
};

ReusableList.prototype.pop = function () {
    var len = this.length;
    if (len > 0) {
        len--;
        this.length = len;
        return this.array[len];
    } else {
        throw 'empty list can not pop!';
    }
};

ReusableList.prototype.forEach = function (fn) {
    for (var i = 0, len = this.length; i < len; i++) {
        fn(this.array[i], i);
    }
};

ReusableList.prototype.join = function (delima) {
    return this.array.slice(0, this.length).join(delima);
};

ReusableList.prototype.concat = function (array) {
    if (!array) {
        return this;
    }
    if (this.length + array.length > this.limit) {
        throw 'exceed the limit!';
    }
    var pos = this.length;
    for (var i = 0, len = array.length; i < len; i++) {
        this.array[pos] = array[i];
        pos++;
    }
    this.length = pos;
    return this;
};

module.exports = function (initlen) {
    return new ReusableList(initlen);
};
