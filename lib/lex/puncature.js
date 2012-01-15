var pattern = /！|，|。|；|’|：|“|”|？|、|…|《|》|］|」|）|（|！|【|】|〖|〗|′|‵|·|『|』|﹃|﹄|﹁|﹂|「|」|︹|︺|︿|﹀|︽|︾|︻|︼|︷|︸|︵|︶|﹏|«|»|★|☆|●|○|•/;

exports.accept = function (ch, undecided) {
    return pattern.test(ch);
};


