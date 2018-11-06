'use strict';

/**
 * Сделано задание на звездочку
 * Реализованы методы several и through
 */
const isStar = true;

/**
 * Возвращает новый emitter
 * @returns {Object}
 */
function getEmitter() {
    return {
        functions: new Map(),

        addFunc: function (event, context, handler, info = {}) {
            if (!this.functions.has(context)) {
                this.functions.set(context, new Map());
            }
            const contextMap = this.functions.get(context);
            if (contextMap.has(event)) {
                contextMap.get(event).handlers.push(handler);
            } else {
                info.callsCount = 0;
                info.handlers = [handler];
                contextMap.set(event, info);
            }
        },

        /**
         * Подписаться на событие
         * @param {String} event
         * @param {Object} context
         * @param {Function} handler
         * @returns {Object}
         */
        on: function (event, context, handler) {
            this.addFunc(event, context, handler);

            return this;
        },

        checkNamespace: function (eventToCheck, baseEvent) {
            return eventToCheck === baseEvent ||
            (eventToCheck.startsWith(baseEvent) && eventToCheck[baseEvent.length] === '.');
        },

        /**
         * Отписаться от события
         * @param {String} event
         * @param {Object} context
         * @returns {Object}
         */
        off: function (event, context) {
            if (this.functions.has(context)) {
                this.functions.get(context).forEach((info, curEvent) => {
                    if (this.checkNamespace(curEvent, event)) {
                        this.functions.get(context).delete(curEvent);
                    }
                });
            }

            return this;
        },

        checkCallsCount: function (info) {
            return !('times' in info && info.times > 0 && info.callsCount >= info.times) &&
            !('frequency' in info && info.frequency > 0 && info.callsCount % info.frequency !== 0);
        },

        handleEvent: function (event) {
            this.functions.forEach((infoByEvent, context) => {
                if (infoByEvent.has(event)) {
                    const info = infoByEvent.get(event);
                    if (this.checkCallsCount(info)) {
                        info.handlers.forEach(handler => handler.call(context));
                    }
                    info.callsCount++;
                    console.info(info, event, context);
                }
            });
        },

        /**
         * Уведомить о событии
         * @param {String} event
         * @returns {Object}
         */
        emit: function (event) {
            let prefix = '';
            const allEvents = [];

            for (let i = 0; i < event.length; i++) {
                prefix += event[i];
                if (i + 1 === event.length || event[i + 1] === '.') {
                    allEvents.push(prefix);
                }
            }

            allEvents.reverse().forEach(curEvent => this.handleEvent(curEvent));

            return this;
        },

        /**
         * Подписаться на событие с ограничением по количеству полученных уведомлений
         * @star
         * @param {String} event
         * @param {Object} context
         * @param {Function} handler
         * @param {Number} times – сколько раз получить уведомление
         * @returns {Object}
         */
        several: function (event, context, handler, times) {
            this.addFunc(event, context, handler, { times });

            return this;
        },

        /**
         * Подписаться на событие с ограничением по частоте получения уведомлений
         * @star
         * @param {String} event
         * @param {Object} context
         * @param {Function} handler
         * @param {Number} frequency – как часто уведомлять
         * @returns {Object}
         */
        through: function (event, context, handler, frequency) {
            this.addFunc(event, context, handler, { frequency });

            return this;
        }
    };
}

module.exports = {
    getEmitter,

    isStar
};
