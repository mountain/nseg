exports.accept = function (ch, undecided, next) {
    if (ch === '[' || undecided && undecided.substring(0, 1) === '[') {
        if (ch !== ']') {
            return 0;
        } else {
            return 1;
        }
    } else {
        return -1;
    }
};

