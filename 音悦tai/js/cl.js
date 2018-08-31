!(function (w) {
  // 将函数绑给window的cl属性上
  w.cl = {};
  w.cl.css = function(node,type,val) {
    // 判断节点transform对象是否存在，不存在则添加
    if (typeof node === "object" && typeof node["transform"] == "undefined") {
      node["transform"] = {};
    }
    if(arguments.length >= 3){// 写操作
      //设置
      var text = "";
      // 加入两次传入同样属性的变换，则会被覆盖
      // 只会更改改变的值，之前没有改变的值则不会改变
      node["transform"][type] = val;
      // in操作符，会查找对象实例本身及原型链上所有的属性，可能会对后续操作产生影响
      for (item in node["transform"]) {
        if(node["transform"].hasOwnProperty(item)){
          switch (item){
            case "translateX":
            case "translateY":
            case "translateZ":
              text += item + "(" + node["transform"][item] + "px)";
              break;
            case "scale":
              text += item + "(" + node["transform"][item] + ")";
              break;
            case "roate":
              text += item + "(" + node["transform"][item] + "deg)";
              break;
          }
        }
      }
      // 兼容性问题
      node.style.transform = node.style.webkitTransform = text;
    }else if(arguments.length == 2){
      // 读操作
      // 此时只传入了2个参数，第3个参数并没有用上，所以可以利用未使用的第3个参数返回结果
      val = node["transform"][type];
      if (typeof val === 'undefined'){
        switch (type){
          case "translateX":
          case "translateY":
          case "translateZ":
          case "rotate":
            val = 0;
            break;
          case "scale":
            val = 1;
            break;
        }
      }
      return val;
    }
  }
  w.cl.carousel = function(arr) {
    // 布局
    var carouselWrap = document.querySelector(".carousel-wrap");
    if(carouselWrap){
      var pointsLength = arr.length;

      // 无缝
      var needCarousel = carouselWrap.getAttribute('needCarousel');
      needCarousel = needCarousel == null? false:true;
      //console.log(needCarousel);
      if(needCarousel){
        arr = arr.concat(arr);
      }
      var ulNode = document.createElement('ul');
      cl.css(ulNode,"translateZ",0);
      var styleNode = document.createElement('style')
      ulNode.classList.add('list');
      for(var i=0;i<arr.length;i++){
        ulNode.innerHTML += "<li><a href='javascript:;'><img src="+ arr[i] + " alt='picture'></a></li>"
      }
      styleNode.innerHTML = ".carousel-wrap > .list{width:"+ (arr.length*100) +"%;}.carousel-wrap > .list > li{width:"+ (1/arr.length*100) +"%;}"
      carouselWrap.appendChild(ulNode);
      document.head.appendChild(styleNode);
      var imgNode = document.querySelector('.carousel-wrap > .list > li > a > img')
      // 如果不设置定时器，可能获取到img时，还没有渲染完，此时无法获取其高度
      setTimeout(function () {
        carouselWrap.style.height = imgNode.offsetHeight + 'px';
      },100)
      var pointsWrap = document.querySelector('.carousel-wrap > .points-wrap');
      if(pointsWrap) {
        for (var i = 0; i < pointsLength; i++) {
          if(i == 0){
            pointsWrap.innerHTML += "<span class='active'></span>";
          } else {
            pointsWrap.innerHTML += "<span></span>";
          }

        }
        var pointsSpan = document.querySelectorAll('.carousel-wrap > .points-wrap > span');
      }

      // 滑屏
      /*
      * 1 拿到元素一开始的位置
      * 2 拿到手指一开始点击的位置
      * 3 拿到手指move的实时距离
      * 4 将手指移动的距离加给元素
      */
      /*防抖动逻辑
      *   1、判断用户首次滑屏方向(只判断一次)
      *   2、如果是X轴，以后不管怎么滑都会抖动
      *   3、如果是Y轴，以后不管用户怎么滑都不会抖动
      * */
      var index = 0;
      // 手指的位置
      var startX = 0;
      var startY = 0
      // 元素的位置
      var elementX = 0;
      var elementY = 0;
      // 首次滑屏方向
      var isX = true;
      // 判断是否是首次滑动
      var isFirst = true;
      // 保存实时偏移量
      //var translateX = 0;
      carouselWrap.addEventListener('touchstart',function (ev) {
        ev = ev || event;
        // changedTouches是列表，取一个就够了
        var touchC = ev.changedTouches[0];
        ulNode.style.transition = 'none';
        // 无缝逻辑，点击第一组的第一张是瞬间跳到第二组的第一张
        //点击第二组的最后一张时，瞬间跳到第一组的最后一张
        // index代表ul的位置
        // 无缝
        if(needCarousel){
          var index = cl.css(ulNode,"translateX")/document.documentElement.clientWidth;
          if(-index === 0){
            index = -pointsLength;
          } else if (-index === arr.length-1) {
            index = -pointsLength + 1;
          }
          cl.css(ulNode,"translateX",index*document.documentElement.clientWidth);
        }
        startX = touchC.clientX;
        startY = touchC.clientY;
        //elementX = ulNode.offsetLeft;
        //elementX = translateX;
        elementX = cl.css(ulNode,"translateX");
        elementY = cl.css(ulNode,"translateY");

        // 停止自动轮播
        clearInterval(timer)
        isX = true;
        isFirst = true;
      })
      carouselWrap.addEventListener('touchmove',function (ev) {
        // 二次以后的防抖动
        if (!isX){// 在Y轴方向上滑动
          return;
        }
        ev = ev || event;
        var touchC = ev.changedTouches[0]
        // 获取滑动时手指的位置
        var nowX = touchC.clientX;
        var nowY = touchC.clientY;
        // 手指移动的距离
        var disX = nowX - startX;
        var disY = nowY - startY;

        // 首次判断用户的滑动方向
        if(isFirst){
          isFirst = false;
          // 判断用户的滑动方向
          if(Math.abs(disY) > Math.abs(disX)){// 在Y轴方向上滑动
            isX = false;
            // 首次防抖
            return;
          }
        }

        cl.css(ulNode,"translateX",elementX+disX);
      })
      carouselWrap.addEventListener('touchend',function (ev) {
        ev = ev || event;
        //var index = ulNode.offsetLeft/document.documentElement.clientWidth;
        //var index = translateX/document.documentElement.clientWidth;
        index = cl.css(ulNode,"translateX")/document.documentElement.clientWidth;
        index = Math.round(index)
        if(index > 0){
          index = 0
        } else if (index < -arr.length+1) {
          index = -arr.length+1
        }
        syncPoints(index)
        ulNode.style.transition = '.5s left';
        //ulNode.style.left = index * (document.documentElement.clientWidth) + 'px'
        // translate造成的元素偏移并不会同步到offsetLeft上，因为两者不在同个一个图层
        //translateX = index * (document.documentElement.clientWidth)
        //ulNode.style.transform = "translateX("+ translateX + "px)" ;
        cl.css(ulNode,"translateX",index * (document.documentElement.clientWidth));
        // 开启自动轮播
        if(needAuto){
          auto();
        }
      })

      // 自动轮播
      var timer = 0;
      var needAuto = carouselWrap.getAttribute('needAuto')
      needAuto = needAuto == null ? false:true;
      //console.log(needAuto);
      if(needAuto){
        auto();
      }
      function auto() {
        clearInterval(timer)
        timer = setInterval(function () {
          if(index === -arr.length+1){
            ulNode.style.transition = "none";
            index = -arr.length/2+1;
            cl.css(ulNode,"translateX",index*document.documentElement.clientWidth)
          }
          setTimeout(function () {
            index--;
            ulNode.style.transition = "1s transform"
            syncPoints(index)
            cl.css(ulNode,"translateX",index*document.documentElement.clientWidth)
          },50)

        },2000)
      }

      // 同步小圆点的函数
      function syncPoints(index) {
        if(!pointsWrap){
          return;
        }
        // 同步小圆点
        for (var i = 0; i < pointsSpan.length; i++) {
          pointsSpan[i].classList.remove('active');
        }
        pointsSpan[-index%pointsLength].classList.add('active');
      }
    }
  }
  w.cl.dragNav = function (){
    // 滑屏区域
    var wrap = document.querySelector(".cl-drag-nav");
    // 滑屏元素
    var item = document.querySelector(".cl-drag-nav .list");
    // 元素一开始的位置和手指一开始的位置
    var startX = 0;
    var elementX = 0;
    var miniX = wrap.clientWidth - item.offsetWidth;
    // 快速滑屏的必要参数
    var lastTime = 0;
    var lastPoint = 0;
    var timeDis = 1;
    var pointDis = 0;

    wrap.addEventListener('touchstart',function (ev) {
      ev = ev || event;
      var touchC = ev.changedTouches[0];
      startX = touchC.clientX;
      elementX = cl.css(item,"translateX");
      item.style.transition = "none";

      lastTime = new Date().getTime();
      lastPoint = touchC.clientX;

      // 解决bug一：清除速度的残留
      pointDis = 0;
      item.handMove = false;
    })
    wrap.addEventListener('touchmove',function (ev) {
      ev = ev || event;
      var touchC = ev.changedTouches[0];
      var nowX = touchC.clientX;
      var disX = nowX -startX;

      // 快速滑屏的变量
      var nowTime = new Date().getTime();
      var nowPoint = touchC.clientX;
      timeDis = nowTime - lastTime;
      pointDis = nowPoint - lastPoint;


      lastTime = nowTime;
      lastPoint = nowPoint;
      /*
      * 橡皮筋效果：
      * 在move的过程中，每一次touchmove真正的有效距离在慢慢变小，元素的滑动距离还是在变大
      * translateX = elementX + disX*scale必须在判断语句内部，因为只有在判断内部的时候才需要出现橡皮筋效果；
      */
      var translateX = elementX+disX
      if(translateX > 0){
        item.handMove = true;
        //var scale = 1- translateX/document.documentElement.clientWidth;
        // scale范围（0，1）
        var scale = document.documentElement.clientWidth/(translateX+document.documentElement.clientWidth);
        translateX = cl.css(item,"translateX") + pointDis*scale;
        //translateX = 0;
      }else if (translateX < miniX){
        item.handMove = true;
        var over = miniX - translateX;
        var scale = document.documentElement.clientWidth/(over+document.documentElement.clientWidth);
        translateX = cl.css(item,"translateX") + pointDis*scale;
      }
      cl.css(item,"translateX",translateX);

    })
    wrap.addEventListener('touchend',function () {
      // 只有在不是手动滑屏的时候，才会触动快速滑屏
      var translateX = cl.css(item,"translateX")
      if(!item.handMove){
        // 最后一次结束滑屏时的速度,速度越大最终位移越远
        var speed = pointDis/timeDis;
        speed = Math.abs(speed) < 0.5?0:speed;
        var targetX = translateX + speed*200;

        var time = Math.abs(speed)*0.2;
        time = time < 0.7? 0.7:time;
        time = time > 2 ? 2:time;
        // 利用贝塞尔曲线来实现快速滑屏的橡皮筋效果；
        var bsr = '';
        if(targetX > 0){
          targetX = 0;
          bsr = "cubic-bezier(.26,1.51,.68,1.54)";
        } else if (targetX < miniX) {
          targetX = miniX;
          bsr = "cubic-bezier(.26,1.51,.68,1.54";
        }
        item.style.transition = time + "s " + bsr+ " transform";
        cl.css(item,"translateX",targetX);
      }else{
        //var translateX = cl.css(item,"translateX");
        item.style.transition = ".7s transform";
        if(translateX > 0){
          translateX = 0;
          cl.css(item,"translateX",translateX);
        } else if (translateX < miniX) {
          translateX = miniX;
          cl.css(item,"translateX",translateX);
        }
      }
    })
  }
  // 纵向滑屏需要防抖动，且要即点即停
  w.cl.slideScreenV = function (wrap,callBack) {
    // 滑屏元素
    var item = wrap.children[0];
    cl.css(item,"translateZ",0.1);
    // 元素一开始的位置和手指一开始的位置
    var start = {};
    var element = {};
    var minY = wrap.clientHeight - item.offsetHeight;
    // 快速滑屏的必要参数
    var lastTime = 0;
    var lastPoint = 0;
    var timeDis = 1;
    var pointDis = 0;

    var isY = true;
    var isFirst = true;

    // 即点即停
    var cleartime = 0;
    var Tween = {
      Linear:function (t,b,c,d) { return c*t/d + b ;},
      back: function(t,b,c,d,s){
        if (s == undefined) s = 1.70158;
        return c*((t=t/d-1)*t*((s+1)*t + s) + 1) + b;
      }
    }

    wrap.addEventListener('touchstart',function (ev) {
      ev = ev || event;
      var touchC = ev.changedTouches[0];
      // 重置minY
      minY = wrap.clientHeight - item.offsetHeight;
      start = {clientX:touchC.clientX,clientY:touchC.clientY};
      element.y = cl.css(item,"translateY");
      element.x = cl.css(item,"translateX");
      item.style.transition = "none";

      lastTime = new Date().getTime();
      lastPoint = touchC.clientY;

      // 解决bug一：清除速度的残留
      pointDis = 0;
      item.handMove = false;

      isY = true;
      isFirst = true;
      // 即点即停
      clearInterval(cleartime);
      if(callBack && typeof callBack['start'] === 'function'){
        callBack['start'].call(item);
      }
    })
    wrap.addEventListener('touchmove',function (ev) {
      if(! isY){// 第二次及以后防抖动
        return;
      }

      ev = ev || event;
      var touchC = ev.changedTouches[0];
      var now = touchC;
      var dis = {};
      dis.y = now.clientY - start.clientY;
      dis.x = now.clientX - start.clientX;
      var translateY = element.y + dis.y;

      if(isFirst){// 第一次防抖动
        isFirst == false;
        if (Math.abs(dis.x) > Math.abs(dis.y)){
          isY = false;
          return;
        }
      }

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
      var translateY = element.y + dis.y;
      if(translateY > 0){
        item.handMove = true;
        //var scale = 1- translateY/document.documentElement.clientHeight;
        // scale范围（0，1）
        var scale = document.documentElement.clientHeight/((document.documentElement.clientHeight+over)*1.5);
        translateY = cl.css(item,"translateY") + pointDis*scale;
        //translateY = 0;
      }else if (translateY < minY){
        item.handMove = true;
        var over = minY - translateY;
        var scale = document.documentElement.clientHeight/((document.documentElement.clientHeight+over)*1.5);
        translateY = cl.css(item,"translateY") + pointDis*scale;
      }
      cl.css(item,"translateY",translateY);
      if(callBack && typeof callBack['move'] === 'function'){
        callBack['move'].call(item);
      }

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
        // var bsr = '';
        var type = 'Linear';
        if(targetY > 0){
          targetY = 0;
          type = 'back';
          // bsr = "cubic-bezier(.26,1.51,.68,1.54)";
        } else if (targetY < minY) {
          targetY = minY;
          type = 'back';
          // bsr = "cubic-bezier(.26,1.51,.68,1.54";
        }
       /* item.style.transition = time + "s " + bsr + " transform";
        cl.css(item,"translateY",targetY);*/
       bsr(type,targetY,time);
      }else{
        //var translateY = cl.css(item,"translateY");
        item.style.transition = ".7s transform";
        if(translateY > 0){
          translateY = 0;
          cl.css(item,"translateY",translateY);
        } else if (translateY < minY) {
          translateY = minY;
          cl.css(item,"translateY",translateY);
        }
        if(callBack && typeof callBack['end'] === 'function'){
          callBack['end'].call(item);
        }
      }
    })
    // 定义tween类来实现动画效果
    function bsr(type,targetY,time) {
      clearInterval(cleartime);
      // 记录当前次数
      var t = 0;
      // 初始位置
      var b = cl.css(item,"translateY");
      // 初始位置与最终位置的差值
      var c = targetY - b;
      // 总次数
      var d = time * 1000 / (1000/60)
      cleartime = setInterval(function () {
        t++;

        if(callBack && typeof callBack['move'] === 'function'){
          callBack['move'].call(item);
        }

        var s = 1;
        if(t > d) {
          clearInterval(cleartime);
          if(callBack && typeof callBack['end'] === 'function'){
            callBack['end'].call(item);
          }
        }
        // point相当于每一帧的状态
        var point = Tween[type](t,b,c,d);
        cl.css(item,"translateY",point);
      },1000/60)
    }
  }
})(window)