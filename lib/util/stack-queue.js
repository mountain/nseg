/**
 * stack-queue.js: a reusable stack queue
 *
 * nmmseg module: Node.js version of MMSEG for Chinese word segmentation
 * https://github.com/mountain/nmmseg/
 * MIT License
 *
 */

function shallowCopy(src, dest) {
    for (var i = 0, len = src.length; i < len; i++) {
        dest[i] = src[i];
    }
}

function Block(array, limit, start) {
    this.array = array;
    this.limit = limit;
    this.start = start;
    this.length = 0;
}

Block.prototype.at = function (pos) {
    pos = (pos + this.start) % this.limit;
    return this.array[pos];
};

Block.prototype.push = function (elem) {
    var pos = (this.length + this.start) % this.limit;
    this.length = this.length + 1;
    //console.log('push', pos, elem);
    this.array[pos] = elem;
};

Block.prototype.pop = function () {
    var pos  = (this.length + this.start - 1) % this.limit,
        elem = this.array[pos];
    this.length = this.length - 1;
    return elem;
};

Block.prototype.take = function () {
    var pos = (this.length + this.start) % this.limit;
    this.length = this.length + 1;
    //console.log('take', pos);
    return this.array[pos];
};

Block.prototype.forEach = function (fn) {
    for (var i = 0, len = this.length; i < len; i++) {
        var pos  = (i + this.start) % this.limit,
            elem = this.array[pos];
        fn(elem, i);
    }
};

Block.prototype.concat = function (another) {
    var pos = (this.start + this.length) % this.limit;
    another.forEach(function (elem) {
        shallowCopy(elem, this.array[pos]);
        pos = (pos + 1) % this.limit;
    });
    this.length = this.length + another.length;
    return this;
};

Block.prototype.toArray = function () {
    var array = [];
    for (var i = 0, len = this.length; i < len; i++) {
        var pos  = (i + this.start) % this.limit,
            elem = this.array[pos];
        array[i] = elem;
    }
    return array;
};

function StackQueue(initlen) {
    if (initlen <= 0) {
        throw 'initial length should be greater than zero!';
    }
    this.limit = initlen;
    this.array = [];
    for (var i = 0; i < initlen; i++) {
        this.array[i] = [];
    }
    this.start = 0;
    this.blocks = [];
}

StackQueue.check = true;

//Claim at end of the circle
StackQueue.prototype.claim = function () {
    var blocks =  this.blocks, block, last, start;
    if (blocks.length === 0) {
        block  = new Block(this.array, this.limit, 0);
        this.start = 0;
    } else {
        last   = blocks[blocks.length - 1];
        start  = (last.start + last.length + 1) % this.limit;
        block  = new Block(this.array, this.limit, start);
        this.start = start;
    }
    blocks.push(block);
    //console.log('########################################');
    //console.log('claim', this.start);
    //this.blocks.forEach(function (elem) {
    //    console.log(elem.start, elem.length);
    //});
    //console.log('$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$');
    //block.forEach(function (elem) {
    //    console.log(elem);
    //});
    //console.log('########################################');
    return block;
};

//Dispose at begin of the circle
StackQueue.prototype.dispose = function () {
    this.blocks.shift();
    //console.log('########################################');
    //console.log('dispose');
    //console.log('########################################');
};

StackQueue.prototype.clear = function () {
    this.start = 0;
    this.blocks = [];
};

module.exports = function (initlen) {
    return new StackQueue(initlen);
};
