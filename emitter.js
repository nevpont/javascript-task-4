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

        /**
         * Подписаться на событие
         * @param {String} event
         * @param {Object} context
         * @param {Function} handler
         * @param {Object} info
         * @returns {Object}
         */
        on: function (event, context, handler, info = {}) {
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

            return this;
        },

        _checkNamespace: function (eventToCheck, baseEvent) {
            return eventToCheck === baseEvent || eventToCheck.startsWith(`${baseEvent}.`);
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
                    if (this._checkNamespace(curEvent, event)) {
                        this.functions.get(context).delete(curEvent);
                    }
                });
            }

            return this;
        },

        _checkCallsCount: function (info) {
            return !('times' in info && info.times > 0 && info.callsCount >= info.times) &&
            !('frequency' in info && info.frequency > 0 && info.callsCount % info.frequency !== 0);
        },

        _handleEvent: function (event) {
            this.functions.forEach((infoByEvent, context) => {
                if (infoByEvent.has(event)) {
                    const info = infoByEvent.get(event);
                    if (this._checkCallsCount(info)) {
                        info.handlers.forEach(handler => handler.call(context));
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
            const eventParts = event.split('.');
            let prefix = eventParts[0];
            const allEvents = [prefix];

            for (let i = 1; i < eventParts.length; i++) {
                prefix = `${prefix}.${eventParts[i]}`;
                allEvents.push(prefix);
            }

            allEvents.reverse().forEach(curEvent => this._handleEvent(curEvent));

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
            return this.on(event, context, handler, { times });
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
            return this.on(event, context, handler, { frequency });
        }
    };
}

module.exports = {
    getEmitter,

    isStar
};
