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

        addFunc: function (event, context, info) {
            if (!this.functions.has(context)) {
                this.functions.set(context, new Map());
            }
            info.callsCount = 0;
            this.functions.get(context).set(event, info);
        },

        /**
         * Подписаться на событие
         * @param {String} event
         * @param {Object} context
         * @param {Function} handler
         * @returns {Object}
         */
        on: function (event, context, handler) {
            this.addFunc(event, context, { handler });

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

        handleEvent: function (event) {
            this.functions.forEach((infoByEvent, context) => {
                if (infoByEvent.has(event)) {
                    const info = infoByEvent.get(event);
                    if (!('times' in info && info.callsCount >= info.times) &&
                    !('frequency' in info && info.callsCount % info.frequency !== 0)) {
                        info.handler.call(context);
                    }
                    info.callsCount++;
                }
            });
        },

        /**
         * Уведомить о событии
         * @param {String} event
         * @returns {Object}
         */
        emit: function (event) {
            this.handleEvent(event);

            const pointIndex = event.indexOf('.');
            if (pointIndex !== -1) {
                this.handleEvent(event.slice(0, pointIndex));
            }

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
            this.addFunc(event, context, { handler, times });

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
            this.addFunc(event, context, { handler, frequency });

            return this;
        }
    };
}

module.exports = {
    getEmitter,

    isStar
};
