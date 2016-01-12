/**
 * Created by Administrator on 2015/10/28.
 */
$(document).ready(function(){
    $(".f-ly-init").show();
    Layout.setW();
    Layout.setPopBox();
    Layout.setMenu();
    Layout.setColumn();
    Layout.setRelativeAdv();
    Layout.setShow();
    Layout.setTab();
    Layout.setOverPulse();
    Layout.setBgChangeMouseOver();
});
$(window).resize(function(){
    $(".f-ly-init").show();
    Layout.setW();
    Layout.setPopBox();
    Layout.setMenu();
    Layout.setColumn();
    Layout.setRelativeAdv();
    Layout.setShow();
});
var Conf={
    debug:function(){
        return true;
    },
    nothing:function(){

    }
}
var w ;
/*布局*/
var Layout = {
    /*显示宽度*/
    setW:function(){
        w =  $(window).outerWidth(true);
        if( typeof (maxW) == "undefined" ){
            maxW = 480;
            if( maxW !=-1 && w > maxW ){
                $("body").css("max-width",maxW+"px");
                $("body").css("margin","auto");
                w = maxW;
            }
        }
    },
    /*弹窗*/
    setPopBox:function(){
        if( $(".f-pop-1").length>0){
            var tw = w - 40;
            tw = w>400?360:tw;
            $(".f-pop-1").css("width",tw);
            $(".f-pop-1").css("margin-left",Math.floor(tw/2)*-1);
            var btnNum = $(".f-pop-btn").length;
            var btnw = $(".f-pop-line").outerWidth();
            var btw = Math.floor(btnw/btnNum);
            $(".f-pop-btn").css("width",btw);
            $(".f-pop-btn").css("float","left");
            $(".f-pop-1").addClass("animated fadeIn");
        }
        $(".f-ly-mask").unbind("click");
        $(".f-ly-mask").click(function(){
            $(".f-ly-mask").hide();
           $(".f-pop-1").hide();
        });
    },
    /*菜单*/
    setMenu:function(){
        if( $(".f-ly-menu").length>0 && $(".f-menu-click").length>0 ){
            $(".f-menu-click").unbind("click");
            $(".f-menu-click").click(function(){
                if( $(".f-ly-menu").length>0){
                    if($(".f-ly-menu").css("display") == 'none'){
                        $(".f-ly-menu").show();
                    }else if($(".f-ly-menu").css("display") == 'block'){
                        $(".f-ly-menu").hide();
                    }
                }
            });
        }
    },
    setColumn:function(){
        /*列样式宽度==100等分*/
        if( $(".f-ly-column").length>0 ){
            $(".f-ly-column").each(function(i,col){
                    var mpb = Layout.getMPB(col);
                    var fixWidth = 0;
                    $(col).find("div[col]").each(function(index,obj){
                        var p = $(obj).attr("col");
                        if(p.indexOf("px") != -1){
                            fixWidth += parseInt(p);
                        }
                    });
                    var thiwidth = $(col).width() >= w?w:$(col).width();
                    var cw = thiwidth=0?w:thiwidth-mpb[0][1] - mpb[0][3]-mpb[1][1] - mpb[1][3]-mpb[2][1] - mpb[2][3] - fixWidth;
                    Log.d(this,"mpb->",mpb,"the row width:",thiwidth);
                    $(col).find("div[col]").each(function(index,obj){
                        var p = $(obj).attr("col");
                        var setFun = function(){
                            var mpb = Layout.getMPB(obj);
                            if(p.indexOf("px") != -1){
                                var fixW = parseInt(p) -mpb[0][1] - mpb[0][3]-mpb[1][1] - mpb[1][3]-mpb[2][1] - mpb[2][3];
                                Log.d(col,"child fix width",fixW);
                                $(obj).css("width",fixW);
                            }else{
                                var pW = Math.floor ( parseInt(p) / 100 * cw  -mpb[0][1] - mpb[0][3]-mpb[1][1] - mpb[1][3]-mpb[2][1] - mpb[2][3]);
                                Log.d(col,"child % width",pW);
                                $(obj).css("width", pW);
                            }

                        };
                        setFun();
                        $(col).resize(function(){
                            setFun();
                        });
                    });
                }
            );
        }
    },
    setRelativeAdv:function(){
        /*递归计算边距*/
        var calculate = function( attr , element ,r){
            var value = $(element).attr(attr);
            if( typeof(value) == "undefined" ){
                return 0;
            }
            var values = value.split(">");
            if( values.length == 2 ){
                var self = isNaN(parseInt(values[1]))?0:parseInt(values[1]);
                var p = $("[rid="+values[0]+"]");
                var diff = 0;
                if( attr == "left" || attr == "right"){
                    diff = p.outerWidth(true);
                }else if( attr == "top" || attr == "bottom" ){
                    diff = p.outerHeight(true);
                }
                return diff + self+calculate(attr,p);
            }

            if( values.length == 1){
                return isNaN(parseInt(values[0])) ? 0 : parseInt(values[0]);
            }
             return 0;
        };
        var r = $(".f-ly-relative");
        if( typeof(r) != "undefined" && r.length > 0 ){
            //如果定义了高度，则固定高度
            //如果没定义高度，会根据margin-top，margin-bottom，element height计算高度
            $(r).each(function(i,cr){

                var maxH  = $(this).attr("height")?parseInt($(cr).attr("height")):0;

                if(maxH == 0 ){
                    var hAry = new Array();
                    var childs = $(this).children();
                    for(var ii = childs.length-1;ii>=0;ii--){
                        var colIndex = isNaN(parseInt($(childs[ii]).attr("col")))?0:parseInt($(childs[ii]).attr("col")) - 1;
                       // var tp = calculate("top",$(childs[ii]),cr);
                        var tp = calculate("top",$(childs[ii]),this);
                        Log.d(cr,ii,tp);
                        var bt = $(childs[ii]).attr("bottom")?parseInt($(childs[ii]).attr("bottom")):0;
                        if( hAry[colIndex] ){
                            if( $(childs[ii]).outerHeight()+tp+bt > hAry[colIndex] ){
                                hAry[colIndex] = $(childs[ii]).outerHeight()+tp+bt;
                            }
                        }
                        Log.d(cr,"子元素["+ii+"]高度",$(childs[ii]).outerHeight(),"marginTop",tp,"marginBottom",bt,$(childs[ii]));
                        hAry.push($(childs[ii]).outerHeight()+tp+bt);
                    }
                    Log.d(cr,"计算relativie高度",hAry);
                    maxH = hAry[0];
                    $.each(hAry,function(i,o){
                        if( o > maxH ){
                            maxH = o;
                        }
                    });

                }
                $(cr).css("height",maxH);
                $(cr).children().each(function(ii,child){
                    $(child).css("position","absolute");

                    var childH = $(child).outerHeight();
                    var top =  calculate("top",child,this);// isNaN(parseInt($(child).attr("top")))?0:parseInt($(child).attr("top"));
                    var right = calculate("right",child,this);// isNaN(parseInt($(child).attr("right")))?0:parseInt($(child).attr("right"));
                    var bottom = calculate("bottom",child,this);//  isNaN(parseInt($(child).attr("bottom")))?0:parseInt($(child).attr("bottom"));
                    var left = calculate("left",child,this);//  isNaN(parseInt($(child).attr("left")))?0:parseInt($(child).attr("left"));
                    //vertical
                    if( $(child).attr("v") && $(child).attr("v") == "middle"){
                        top = Math.floor( (maxH - childH)/2 );
                        $(child).css("top",top);
                    }else if ( $(child).attr("v") && $(child).attr("v") == "top"){
                        $(child).css("top",0);
                    }else if ( $(child).attr("v") && $(child).attr("v") == "bottom"){
                        $(child).css("bottom",0);
                    }else {
                        if( $(child).attr("top") ){
                            $(child).css("top",top);
                        }
                        if( $(child).attr("bottom")){
                            $(child).css("bottom",bottom);
                        }
                    }

                    if( $(child).attr("h") && $(child).attr("h") == "center"){
                        left = Math.floor( ( $(cr).width() - $(child).width() )/2 );
                        $(child).css("left",left);
                    }else if ( $(child).attr("h") && $(child).attr("h") == "left"){
                        $(child).css("left",0);
                    }else if ( $(child).attr("h") && $(child).attr("h") == "right"){
                        $(child).css("right",0);
                    }else{
                        if( $(child).attr("left") ){
                            $(child).css("left",left);
                        }
                        if( $(child).attr("right") ){
                            $(child).css("right",right);
                        }
                    }
                    var crmpb = Layout.getMPB(cr);

                    var childmbp = Layout.getMPB(child);
                    var tbdiff = crmpb[0][0] + crmpb[0][2] + crmpb[1][0] +  crmpb[1][2] + crmpb[2][0] + crmpb[2][2]
                                + childmbp[0][0] + childmbp[0][2] + childmbp[1][0] +  childmbp[1][2] + childmbp[2][0] + childmbp[2][2];
                    var rldiff = crmpb[0][1] + crmpb[0][3] +  crmpb[1][1] + crmpb[1][3] + crmpb[2][1] + crmpb[2][3]
                                + childmbp[0][1] + childmbp[0][3] +  childmbp[1][1] + childmbp[1][3] + childmbp[2][1] + childmbp[2][3];
                    //设置子元素宽 高
                    if( $(child).attr("top") && $(child).attr("bottom") ){
                        $(child).css("height",maxH - top - bottom - tbdiff );
                    }
                    if( $(child).attr("left") && $(child).attr("right")){
                         $(child).css("width",w - left - right- rldiff );
                    }
                    //$(child).css("width","100%");
                });

            });
        }
    },

    setShow:function(){
        $(".f-ly-init").hide();
    },
    setTab:function(){
        if( $(".f-tab").length == 0 ){
            return ;
        }
        var menuDH = 48;
        var menuH = $(".f-tab-menu-box").attr("height")?parseInt($(".f-tab-menu-box").attr("height")):menuDH;
        var borderH = parseInt( $(".f-tab-main-box").css("borderTopWidth")) ;
        $(".f-tab-menu-box").css("height",menuH+borderH);
        $(".f-tab-main-box").css("margin-top",borderH*-1);
        $(".f-tab-menu li").css("height",menuH);

        if( !$(".f-tab-menu>li").attr("lineHeight") ){
            $(".f-tab-menu>li").css("line-height", (menuH - 1)+"px");
        }else{
            $(".f-tab-menu>li").css("line-height",$(".f-tab-menu li").attr("lineHeight")+"px" );
        }

        $(".f-tab").each(function(i,o){
            var mainBoxs = $(this).find(".f-tab-main-box .f-tab-main>div");
            mainBoxs.css("display","none");
            $(mainBoxs[0]).css("display","block");
            var tabMenuLis = $(this).find(".f-tab-menu>li");
            var event = $(this).attr("mouse-event");
            if( tabMenuLis.length == 1){
                tabMenuLis.css("cursor","default");
                $(tabMenuLis[0]).children().css("cursor","default");
                return ;
            }

            tabMenuLis.each(function(ii,oo){
                if(event == 'mouseover'){
                    $(this).unbind("mouseover");
                    $(this).mouseover(function(){
                        var index = parseInt($(this).attr("index"));
                        if( index == -1){
                            return;
                        }
                        mainBoxs.css("display","none");
                        tabMenuLis.removeClass("hover");
                        $(tabMenuLis[index]).addClass("hover");
                        $(mainBoxs[index]).css("display","block");
                        $(mainBoxs[index]).addClass("animated fadeIn");
                    });
                }else if(event == 'click'){
                    $(this).unbind("click");
                    $(this).click(function(){
                        var index = parseInt($(this).attr("index"));
                        if( index == -1){
                            return;
                        }
                        mainBoxs.css("display","none");
                        tabMenuLis.removeClass("hover");
                        $(tabMenuLis[index]).addClass("hover");
                        $(mainBoxs[index]).css("display","block");
                        $(mainBoxs[index]).addClass("animated fadeIn");
                    });
                }
            });
        });
    },
    getMPB:function(o){
        var mt = isNaN( parseInt($(o).css("marginTop")) )?0:parseInt($(o).css("marginTop"));
        var mb = isNaN( parseInt($(o).css("marginBottom")) )?0:parseInt($(o).css("marginBottom"));
        var ml = isNaN( parseInt($(o).css("marginLeft")) )?0:parseInt($(o).css("marginLeft"));
        var mr = isNaN( parseInt($(o).css("marginRight")) )?0:parseInt($(o).css("marginRight"));

        var pt = isNaN( parseInt($(o).css("paddingTop")) )?0:parseInt($(o).css("paddingTop"));
        var pb = isNaN( parseInt($(o).css("paddingBottom")) )?0:parseInt($(o).css("paddingBottom"));
        var pl = isNaN( parseInt($(o).css("paddingLeft")) )?0:parseInt($(o).css("paddingLeft"));
        var pr = isNaN( parseInt($(o).css("paddingRight")) )?0:parseInt($(o).css("paddingRight"));

        var bt = isNaN( parseInt($(o).css("borderTopWidth")) )?0:parseInt($(o).css("borderTopWidth"));
        var bb = isNaN( parseInt($(o).css("borderBottomWidth")) )?0:parseInt($(o).css("borderBottomWidth"));
        var bl = isNaN( parseInt($(o).css("borderLeftWidth")) )?0:parseInt($(o).css("borderLeftWidth"));
        var br = isNaN( parseInt($(o).css("borderRightWidth")) )?0:parseInt($(o).css("borderRightWidth"));

       return [[mt,mr,mb,ml],[pt,pr,pb,pl],[bt,br,bb,bl]];
    },
    setOverPulse:function(){
        if($(".over-pulse").length<=0){
            return ;
        }
        $(".over-pulse").unbind("mouseover");
        $(".over-pulse").unbind("mouseout");
        $(".over-pulse").mouseover(function(){
            $(this).addClass("animated pulse");
        });
        $(".over-pulse").mouseout(function(){
            $(this).removeClass("animated pulse");
        });
    },
    setBgChangeMouseOver:function(){
        if( $(".f-bg-change-mo").length > 0){
            $(".f-bg-change-mo").unbind("mousemove");
            $(".f-bg-change-mo").unbind("mouseout");
            $(".f-bg-change-mo").mousemove(function(){
                $(this).addClass("f-mo-bg")
            });
            $(".f-bg-change-mo").mouseout(function(){
                $(this).removeClass("f-mo-bg")
            });
        }
    },
    noting:function(){

    }
}


var Log = {
    d:function(obj){
        if( !Conf.debug() ){
            return ;
        }
        if(typeof(console) != 'undefined'  && $(obj).attr("debug") ){
            var tag = $(obj).attr("debug");
            console.log(tag,"->",arguments);
        }
    },
    noting:function(){

    }
}