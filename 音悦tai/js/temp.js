function hhh(wrap) {
  // 滑屏元素
  var wrap = wrap.children[0];
  // 元素一开始的位置和手指一开始的位置
  var startY = 0;
  var elementY = 0;
  var miniY = wrap.clientHeight - item.offsetHeight;
  // 快速滑屏的必要参数
  var lastTime = 0;
  var lastPoint = 0;
  var timeDis = 1;
  var pointDis = 0;

  wrap.addEventListener('touchstart',function (ev) {
    ev = ev || event;
    var touchC = ev.changedTouches[0];
    startY = touchC.clientY;
    elementY = cl.css(item,"translateY");
    item.style.transition = "none";

    lastTime = new Date().getTime();
    lastPoint = touchC.clientY;

    // 解决bug一：清除速度的残留
    pointDis = 0;
    item.handMove = false;
  })
  wrap.addEventListener('touchmove',function (ev) {
    ev = ev || event;
    var touchC = ev.changedTouches[0];
    var nowY = touchC.clientY;
    var disY = nowY -startY;

    // 快速滑屏的变量
    var nowTime = new Date().getTime();
    var nowPoint = touchC.clientY;
    timeDis = nowTime - lastTime;
    pointDis = nowPoint - lastPoint;


    lastTime = nowTime;
    lastPoint = nowPoint;
    /*
    * 橡皮筋效果：
    * 在move的过程中，每一次touchmove真正的有效距离在慢慢变小，元素的滑动距离还是在变大
    * translateY = elementY + disY*scale必须在判断语句内部，因为只有在判断内部的时候才需要出现橡皮筋效果；
    */
    var translateY = elementY+disY
    if(translateY > 0){
      item.handMove = true;
      //var scale = 1- translateY/document.documentElement.clientHeight;
      // scale范围（0，1）
      var scale = document.documentElement.clientHeight/(translateY+document.documentElement.clientHeight);
      translateY = cl.css(item,"translateY") + pointDis*scale;
      //translateY = 0;
    }else if (translateY < miniY){
      item.handMove = true;
      var over = miniY - translateY;
      var scale = document.documentElement.clientHeight/(over+document.documentElement.clientHeight);
      translateY = cl.css(item,"translateY") + pointDis*scale;
    }
    cl.css(item,"translateY",translateY);

  })
  wrap.addEventListener('touchend',function () {
    // 只有在不是手动滑屏的时候，才会触动快速滑屏
    var translateY = cl.css(item,"translateY")
    if(!item.handMove){
      // 最后一次结束滑屏时的速度,速度越大最终位移越远
      var speed = pointDis/timeDis;
      speed = Math.abs(speed) < 0.5?0:speed;
      var targetY = translateY + speed*200;

      var time = Math.abs(speed)*0.2;
      time = time < 0.7? 0.7:time;
      time = time > 2 ? 2:time;
      // 利用贝塞尔曲线来实现快速滑屏的橡皮筋效果；
      var bsr = '';
      if(targetY > 0){
        targetY = 0;
        bsr = "cubic-bezier(.26,1.51,.68,1.54)";
      } else if (targetY < miniY) {
        targetY = miniY;
        bsr = "cubic-bezier(.26,1.51,.68,1.54";
      }
      item.style.transition = time + "s " + bsr+ " transform";
      cl.css(item,"translateY",targetY);
    }else{
      //var translateY = cl.css(item,"translateY");
      item.style.transition = ".7s transform";
      if(translateY > 0){
        translateY = 0;
        cl.css(item,"translateY",translateY);
      } else if (translateY < miniY) {
        translateY = miniY;
        cl.css(item,"translateY",translateY);
      }
    }
  })
}