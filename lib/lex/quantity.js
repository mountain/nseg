/**
 * quantity.js: for Chinese quantities
 *
 * NSEG module: Node.js version of NSEG for Chinese word segmentation
 *
 * https://github.com/mountain/nseg/
 *
 * By Mingli Yuan <mingli.yuan+nseg@gmail.com> (http://onecorner.org/)
 *
 * MIT License
 *
 */

var pattern = /^(\d+)|(([一二两三四五六七八九零〇]+[十百千万亿兆]*)+$)/;

var quantities = /^下|世|两|个|串|事|亩|人|代|件|任|份|伙|位|例|侧|倍|元|克|党|关|具|册|出|击|刀|分|切|列|则|别|刹|刻|剂|剑|副|动|包|化|匹|区|十|千|半|单|卡|卷|厂|双|发|变|口|句|只|台|叶|号|吊|名|吨|听|吸|吹|员|周|味|咬|品|响|哥|嘴|回|团|国|圈|地|场|块|坨|城|培|堂|堆|声|壶|处|夜|大|天|头|套|女|姐|字|季|宗|实|审|室|家|宿|寸|对|封|小|尺|尾|局|层|届|屋|展|山|岁|师|帖|带|帮|幅|幕|幢|年|并|座|建|开|式|张|弹|息|成|战|截|户|所|扇|手|打|批|把|投|抹|拉|拍|拖|招|拳|持|指|按|挥|捆|排|推|掷|提|撮|支|教|文|斤|方|族|日|早|时|晃|晚|曲|月|服|期|本|朵|村|束|条|杯|极|枚|枝|枪|架|栋|栏|校|株|样|根|格|案|桌|档|桩|桶|梯|棵|楼|次|款|步|段|毛|毫|池|汽|波|滩|滴|炮|点|片|环|班|球|瓶|画|番|盆|盏|盒|盘|目|相|看|眨|眼|着|碗|碟|票|种|秒|窝|站|章|笔|等|箱|篇|簇|米|类|粒|系|级|组|缕|罐|群|脚|艘|节|行|袋|角|课|贴|起|趟|路|车|轮|辆|辈|边|进|连|遍|道|部|重|针|锅|门|间|队|阶|院|集|面|页|顶|项|顿|颗|餐|首$/;

function test(string) {
    return pattern.test(string);
}

exports.accept = function (ch, undecided, next) {
    if (test(ch) || test(undecided)) {
        if (quantities.test(ch)) {
            return 1;
        } else {
            return 0;
        }
    } else {
        return -1;
    }
};

