(function (window) {
    if (!window.juggle) window.juggle = {};
    var tools = window.juggle.tools;
    var jugglerEventType = window.juggle.jugglerEventType;
    var EventDispatcher = window.juggle.EventDispatcher;
    /**
     * 创建回调
     * @param call 回调函数
     * @param delay 间隔
     * @param args 携带参数
     * @constructor
     */
    var DelayedCall = function (call, delay, args) {
        this.mCurrentTime = null;
        this.mTotalTime = null;
        this.mCall = null;
        this.mArgs = null;
        //重复次数，0为无限次数
        this.mRepeatCount = null;
        this.reset = function (call, delay, args) {
            if (tools.isNull(args)) {
                args = null;
            }
            this.mCurrentTime = 0;
            this.mTotalTime = Math.max(delay, 0.0001);
            this.mCall = call;
            this.mArgs = args;
            this.mRepeatCount = 1;
            return this;
        };
        this.advanceTime = function (time) {
            var previousTime = this.mCurrentTime;
            this.mCurrentTime = Math.min(this.mTotalTime, this.mCurrentTime + time);
            if (this.mCurrentTime === this.mTotalTime) {
                if (this.mRepeatCount === 0 || this.mRepeatCount > 1) {
                    if (this.mRepeatCount > 0)
                        this.mRepeatCount -= 1;
                    this.mCurrentTime = 0;
                    if (this.mArgs === null) {
                        this.mCall.call(this);
                    } else {
                        this.mCall.call(this, this.mArgs);
                    }
                    // 精确一点时间都不浪费
                    this.advanceTime((previousTime + time) - this.mTotalTime);
                } else {
                    //保存回调的函数和参数
                    var call = this.mCall;
                    var args = this.mArgs;
                    this.dispatchEventWith(jugglerEventType.REMOVE_FROM_JUGGLER);
                    call.call(this, args);
                }
            }
        };
        /**
         * 如果mRepeatCount不会再减1，并且mCurrentTime也不会再改变了
         * @returns {boolean}
         */
        this.isComplete = function () {
            return this.mRepeatCount === 1 && this.mCurrentTime === this.mTotalTime;
        };
        this.reset(call, delay, args);
        EventDispatcher.apply(this);
    };
    window.juggle.DelayedCall = DelayedCall;
})(window);
(function (window) {
    if (!window.juggle) window.juggle = {};
    var tools = window.juggle.tools;
    var DelayedCall = window.juggle.DelayedCall;
    var DelayedCallPool = function () {
        this.sDelayedCallPool = [];

        this.fromPool = function (call, delay, args) {
            if (tools.isNull(args)) {
                args = null;
            }
            if (this.sDelayedCallPool.length)
                return this.sDelayedCallPool.pop().reset(call, delay, args);
            else {
                return new DelayedCall(call, delay, args);
            }
        };
        this.toPool = function (delayedCall) {
            delayedCall.mCall = null;
            delayedCall.mArgs = null;
            this.sDelayedCallPool[this.sDelayedCallPool.length] = delayedCall;
        }
    };
    window.juggle.delayedCallPool = new DelayedCallPool();
})(window);