var pattern = /！|，|。|；|’|：|“|”|？|、|…|《|》|］|」|）|（|！|【|】|〖|〗|′|‵|·|『|』|﹃|﹄|﹁|﹂|「|」|︹|︺|︿|﹀|︽|︾|︻|︼|︷|︸|︵|︶|﹏|«|»|★|☆|●|○|•/;

exports.accept = function (ch, undecided, next) {
    if (pattern.test(ch)) {
        return 1;
    } else {
        return -1;
    }
};


